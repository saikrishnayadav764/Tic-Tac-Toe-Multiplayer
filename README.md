# Multiplayer Tic-Tac-Toe with Nakama Backend

A production-ready, server-authoritative Tic-Tac-Toe game built with React and Nakama.

## 🚀 Features

- **Server-Authoritative Gameplay**: All game logic, move validation, and win detection happen on the Nakama server.
- **Real-time Multiplayer**: Low-latency gameplay using Nakama WebSockets.
- **Automatic Matchmaking**: Pair players instantly using Nakama's matchmaker.
- **Global Leaderboard**: Track wins and compete for the top spot.
- **Turn Timer**: 30-second time limit per move to keep the game fast-paced.
- **Responsive Design**: Optimized for both mobile and desktop devices.
- **Anti-Cheat**: Move validation prevents client-side manipulation.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Nakama (Go-based game server), TypeScript (Match Handler).
- **State Management**: Zustand.

## 📦 Setup and Installation

### Prerequisites
- Node.js (v18+)
- Nakama Server (v3.0+)

### Frontend Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Nakama endpoint in `src/infrastructure/nakamaClient.ts`.
4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup (Nakama)
1. Navigate to the `nakama-server` directory.
2. Compile `match_handler.ts` to JavaScript.
3. Place the compiled `.js` file in your Nakama server's `data/modules` directory.
4. Restart the Nakama server.

## 🏗️ Architecture and Design Decisions

### Server-Authoritative Pattern
The game follows a strict server-authoritative model. The client sends only the intended move (cell index) to the server. The server validates the move against the current state, updates the board, checks for winners, and broadcasts the new state to all participants. This prevents players from making illegal moves or modifying the game state locally.

### Nakama Match Handler
The match handler is written in TypeScript (compiled to JS for Nakama). It manages the `MatchState`, including the board, player list, current turn, and a `deadline` timestamp for the turn timer.

### Matchmaking
We use Nakama's built-in matchmaker with a simple requirement of 2 players. This allows Nakama to handle the complexity of pairing players and creating match instances.

## 🌐 Deployment

- **Nakama Server**: Deployed at `https://eef.monster`.
- **Frontend**: Deployed and accessible via the [Play Tic Tac Toe Multiplayer](https://tic-tac-toe-multiplayer-swart.vercel.app/).

## 🧪 How to Test

1. Open the application in two different browsers (e.g., Chrome and Firefox) or use one normal window and one guest window to simulate multiple players.
2. Enter a unique nickname in each tab.
3. Click "Find Match" in both tabs.
4. Once matched, play the game. Observe real-time updates and turn indicators.
5. Test the timer by waiting 30 seconds; the player whose turn it is will automatically forfeit.
6. Check the Leaderboard after a match to see updated rankings.
