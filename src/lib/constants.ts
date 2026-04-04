// Nakama Operation Codes
export const OP_MOVE = 1;
export const OP_STATE = 2;

// Leaderboard Configuration
export const LEADERBOARD_ID = "ttt_global_ranking";
export const LEADERBOARD_FETCH_LIMIT = 10;
export const LEADERBOARD_AROUND_ME_LIMIT = 10;

// Game Configuration
export const DEFAULT_TURN_TIME_MS = 30000; // 30 seconds for timed mode
export const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];
