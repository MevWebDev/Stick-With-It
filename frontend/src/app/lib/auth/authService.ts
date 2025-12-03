import { apiClient } from "../api/client";
import {
  AuthResponse,
  CheckEmailResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  UserStats,
  StatsResponse,
  Badge,
} from "./types";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/register/",
      credentials
    );
    if (response.tokens) {
      this.setTokens(response.tokens.access, response.tokens.refresh);
    }
    return response;
  },

  async checkEmail(email: string): Promise<CheckEmailResponse> {
    const response = await apiClient.post<CheckEmailResponse>(
      "/api/auth/check-email/",
      { email }
    );

    return response;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/login/",
      credentials
    );
    if (response.tokens) {
      this.setTokens(response.tokens.access, response.tokens.refresh);
    }
    return response;
  },

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        await apiClient.post("/api/auth/logout/", { refresh: refreshToken });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    this.clearTokens();
  },

  async getStats(): Promise<UserStats> {
    const token = this.getAccessToken();
    const response = await apiClient.get<StatsResponse>(
      "/api/auth/stats/",
      token || undefined
    );
    return response.stats;
  },

  async getBadges(): Promise<Badge[]> {
    const token = this.getAccessToken();
    return apiClient.get<Badge[]>("/api/auth/badges/", token || undefined);
  },

  async getCurrentUser(): Promise<User> {
    const token = this.getAccessToken();
    return apiClient.get<User>("/api/auth/me/", token || undefined);
  },

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const response = await apiClient.post<{ access: string }>(
      "/api/auth/refresh/",
      {
        refresh: refreshToken,
      }
    );
    this.setAccessToken(response.access);
    return response.access;
  },

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  setAccessToken(accessToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, accessToken);
    }
  },

  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
};
