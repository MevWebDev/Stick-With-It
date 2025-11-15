"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authService } from "./authService";
import type {
  User,
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
} from "./types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = authService.getAccessToken();
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      authService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.register(credentials);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshToken = async () => {
    await authService.refreshToken();
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
