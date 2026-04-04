import React, { memo } from "react";
import { motion } from "motion/react";
import { Board } from "./Board";

interface ActiveGameScreenProps {
  username: string;
  opponent: string;
  isMyTurn: boolean;
  timeLeft: number;
  mode: "classic" | "timed";
  onLeave: () => void;
}

export const ActiveGameScreen: React.FC<ActiveGameScreenProps> = memo(({ username, opponent, isMyTurn, timeLeft, mode, onLeave }) => {
  return (
    <motion.div
      key="active"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-lg space-y-8"
    >
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-sm font-bold text-blue-400 uppercase tracking-widest">{username}</div>
            <div className="text-xs text-slate-500">(you)</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-sm font-bold text-rose-400 uppercase tracking-widest">{opponent}</div>
            <div className="text-xs text-slate-500">(opp)</div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isMyTurn ? "bg-green-400" : "bg-slate-600"}`} />
            <div className={`text-xl font-black ${isMyTurn ? "text-green-400" : "text-slate-400"}`}>
              {isMyTurn ? "Your Turn" : "Opponent Turn"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${
              mode === "timed" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"
            }`}>
              {mode}
            </span>
            {mode === "timed" && (
              <div className={`text-sm font-bold font-mono ${timeLeft < 10 ? "text-rose-400 animate-pulse" : "text-slate-500"}`}>
                {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:{(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            )}
          </div>
        </div>
      </div>

      <Board />

      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLeave}
          className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
        >
          Leave room
        </motion.button>
      </div>
    </motion.div>
  );
});

ActiveGameScreen.displayName = "ActiveGameScreen";
