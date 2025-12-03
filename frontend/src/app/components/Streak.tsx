"use client";

import React from "react";
import { useUserStats } from "../lib/userStats/UserStatsContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaFire } from "react-icons/fa";
export default function Streak() {
  const { stats } = useUserStats();

  const streak = stats?.current_streak ?? 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">
        <motion.span
          key={streak}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.5, 1], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.5 }}
          className="text-2xl filter drop-shadow-lg"
          role="img"
          aria-label="fire"
        >
          <FaFire className="text-orange-500" />
        </motion.span>
        <AnimatePresence mode="wait">
          <motion.span
            key={streak}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-bold text-orange-500"
          >
            {streak}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
