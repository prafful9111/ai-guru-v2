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

const STORAGE_KEY = "auth_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          return {
            ...user,
            isDemo: true
          };
        } catch (e) {
          console.error("Failed to parse saved user", e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await apiClient.get<any>("/api/auth/me");
        if (data.user) {
          setUser({
            ...data.user,
            isDemo: true,
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...data.user,
            isDemo: true,
          }));
        } else {
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // If server check fails, we should probably clear local state
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signin = async (name: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const data = await apiClient.post<any>("/api/auth/login", {
        email: name,
        password,
      });
      setUser({
        ...data.user,
        isDemo: true,
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...data.user,
        isDemo: true,
      }));
      return data.user;
    } catch (error) {
      console.error("Signin failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch (error) {
      console.error("Signout failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    }
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
