import { apiClient } from "../api/client";
import { authService } from "../auth/authService";

export interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: number;
}

export interface DailyChallenge {
  id: number;
  challenge: Challenge;
  assigned_date: string;
 success: boolean;
}

export const challengeService = {
  async getDailyChallenge(): Promise<DailyChallenge> {
    const token = authService.getAccessToken();
    return apiClient.get<DailyChallenge>("/api/auth/daily-challenge/", token || undefined);
  },

  async completeChallenge(): Promise<{ message: string; points_earned: number }> {
    const token = authService.getAccessToken();
    return apiClient.post<{ message: string; points_earned: number }>(
      "/api/auth/complete-challenge/",
      {},
      token || undefined
    );
  },

  async toggleBlacklist(category: string): Promise<{ message: string; blacklisted_categories: string[] }> {
    const token = authService.getAccessToken();
    return apiClient.post<{ message: string; blacklisted_categories: string[] }>(
      "/api/auth/blacklist/",
      { category },
      token || undefined
    );
  },
};
