"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { useGame } from "../hooks/useGame";
import { NicknameScreen } from "./NicknameScreen";
import { IdleScreen } from "./IdleScreen";
import { MatchmakingScreen } from "./MatchmakingScreen";
import { ActiveGameScreen } from "./ActiveGameScreen";
import { ResultScreen } from "./ResultScreen";
import { LeaderboardModal } from "./LeaderboardModal";

export function GameClient() {
  const [mounted, setMounted] = useState(false);
  const username = useGameStore((state) => state.username);
  const setUsername = useGameStore((state) => state.setUsername);
  const status = useGameStore((state) => state.status);
  const userId = useGameStore((state) => state.userId);
  const turn = useGameStore((state) => state.turn);
  const winner = useGameStore((state) => state.winner);
  const isDraw = useGameStore((state) => state.isDraw);
  const symbol = useGameStore((state) => state.symbol);
  const reset = useGameStore((state) => state.reset);
  const opponent = useGameStore((state) => state.opponent);
  const deadline = useGameStore((state) => state.deadline);
  const mode = useGameStore((state) => state.mode);
  const connected = useGameStore((state) => state.connected);
  const error = useGameStore((state) => state.error);
  const setError = useGameStore((state) => state.setError);

  const { joinMatchmaking, cancelMatchmaking, leaveMatch, handleTimeout } = useGame();
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  const isMyTurn = useMemo(() => turn === userId, [turn, userId]);

  useEffect(() => {
    setMounted(true);
    const savedUsername = localStorage.getItem("ttt_username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, [setUsername]);

  useEffect(() => {
    console.log("Timer effect:", { status, deadline });
    if (status === "active" && deadline > 0) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
        setTimeLeft(remaining);
        
        // Handle timeout
        if (remaining === 0 && isMyTurn) {
          handleTimeout();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, deadline, isMyTurn, handleTimeout]);

  useEffect(() => {
    if (status === "finished" && username) {
      import("../../../lib/nakama").then(({ getNakamaSession, updateUserStats }) => {
        getNakamaSession(username).then(session => {
          if (isDraw) {
            updateUserStats(session, { isDraw: true });
          } else if (winner === symbol) {
            updateUserStats(session, { isWin: true });
          } else if (winner && winner !== "draw") {
            updateUserStats(session, { isLoss: true });
          }
        });
      });
    }
  }, [status, isDraw, winner, symbol, username]);

  const handleSetUsername = useCallback(async (name: string) => {
    try {
      const { getNakamaSession } = await import("../../../lib/nakama");
      await getNakamaSession(name);
      setUsername(name);
    } catch (e: any) {
      setError({ 
        title: "Username Taken", 
        message: e.message || "This username is already in use. Please choose another." 
      });
    }
  }, [setUsername, setError]);

  const handleLeaveMatch = useCallback(() => {
    setShowLeaveConfirmation(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-blue-500/30 overflow-hidden">
      <AnimatePresence>
        {showLeaveConfirmation && (
          <motion.div
            key="leave-confirmation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e293b] border border-white/10 p-6 rounded-3xl shadow-2xl w-full max-w-sm"
            >
              <h2 className="text-xl font-black mb-2">Leave Match?</h2>
              <p className="text-slate-400 text-sm mb-6">Are you sure you want to leave the match? This will count as a loss.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaveConfirmation(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLeaveConfirmation(false);
                    leaveMatch();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 font-bold text-sm transition-colors"
                >
                  Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {error && (
          <motion.div
            key="error-notification"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 z-100 w-full max-w-md px-6 py-4 bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl rounded-2xl flex items-center gap-4 shadow-xl shadow-rose-500/5"
          >
            <button 
              onClick={() => setError(null)}
              className="p-2 bg-rose-500/20 rounded-lg hover:bg-rose-500/30 transition-colors"
            >
              <X className="w-5 h-5 text-rose-500" />
            </button>
            <div className="flex-1">
              <p className="text-sm font-bold text-rose-200">{error.title}</p>
              <p className="text-xs text-rose-400/80 line-clamp-1">{error.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!username && (
          <NicknameScreen onSetUsername={handleSetUsername} />
        )}

        {username && status === "idle" && (
          <IdleScreen 
            username={username} 
            connected={connected}
            onJoinMatchmaking={joinMatchmaking} 
            onShowLeaderboard={() => setShowLeaderboard(true)} 
          />
        )}

        {status === "matchmaking" && (
          <MatchmakingScreen onCancel={cancelMatchmaking} />
        )}

        {status === "active" && (
          <ActiveGameScreen 
            username={username || ""} 
            opponent={opponent || ""} 
            isMyTurn={isMyTurn} 
            timeLeft={timeLeft} 
            mode={mode || "classic"}
            onLeave={handleLeaveMatch} 
          />
        )}

        {status === "finished" && (
          <ResultScreen 
            isDraw={isDraw} 
            winner={winner} 
            symbol={symbol} 
            username={username || ""} 
            onReset={reset} 
          />
        )}
      </AnimatePresence>

      <LeaderboardModal 
        show={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
        username={username} 
      />
    </div>
  );
}
