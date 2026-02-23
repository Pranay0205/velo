import { createContext } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
