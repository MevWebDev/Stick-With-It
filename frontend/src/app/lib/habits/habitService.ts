import { apiClient } from "../api/client";
import { authService } from "../auth/authService";

export interface Habit {
  id: number;
  name: string;
  icon_slug: string;
  current_streak: number;
  completed_today: boolean;
  is_custom: boolean;
}

export interface CreateHabitData {
  name: string;
  icon_slug: string;
  is_custom: boolean;
}

export interface CheckHabitResponse {
  success: boolean;
  streak: number;
  completed_today: boolean;
  message?: string;
  xp_earned?: number;
  level_info?: {
    earned: number;
    leveled_up: boolean;
    new_level: number;
    current_exp: number;
    xp_to_next: number;
  };
  new_badges?: Array<{
    key: string;
    title: string;
    icon: string;
    rarity: string;
  }>;
}

export const habitService = {
  async getHabits(): Promise<Habit[]> {
    const token = authService.getAccessToken();
    return apiClient.get<Habit[]>("/api/habits/", token || undefined);
  },

  async createHabit(data: CreateHabitData): Promise<Habit> {
    const token = authService.getAccessToken();
    return apiClient.post<Habit>("/api/habits/", data, token || undefined);
  },

  async checkHabit(id: number): Promise<CheckHabitResponse> {
    const token = authService.getAccessToken();
    return apiClient.post<CheckHabitResponse>(
      `/api/habits/${id}/check/`,
      {},
      token || undefined,
    );
  },

  async uncheckHabit(id: number): Promise<CheckHabitResponse> {
    const token = authService.getAccessToken();
    return apiClient.delete<CheckHabitResponse>(
      `/api/habits/${id}/check/`,
      token || undefined,
    );
  },
};
