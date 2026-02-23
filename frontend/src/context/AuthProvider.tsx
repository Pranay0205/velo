import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await fetch("/api/me", {
        credentials: "include",
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
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
