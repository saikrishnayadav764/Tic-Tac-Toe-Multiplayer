import React, { useState, memo } from "react";
import { motion } from "motion/react";
import { User, ChevronRight } from "lucide-react";

interface NicknameScreenProps {
  onSetUsername: (username: string) => void;
}

export const NicknameScreen: React.FC<NicknameScreenProps> = memo(({ onSetUsername }) => {
  const [tempUsername, setTempUsername] = useState("");

  const handleSubmit = () => {
    if (tempUsername.trim()) {
      onSetUsername(tempUsername.trim());
    }
  };

  return (
    <motion.div
      key="nickname"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="w-full max-w-md p-8 bg-slate-800/50 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl text-center space-y-8"
    >
      <div className="space-y-4">
        <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto border border-blue-500/30">
          <User className="w-10 h-10 text-blue-400" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Who are you?</h1>
        <p className="text-slate-400">Enter a nickname to join the arena</p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nickname"
          value={tempUsername}
          onChange={(e) => setTempUsername(e.target.value)}
          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!tempUsername.trim()}
          onClick={handleSubmit}
          className="w-full py-4 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-lg font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
});

NicknameScreen.displayName = "NicknameScreen";
