import React, { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trophy, Medal } from "lucide-react";
import { getNakamaSession, getNakamaSocket, getUserStats } from "../../../lib/nakama";

interface LeaderboardModalProps {
  show: boolean;
  onClose: () => void;
  username: string | null;
}

interface LeaderboardRecord {
  username: string;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  maxStreak: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = memo(({ show, onClose, username }) => {
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;

    let isMounted = true;
    let socket: any = null;

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { getNakamaSession, getLeaderboard } = await import("../../../lib/nakama");
        const session = await getNakamaSession(username || "guest");
        
        // Fetch real leaderboard records
        const records = await getLeaderboard(session);
        console.log("Raw leaderboard records from Nakama:", records);
        
        if (!isMounted) return;

        const mappedRecords: LeaderboardRecord[] = records.map(r => {
          let meta: any = {};
          try {
            meta = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;
          } catch (e) {
            console.warn("Could not parse metadata for user:", r.username);
          }
          
          return {
            username: r.username || "Anonymous",
            wins: Number(r.score) || 0,
            losses: meta?.losses || 0,
            draws: meta?.draws || 0,
            streak: meta?.streak || 0,
            maxStreak: meta?.maxStreak || 0
          };
        });

        console.log("Mapped records for UI:", mappedRecords);
        setRecords(mappedRecords);

      } catch (e) {
        console.error("Failed to fetch Nakama leaderboard:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLeaderboard();

    return () => {
      isMounted = false;
      if (socket) {
        // We don't want to overwrite other handlers if they exist, but for now it's fine
        socket.onchannelmessage = null;
      }
    };
  }, [show, username]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-xl">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">Global Ranking</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="py-12 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
                    />
                  </div>
                ) : records.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Medal className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-slate-500 font-medium">No records yet. Be the first!</p>
                  </div>
                ) : (
                  records.map((record, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={i}
                      className={`flex flex-col p-4 rounded-2xl border transition-all ${
                        record.username === username 
                          ? "bg-blue-500/10 border-blue-500/20" 
                          : "bg-white/5 border-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-black w-6 ${
                            i === 0 ? "text-yellow-500" : 
                            i === 1 ? "text-slate-400" : 
                            i === 2 ? "text-amber-700" : "text-slate-600"
                          }`}>
                            {i + 1}.
                          </span>
                          <span className="font-bold tracking-tight">
                            {record.username} {record.username === username && <span className="text-blue-400 text-xs ml-1">(you)</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-blue-400 text-lg">{record.wins}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Wins</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
                        <div className="text-center">
                          <div className="text-xs font-bold text-rose-400">{record.losses}</div>
                          <div className="text-[8px] text-slate-500 uppercase font-black">Losses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-slate-300">{record.draws}</div>
                          <div className="text-[8px] text-slate-500 uppercase font-black">Draws</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-orange-400">{record.streak}</div>
                          <div className="text-[8px] text-slate-500 uppercase font-black">Streak</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-yellow-500">{record.maxStreak}</div>
                          <div className="text-[8px] text-slate-500 uppercase font-black">Best</div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

LeaderboardModal.displayName = "LeaderboardModal";
