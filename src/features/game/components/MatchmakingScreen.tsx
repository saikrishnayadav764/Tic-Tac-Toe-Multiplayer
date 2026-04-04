import React, { memo } from "react";
import { motion } from "motion/react";
import { Users } from "lucide-react";

interface MatchmakingScreenProps {
  onCancel: () => void;
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = memo(({ onCancel }) => {
  return (
    <motion.div
      key="matchmaking"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="text-center space-y-8"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 border-4 border-blue-500/20 border-t-blue-500 rounded-full mx-auto"
        />
        <Users className="w-10 h-10 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Finding a random player...</h2>
        <p className="text-slate-400 animate-pulse">It usually takes 26 seconds.</p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
        >
          Cancel
        </motion.button>
      </div>
    </motion.div>
  );
});

MatchmakingScreen.displayName = "MatchmakingScreen";
