import { apiClient } from "../api/client";
import type {
  AuthResponse,
  CheckEmailResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "./types";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/register/",
      credentials
    );
    this.setTokens(response.tokens.access, response.tokens.refresh);
    return response;
  },

  async checkEmail(email: String): Promise<CheckEmailResponse> {
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
    this.setTokens(response.tokens.access, response.tokens.refresh);
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
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  setAccessToken(accessToken: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
  },

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
