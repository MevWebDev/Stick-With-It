import { apiClient } from "../api/client";
import { authService } from "../auth/authService";

export interface WaterTodayResponse {
  date: string;
  current_amount: number;
  daily_goal: number;
}

export interface WaterHistoryEntry {
  date: string;
  current_amount: number;
}

export interface WaterHistoryResponse {
  daily_goal: number;
  logs: WaterHistoryEntry[];
}

export const waterService = {
  async getToday(): Promise<WaterTodayResponse> {
    const token = authService.getAccessToken();
    return apiClient.get<WaterTodayResponse>("/api/water/today/", token || undefined);
  },

  async logWater(amount: number): Promise<WaterTodayResponse> {
    const token = authService.getAccessToken();
    return apiClient.post<WaterTodayResponse>("/api/water/log/", { amount }, token || undefined);
  },

  async updateGoal(daily_goal: number): Promise<{ daily_goal: number }> {
    const token = authService.getAccessToken();
    return apiClient.post<{ daily_goal: number }>("/api/water/goal/", { daily_goal }, token || undefined);
  },

  async getHistory(days = 7): Promise<WaterHistoryResponse> {
    const token = authService.getAccessToken();
    return apiClient.get<WaterHistoryResponse>(`/api/water/history/?days=${days}`, token || undefined);
  },
};
