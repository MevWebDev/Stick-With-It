import { apiClient } from "../api/client";
import { authService } from "../auth/authService";

export interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  completed:boolean
}

export interface DailyChallenge {
  challenge: Challenge;
  assigned_date: string;
  success: boolean;
}

export interface CompleteChallengeResponse {
  success: boolean;
  message: string;
  points_earned: number;
  xp_earned: number;
  total_points: number;
  current_streak: number;
  level_info: {
    earned: number;
    leveled_up: boolean;
    new_level: number;
    current_exp: number;
    xp_to_next: number;
  };
  new_badges: Array<{
    key: string;
    title: string;
    icon: string;
    rarity: string;
  }>;
}

export const challengeService = {
  async getDailyChallenge(): Promise<DailyChallenge> {
    const token = authService.getAccessToken();
    return apiClient.get<DailyChallenge>("/api/auth/daily-challenge/", token || undefined);
  },

  async completeChallenge(): Promise<CompleteChallengeResponse> {
    const token = authService.getAccessToken();
    return apiClient.post<CompleteChallengeResponse>(
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
