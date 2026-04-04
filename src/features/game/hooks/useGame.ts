import { useEffect, useCallback, useRef } from "react";
import { useGameStore } from "../store/useGameStore";
import { nakamaClient, getNakamaSession, getNakamaSocket } from "../../../lib/nakama";
import { Session, Socket } from "@heroiclabs/nakama-js";

import { 
  OP_MOVE, 
  OP_STATE, 
  WINNING_COMBINATIONS, 
  DEFAULT_TURN_TIME_MS 
} from "../../../lib/constants";

export const useGame = () => {
  const {
    username,
    setMatchId,
    setSymbol,
    setOpponent,
    setOpponentUserId,
    setBoard,
    setTurn,
    setWinner,
    setIsDraw,
    setDeadline,
    setStatus,
    setMode,
    setUserId,
    matchId,
    setConnected,
    setError,
    reset,
    status,
    opponentUserId
  } = useGameStore();

  const socketRef = useRef<Socket | null>(null);
  const ticketRef = useRef<string | null>(null);
  const matchIdRef = useRef<string | null>(null);
  const statusRef = useRef<string>("idle");
  const opponentUserIdRef = useRef<string | null>(null);

  // Keep refs in sync with state for use in callbacks
  useEffect(() => {
    matchIdRef.current = matchId;
    statusRef.current = status;
    opponentUserIdRef.current = opponentUserId;
  }, [matchId, status, opponentUserId]);

  useEffect(() => {
    if (typeof window === "undefined" || !username) return;

    let isMounted = true;

    const initNakama = async () => {
      try {
        setError(null);
        const session = await getNakamaSession(username);
        if (!isMounted) return;

        const socket = await getNakamaSocket(session);
        if (!isMounted) return;

        socketRef.current = socket;
        setUserId(session.user_id || null);
        setConnected(true);

        socket.onmatchmakermatched = async (matched) => {
          console.log("Matchmaker matched:", matched);
          ticketRef.current = null; // Clear ticket since it's matched
          const match = await socket.joinMatch(matched.match_id, matched.token);
          setMatchId(match.match_id);
          
          // Use matched.users instead of match.presences to ensure both clients see the same list
          const matchedUsers = matched.users || [];
          const me = matchedUsers.find((u: any) => u.presence.user_id === session.user_id)?.presence || match.self;
          const other = matchedUsers.find((u: any) => u.presence.user_id !== session.user_id)?.presence;
          
          setOpponent(other?.username || "Opponent");
          setOpponentUserId(other?.user_id || null);
          
          // Sort users by user_id to ensure consistent ordering across clients
          const allUsers = [me, ...(other ? [other] : [])].sort((a, b) => a.user_id.localeCompare(b.user_id));
          const isFirst = allUsers[0]?.user_id === session.user_id;
          
          setSymbol(isFirst ? "X" : "O");
          setTurn(allUsers[0]?.user_id || session.user_id || null);
          setBoard(Array(9).fill(null));
          setWinner(null);
          setIsDraw(false);
          setStatus("active");
          
          if (useGameStore.getState().mode === "timed") {
            setDeadline(Date.now() + DEFAULT_TURN_TIME_MS);
          }
        };

        socket.onmatchpresence = (presence) => {
          console.log("Match presence:", presence.leaves.length, "leaves,", presence.joins.length, "joins");
          
          if (presence.match_id === matchIdRef.current && statusRef.current === "active") {
            const opponentId = opponentUserIdRef.current;
            const opponentLeft = presence.leaves.some(p => p.user_id === opponentId);
            
            if (opponentLeft) {
              console.log("Opponent left the match! You win by default.");
              const currentSymbol = useGameStore.getState().symbol;
              setWinner(currentSymbol);
              setStatus("finished");
              setError("Opponent left the match. You win!");
            }
          }
        };

        socket.onmatchdata = (result) => {
          let data;
          try {
            if (result.data instanceof Uint8Array) {
              const decoded = new TextDecoder().decode(result.data);
              data = JSON.parse(decoded);
            } else if (typeof result.data === 'string') {
              // Sometimes it might be base64 encoded string if not decoded by client
              try {
                data = JSON.parse(result.data);
              } catch (e) {
                // Try base64 decode
                const decoded = atob(result.data);
                data = JSON.parse(decoded);
              }
            } else {
              data = result.data;
            }
          } catch (e) {
            console.error("Failed to parse match data:", e, result.data);
            return;
          }
          
          console.log("Match data received:", data, "op_code:", result.op_code);

          const opCode = Number(result.op_code);

          if (opCode === OP_STATE) {
            console.log("OP_STATE received:", data);
            if (data.board !== undefined) setBoard(data.board);
            if (data.turn !== undefined) setTurn(data.turn);
            if (data.winner !== undefined) {
              setWinner(data.winner);
              setIsDraw(data.winner === 'draw');
            }
            if (data.deadline !== undefined) setDeadline(data.deadline);
            if (data.mode !== undefined) setMode(data.mode);
            
            if (data.status === "finished") {
              setStatus("finished");
            }
          } else if (opCode === OP_MOVE) {
            // Handle relayed move
            const index = data.index;
            const moveSymbol = data.symbol;
            const currentBoard = useGameStore.getState().board;
            
            if (currentBoard[index] === null) {
              const newBoard = [...currentBoard];
              // The move was made by the opponent
              newBoard[index] = moveSymbol;
              setBoard(newBoard);
              
              let hasWinner = false;
              for (const combo of WINNING_COMBINATIONS) {
                const [a, b, c] = combo;
                if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
                  setWinner(newBoard[a]);
                  setStatus("finished");
                  hasWinner = true;
                  break;
                }
              }
              
              if (!hasWinner && !newBoard.includes(null)) {
                setIsDraw(true);
                setWinner("draw");
                setStatus("finished");
              } else if (!hasWinner) {
                // Change turn back to us
                setTurn(session.user_id || null);
                if (useGameStore.getState().mode === "timed") {
                  setDeadline(Date.now() + DEFAULT_TURN_TIME_MS);
                }
              }
            }
          }
        };


        (socket as any).onclose = () => {
          console.log("Nakama socket closed");
          setConnected(false);
        };

      } catch (e: any) {
        console.error("Nakama initialization error:", e);
        setError(e.message || "Failed to connect to Nakama server");
        setConnected(false);
        setStatus("idle");
      }
    };

    initNakama();

    return () => {
      isMounted = false;
    };
  }, [username, setUserId, setConnected, setMatchId, setOpponent, setOpponentUserId, setSymbol, setTurn, setStatus, setBoard, setWinner, setIsDraw, setDeadline, setMode, setError]);

  const joinMatchmaking = useCallback(async (mode: "classic" | "timed") => {
    if (socketRef.current && username) {
      console.log(`Joining Nakama matchmaking for ${mode} mode...`);
      setStatus("matchmaking");
      setMode(mode);
      
      const query = `+properties.mode:${mode}`;
      const minPlayers = 2;
      const maxPlayers = 2;
      const stringProperties = { mode };
      const numericProperties = {};
      
      const matchmakingTicket = await socketRef.current.addMatchmaker(
        query,
        minPlayers,
        maxPlayers,
        stringProperties,
        numericProperties
      );
      ticketRef.current = matchmakingTicket.ticket;
    }
  }, [username, setStatus, setMode]);

  const makeMove = useCallback((index: number) => {
    if (socketRef.current && matchId) {
      const currentSymbol = useGameStore.getState().symbol;
      const data = JSON.stringify({ index, symbol: currentSymbol });
      socketRef.current.sendMatchState(matchId, OP_MOVE, data);
      
      // Update local state for relayed match
      const currentBoard = useGameStore.getState().board;
      const opponent = useGameStore.getState().opponent;
      const sessionUserId = useGameStore.getState().userId;
      
      if (currentBoard[index] === null && currentSymbol) {
        const newBoard = [...currentBoard];
        newBoard[index] = currentSymbol;
        setBoard(newBoard);
        
        // Check for win/draw locally
        const winningCombinations = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
          [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
          [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        let hasWinner = false;
        for (const combo of winningCombinations) {
          const [a, b, c] = combo;
          if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
            setWinner(newBoard[a]);
            setStatus("finished");
            hasWinner = true;
            break;
          }
        }
        
        if (!hasWinner && !newBoard.includes(null)) {
          setIsDraw(true);
          setWinner("draw");
          setStatus("finished");
        } else if (!hasWinner) {
          // Change turn to opponent
          setTurn("opponent_turn"); 
          if (useGameStore.getState().mode === "timed") {
            setDeadline(Date.now() + DEFAULT_TURN_TIME_MS);
          }
        }
      }
    }
  }, [matchId, setBoard, setWinner, setStatus, setIsDraw, setTurn]);

  const cancelMatchmaking = useCallback(async () => {
    if (socketRef.current && ticketRef.current) {
      try {
        await socketRef.current.removeMatchmaker(ticketRef.current);
      } catch (e) {
        console.error("Failed to remove matchmaker ticket:", e);
      }
      ticketRef.current = null;
      setStatus("idle");
    }
  }, [setStatus]);

  const leaveMatch = useCallback(async () => {
    if (socketRef.current && matchId) {
      try {
        // If the game was active, it's a loss for the leaving player
        if (status === "active" && username) {
          const { getNakamaSession, updateUserStats } = await import("../../../lib/nakama");
          const session = await getNakamaSession(username);
          await updateUserStats(session, { isLoss: true });
          
          // Notify opponent of concession
          const currentSymbol = useGameStore.getState().symbol;
          const opponentSymbol = currentSymbol === "X" ? "O" : "X";
          const data = JSON.stringify({ 
            winner: opponentSymbol, 
            status: "finished",
            reason: "concession" 
          });
          socketRef.current.sendMatchState(matchId, OP_STATE, data);
        }
        
        await socketRef.current.leaveMatch(matchId);
      } catch (e) {
        console.error("Failed to leave match:", e);
        setError("Failed to leave match");
      } finally {
        reset();
      }
    } else {
      reset();
    }
  }, [matchId, status, username, reset, setError]);

  const handleTimeout = useCallback(() => {
    if (socketRef.current && matchId) {
      const currentSymbol = useGameStore.getState().symbol;
      const opponentSymbol = currentSymbol === "X" ? "O" : "X";
      
      console.log("Timer timed out! Defeat.");
      
      // Update local state
      setWinner(opponentSymbol);
      setStatus("finished");
      
      // Notify the opponent
      const data = JSON.stringify({ 
        winner: opponentSymbol, 
        status: "finished",
        reason: "timeout" 
      });
      socketRef.current.sendMatchState(matchId, OP_STATE, data);
    }
  }, [matchId, setWinner, setStatus]);

  return { joinMatchmaking, makeMove, cancelMatchmaking, leaveMatch, handleTimeout };
};
