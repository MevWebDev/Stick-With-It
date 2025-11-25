import { apiClient } from "../api/client";
import { authService } from "../auth/authService";

export interface UserStats {
  current_streak: number;
  points: number;
  level: number;
  completed_tasks: number;
  // Add other stats fields as needed
}

export const userStatsService = {
  async getStats(): Promise<UserStats> {
    const token = authService.getAccessToken();
    const response = await apiClient.get<{ stats: UserStats }>(
      "/api/auth/stats/",
      token || undefined
    );
    return response.stats;
  },
};
