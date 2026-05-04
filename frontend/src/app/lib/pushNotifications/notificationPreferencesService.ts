"use client";

import { API_URL } from "@/app/lib/api/apiConfig";

export interface NotificationPreferences {
  timezone: string;
  is_enabled_habits: boolean;
  notification_time_habits: string;
  is_enabled_challenges: boolean;
  notification_time_challenges: string;
  is_enabled_pomodoro: boolean;
}

export interface ApiNotificationPreferences {
  timezone: string;
  is_enabled_habits: boolean;
  notification_time_habits: string;
  is_enabled_challenges: boolean;
  notification_time_challenges: string;
  is_enabled_pomodoro: boolean;
}

const API_ENDPOINT = `${API_URL}/api/auth/notification-preferences/`;

/**
 * Service for managing user notification preferences
 */
export const notificationPreferencesService = {
  /**
   * Get current user's notification preferences
   */
  async getPreferences(): Promise<ApiNotificationPreferences> {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(API_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch notification preferences: ${response.status}`,
      );
    }

    return await response.json();
  },

  /**
   * Update user's notification preferences
   */
  async updatePreferences(
    preferences: Partial<ApiNotificationPreferences>,
  ): Promise<ApiNotificationPreferences> {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update notification preferences: ${error}`);
    }

    return await response.json();
  },

  /*
  // Test & debug functions - commented out for production
  // Uncomment if you need to debug notifications

  async sendTestNotification(): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("User not authenticated");
    const response = await fetch(`${API_ENDPOINT}test/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  async testSimulateHabitNotifications(): Promise<any> {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("User not authenticated");
    const response = await fetch(`${API_URL}/api/auth/test/simulate-habits/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  async testSimulateChallengeNotifications(): Promise<any> {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("User not authenticated");
    const response = await fetch(`${API_URL}/api/auth/test/simulate-challenges/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  async getDebugInfo(): Promise<any> {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("User not authenticated");
    const response = await fetch(`${API_URL}/api/auth/test/debug-preferences/`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  */
};
