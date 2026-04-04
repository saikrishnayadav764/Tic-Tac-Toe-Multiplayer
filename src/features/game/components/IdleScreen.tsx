import React, { memo, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Swords, Users, BarChart3, Zap, Shield, Trophy } from "lucide-react";
import { getNakamaSession, getUserStats, UserStats } from "../../../lib/nakama";

interface IdleScreenProps {
  username: string;
  connected: boolean;
  onJoinMatchmaking: (mode: "classic" | "timed") => void;
  onShowLeaderboard: () => void;
}

export const IdleScreen: React.FC<IdleScreenProps> = memo(({ username, connected, onJoinMatchmaking, onShowLeaderboard }) => {
  const [selectedMode, setSelectedMode] = useState<"classic" | "timed">("classic");
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (username) {
      getNakamaSession(username).then(session => {
        getUserStats(session).then(userStats => {
          if (isMounted) {
            setStats(userStats);
          }
        });
      });
    }
    return () => { isMounted = false; };
  }, [username]);

  return (
    <motion.div
      key="idle"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-8 max-w-md w-full"
    >
      <div className="space-y-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block p-4 bg-blue-500/10 rounded-3xl border border-blue-500/20"
        >
          <Swords className="w-16 h-16 text-blue-400" />
        </motion.div>
        <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
          TIC-TAC-TOE
        </h1>
        <p className="text-slate-400 text-lg font-medium">
          Welcome back, <span className="text-blue-400">{username}</span>
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-2 p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-center">
            <div className="text-xl font-black text-blue-400">{stats.wins}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-rose-400">{stats.losses}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Losses</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-slate-300">{stats.draws}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Draws</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-yellow-500">{stats.streak}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Streak</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 rounded-2xl border border-white/10">
          <button
            onClick={() => setSelectedMode("classic")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              selectedMode === "classic" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Shield className="w-4 h-4" />
            Classic
          </button>
          <button
            onClick={() => setSelectedMode("timed")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              selectedMode === "timed" 
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" 
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Zap className="w-4 h-4" />
            Timed
          </button>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <motion.button
            layout
            initial={false}
            animate={connected ? { 
              backgroundColor: selectedMode === "classic" ? "rgb(37, 99, 235)" : "rgb(225, 29, 72)",
              boxShadow: selectedMode === "classic" 
                ? "0 20px 25px -5px rgba(37, 99, 235, 0.2)" 
                : "0 20px 25px -5px rgba(225, 29, 72, 0.2)"
            } : { backgroundColor: "rgb(51, 65, 85)" }}
            whileHover={connected ? { 
              scale: 1.02, 
              backgroundColor: selectedMode === "classic" ? "rgb(59, 130, 246)" : "rgb(244, 63, 94)" 
            } : {}}
            whileTap={connected ? { scale: 0.98 } : {}}
            onClick={() => onJoinMatchmaking(selectedMode)}
            disabled={!connected}
            className={`w-full py-5 rounded-2xl text-xl font-bold transition-all flex items-center justify-center gap-3 ${
              !connected ? "text-slate-500 cursor-not-allowed opacity-50" : "text-white"
            }`}
          >
            {connected ? (
              <>
                <Users className="w-6 h-6" />
                Find {selectedMode === "classic" ? "Classic" : "Timed"} Match
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full"
                />
                Connecting...
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onShowLeaderboard}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-lg font-bold transition-colors flex items-center justify-center gap-3"
          >
            <BarChart3 className="w-5 h-5" />
            Leaderboard
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

IdleScreen.displayName = "IdleScreen";
