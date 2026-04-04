import React, { memo } from "react";
import { motion } from "motion/react";
import { Trophy, RefreshCw, X } from "lucide-react";

interface ResultScreenProps {
  isDraw: boolean;
  winner: string | null;
  symbol: "X" | "O" | null;
  username: string;
  onReset: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = memo(({ isDraw, winner, symbol, username, onReset }) => {
  return (
    <motion.div
      key="finished"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-8 max-w-md w-full"
    >
      <div className="space-y-4">
        {isDraw ? (
          <div className="p-6 bg-slate-500/10 rounded-3xl border border-slate-500/20 inline-block">
            <RefreshCw className="w-16 h-16 text-slate-400" />
          </div>
        ) : (
          <div className={`p-6 rounded-3xl border inline-block ${winner === symbol ? "bg-yellow-500/10 border-yellow-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
            {winner === symbol ? (
              <Trophy className="w-16 h-16 text-yellow-400" />
            ) : (
              <X className="w-16 h-16 text-rose-400" />
            )}
          </div>
        )}
        
        <h2 className="text-5xl font-black tracking-tighter">
          {isDraw ? "IT'S A DRAW!" : winner === symbol ? "WINNER!" : "DEFEAT!"}
        </h2>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onReset}
        className="w-full py-5 bg-blue-600 text-white rounded-2xl text-xl font-bold shadow-xl transition-colors"
      >
        Play Again
      </motion.button>
    </motion.div>
  );
});

ResultScreen.displayName = "ResultScreen";
