import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "./AuthContext";
import { logger } from "@/lib/logger";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await fetch("/api/me", {
        credentials: "include",
      });

      if (!response.ok) {
        logger.error("Failed to fetch user data:", response.statusText);
        return null;
      }

      const result = await response.json();
      logger.log("Authenticated User:", result);
      return result.data;
    },
    retry: false,
  });

  const value = {
    user: data ?? null,
    isLoading,
    isAuthenticated: !!data,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
