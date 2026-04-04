import { Client, Session, Socket } from "@heroiclabs/nakama-js";

const NAKAMA_SERVER_KEY = process.env.NEXT_PUBLIC_NAKAMA_SERVER_KEY || "defaultkey";

const isBrowser = typeof window !== "undefined";

// When in browser, we point to the Next.js app itself to use the proxy
// This avoids Mixed Content errors when the app is on HTTPS but Nakama is on HTTP
const NAKAMA_HOST = process.env.NEXT_PUBLIC_NAKAMA_HOST || "127.0.0.1";
const NAKAMA_PORT = process.env.NEXT_PUBLIC_NAKAMA_PORT || "7350";
const NAKAMA_USE_SSL = process.env.NEXT_PUBLIC_NAKAMA_USE_SSL === "true";

export const nakamaClient = new Client(
  NAKAMA_SERVER_KEY,
  NAKAMA_HOST,
  NAKAMA_PORT,
  NAKAMA_USE_SSL
);

let nakamaSession: Session | null = null;
let nakamaSocket: Socket | null = null;

export const getNakamaSession = async (username: string): Promise<Session> => {
  if (nakamaSession && !nakamaSession.isexpired) {
    return nakamaSession;
  }

  // Use a simple custom ID based on username for demo/dev purposes
  // In production, you'd use authenticateDevice or authenticateEmail
  const customId = `ttt-user-${username}`;
  const session = await nakamaClient.authenticateCustom(customId, true, username);
  nakamaSession = session;
  
  // Sync current stats to the leaderboard on login
  getUserStats(session).then(() => {
    updateUserStats(session, {});
  }).catch(() => {});
  
  localStorage.setItem("nakama_session", session.token);
  return session;
};

export const getNakamaSocket = async (session: Session): Promise<Socket> => {
  if (nakamaSocket) {
    return nakamaSocket;
  }

  nakamaSocket = nakamaClient.createSocket(NAKAMA_USE_SSL, false);
  await nakamaSocket.connect(session, true);
  
  return nakamaSocket;
};

export const clearNakamaSession = () => {
  nakamaSession = null;
  if (nakamaSocket) {
    nakamaSocket.disconnect(true);
    nakamaSocket = null;
  }
  localStorage.removeItem("nakama_session");
};

export interface UserStats {
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  maxStreak: number;
}

export const getUserStats = async (session: Session): Promise<UserStats> => {
  try {
    const result = await nakamaClient.readStorageObjects(session, {
      object_ids: [{
        collection: "stats",
        key: "ttt",
        user_id: session.user_id
      }]
    });
    
    if (result.objects && result.objects.length > 0) {
      const val = (result.objects[0].value || {}) as any;
      return {
        wins: val.wins || 0,
        losses: val.losses || 0,
        draws: val.draws || 0,
        streak: val.streak || 0,
        maxStreak: val.maxStreak || 0
      };
    }
  } catch (e) {
    console.error("Failed to read user stats:", e);
  }
  
  return { wins: 0, losses: 0, draws: 0, streak: 0, maxStreak: 0 };
};

import { LEADERBOARD_ID, LEADERBOARD_FETCH_LIMIT, LEADERBOARD_AROUND_ME_LIMIT } from "./constants";

export const getLeaderboard = async (session: Session) => {
  try {
    // 1. Get Top 10 Global Players
    const topResult = await nakamaClient.listLeaderboardRecords(session, LEADERBOARD_ID, undefined, LEADERBOARD_FETCH_LIMIT);
    
    // Combine them, ensuring no duplicates (use a Map for uniqueness by owner_id)
    const recordMap = new Map<string, any>();
    topResult.records?.forEach(r => recordMap.set(r.owner_id as string, r));
    
    // 2. Get records around the current user (if authorized)
    if (session.user_id) {
      const aroundMeResult = await nakamaClient.listLeaderboardRecordsAroundOwner(session, LEADERBOARD_ID, session.user_id, LEADERBOARD_AROUND_ME_LIMIT);
      aroundMeResult.records?.forEach(r => recordMap.set(r.owner_id as string, r));
    }
    
    // Sort the combined list by rank
    const combinedRecords = Array.from(recordMap.values()).sort((a, b) => Number(a.rank) - Number(b.rank));
    
    console.log(`Fetched ${combinedRecords.length} records efficiently (Top + Around Me).`);
    return combinedRecords;
  } catch (e) {
    console.error("Failed to fetch leaderboard:", e);
    return [];
  }
};

export const updateUserStats = async (session: Session, updates: { isWin?: boolean; isLoss?: boolean; isDraw?: boolean }) => {
  const currentStats = await getUserStats(session);
  
  const newStats = { ...currentStats };
  if (updates.isWin) {
    newStats.wins += 1;
    newStats.streak += 1;
    if (newStats.streak > newStats.maxStreak) {
      newStats.maxStreak = newStats.streak;
    }
  } else if (updates.isLoss) {
    newStats.losses += 1;
    newStats.streak = 0;
  } else if (updates.isDraw) {
    newStats.draws += 1;
    newStats.streak = 0;
  }
  
  try {
    // 1. Update personal Storage Object
    await nakamaClient.writeStorageObjects(session, [{
      collection: "stats",
      key: "ttt",
      permission_read: 2,
      permission_write: 1,
      value: newStats
    }]);
    
    // 2. Update real Nakama Leaderboard
    // Ensuring score is a string (int64 requirement) and metadata is a clean object
    console.log(`Updating leaderboard ${LEADERBOARD_ID} with score: ${newStats.wins}`);
    await nakamaClient.writeLeaderboardRecord(session, LEADERBOARD_ID, {
      score: String(newStats.wins),
      metadata: newStats
    });
    console.log("Leaderboard update successful");
    
  } catch (e) {
    console.error("Failed to update user stats/leaderboard:", e);
  }
  
  return newStats;
};
