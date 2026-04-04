import React, { memo, useCallback } from "react";
import { motion } from "motion/react";
import { useGameStore } from "../store/useGameStore";
import { useGame } from "../hooks/useGame";

interface CellProps {
  index: number;
}

export const Cell: React.FC<CellProps> = ({ index }) => {
  // Use specific selectors to minimize re-renders
  const value = useGameStore((state) => state.board[index]);
  const matchId = useGameStore((state) => state.matchId);
  const turn = useGameStore((state) => state.turn);
  const userId = useGameStore((state) => state.userId);
  const status = useGameStore((state) => state.status);
  
  const { makeMove } = useGame();

  const isMyTurn = turn === userId;
  const canMove = isMyTurn && value === null && status === "active";

  const handleClick = useCallback(() => {
    if (matchId && canMove) {
      makeMove(index);
    }
  }, [matchId, canMove, makeMove, index]);

  return (
    <motion.button
      whileHover={canMove ? { scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" } : {}}
      whileTap={canMove ? { scale: 0.95 } : {}}
      onClick={handleClick}
      className={`h-24 w-24 sm:h-32 sm:w-32 flex items-center justify-center text-4xl sm:text-6xl font-bold border-2 border-white/20 rounded-xl transition-colors ${
        canMove ? "cursor-pointer hover:border-white/40" : "cursor-default"
      }`}
    >
      {value && (
        <motion.span
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          className={value === "X" ? "text-blue-400" : "text-rose-400"}
        >
          {value}
        </motion.span>
      )}
    </motion.button>
  );
};

export const Board: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl">
      {Array(9).fill(null).map((_, i) => (
        <Cell key={i} index={i} />
      ))}
    </div>
  );
};
