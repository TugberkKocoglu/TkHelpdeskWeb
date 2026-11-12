import { createContext } from "react";

import type { AuthUser, LoginRequest } from "../types/auth.types";

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (input: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
