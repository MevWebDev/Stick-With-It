"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../auth/authContext";
import { userStatsService, UserStats } from "./userStatsService";

interface UserStatsContextType {
  stats: UserStats | null;
  isLoading: boolean;
  refreshStats: () => Promise<void>;
}

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

export function UserStatsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // Reset loaded state when user changes
  useEffect(() => {
    hasLoadedRef.current = false;
  }, [user]);

  const refreshStats = useCallback(async () => {
    if (!user) {
      setStats(null);
      return;
    }

    try {
      // Don't set loading to true for background refreshes to avoid flickering
      // Only set it if we haven't loaded stats for this user yet
      if (!hasLoadedRef.current) setIsLoading(true);
      
      const data = await userStatsService.getStats();
      setStats(data);
      hasLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <UserStatsContext.Provider value={{ stats, isLoading, refreshStats }}>
      {children}
    </UserStatsContext.Provider>
  );
}

export function useUserStats() {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error("useUserStats must be used within a UserStatsProvider");
  }
  return context;
}
