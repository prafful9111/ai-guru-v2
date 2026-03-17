"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

type User = {
  id: string;
  name: string;
  // email: string;
  role: "STAFF" | "ADMIN";
  staffId: string;
  // phoneNumber?: string | null;
  department?: string | null;
  isDemo?: boolean;
  // unit?: string | null;
  // createdAt: string;
  // updatedAt: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signin: (name: string, password: string) => Promise<User>;
  signout: () => Promise<void>;
}

import { MOCK_USERS } from "@/lib/mock-data";

const STORAGE_KEY = "auth_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    return { ...MOCK_USERS[0], isDemo: true } as any;
  });
  const [loading, setLoading] = useState(false);

  // Bypass all server checks and use instantaneous hardcoded mock user
  useEffect(() => {
    setLoading(false);
  }, []);

  const signin = async (name: string, password: string): Promise<User> => {
    setLoading(true);
    const mockUser = { ...MOCK_USERS[0], isDemo: true } as any;
    setUser(mockUser);
    setLoading(false);
    return mockUser;
  };

  const signout = async () => {
    // Keep user even on signout, or redirect to a fake state
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
