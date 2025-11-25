"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/auth/authContext";
import { apiClient } from "../lib/api/client";
import { authService } from "../lib/auth/authService";
import { motion, AnimatePresence } from "framer-motion";

export default function Streak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const token = authService.getAccessToken();
      try {
        const data = await apiClient.get<any>(
          "/api/auth/stats/",
          token || undefined
        );
        if (data?.stats) {
          // Check for 'streak' or 'current_streak' or 'streak_count'
          const streakValue =
            data.stats.streak ??
            data.stats.current_streak ??
            data.stats.streak_count ??
            0;
          setStreak(streakValue);
        }
      } catch (error) {
        console.error("Failed to fetch streak:", error);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  if (!user || streak === null) return null;

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setStreak((streak || 0) + 1)}>+1</button>
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
          🔥
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
