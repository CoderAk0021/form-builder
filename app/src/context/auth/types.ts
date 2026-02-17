import type { ReactNode } from "react";
import type { AuthUser } from "@/api";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
