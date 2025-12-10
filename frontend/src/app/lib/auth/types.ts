export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  tokens: AuthTokens;
}

export interface CheckEmailResponse {
  success: boolean;
  is_taken: boolean;
  message: string;
}

export interface UserStats {
  points: number;
  level: number;
  current_exp: number;
  exp_to_next_level: number;
  total_exp: number;
  current_streak: number;
  longest_streak: number;
  total_completed: number;
  level1_completed: number;
  level2_completed: number;
  level3_completed: number;
  blacklisted_categories: string[];
  earned_badges_count: number;
  earned_badges: string[];
}

export interface StatsResponse {
  success: boolean;
  stats: UserStats;
}

export interface Badge {
  key: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordCredentials {
  current_password: string;
  new_password: string;
}

export interface ChangeEmailCredentials {
  new_email: string;
  password: string;
}

export interface ChangeUsernameCredentials {
  new_username: string;
  password: string;
}

export interface ChangeResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
