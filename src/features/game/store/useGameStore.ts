import { create } from "zustand";

interface GameState {
  username: string | null;
  matchId: string | null;
  symbol: "X" | "O" | null;
  opponent: string | null;
  opponentUserId: string | null;
  board: (string | null)[];
  turn: string | null;
  winner: string | null;
  isDraw: boolean;
  deadline: number;
  status: "idle" | "matchmaking" | "active" | "finished";
  mode: "classic" | "timed" | null;
  userId: string | null;
  connected: boolean;
  error: { title: string; message: string } | null;
  
  setUsername: (username: string | null) => void;
  setMatchId: (matchId: string | null) => void;
  setSymbol: (symbol: "X" | "O" | null) => void;
  setOpponent: (opponent: string | null) => void;
  setOpponentUserId: (opponentUserId: string | null) => void;
  setBoard: (board: (string | null)[]) => void;
  setTurn: (turn: string | null) => void;
  setWinner: (winner: string | null) => void;
  setIsDraw: (isDraw: boolean) => void;
  setDeadline: (deadline: number) => void;
  setStatus: (status: "idle" | "matchmaking" | "active" | "finished") => void;
  setMode: (mode: "classic" | "timed" | null) => void;
  setUserId: (userId: string | null) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: { title: string; message: string } | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  username: null,
  matchId: null,
  symbol: null,
  opponent: null,
  opponentUserId: null,
  board: Array(9).fill(null),
  turn: null,
  winner: null,
  isDraw: false,
  deadline: 0,
  status: "idle",
  mode: null,
  userId: null,
  connected: false,
  error: null,

  setUsername: (username) => {
    if (username && typeof window !== "undefined") localStorage.setItem("ttt_username", username);
    set({ username });
  },
  setMatchId: (matchId) => set({ matchId }),
  setSymbol: (symbol) => set({ symbol }),
  setOpponent: (opponent) => set({ opponent }),
  setOpponentUserId: (opponentUserId) => set({ opponentUserId }),
  setBoard: (board) => set({ board }),
  setTurn: (turn) => set({ turn }),
  setWinner: (winner) => set({ winner }),
  setIsDraw: (isDraw) => set({ isDraw }),
  setDeadline: (deadline) => set({ deadline }),
  setStatus: (status) => set({ status }),
  setMode: (mode) => set({ mode }),
  setUserId: (userId) => set({ userId }),
  setConnected: (connected) => set({ connected }),
  setError: (error) => set({ error }),
  reset: () => set({
    matchId: null,
    symbol: null,
    opponent: null,
    opponentUserId: null,
    board: Array(9).fill(null),
    turn: null,
    winner: null,
    isDraw: false,
    deadline: 0,
    status: "idle",
    mode: null,
    error: null,
  }),
}));
