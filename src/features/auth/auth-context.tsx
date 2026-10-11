"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type User } from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string;
  signIn: (
    email: string,
    password: string,
    operator?: boolean,
  ) => Promise<User>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const clear = () => {
      window.localStorage.removeItem("ticketflow_token");
      setUser(null);
      setError("Your session has expired. Please sign in again.");
    };
    const refresh = async () => {
      const token = window.localStorage.getItem("ticketflow_token");
      if (!token) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      try {
        const current = await api.me();
        if (
          active &&
          window.localStorage.getItem("ticketflow_token") === token
        ) {
          setUser(current);
          setError("");
        }
      } catch {
        if (active)
          setError(
            "Unable to verify your session. Check the API connection and try again.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    const storage = (event: StorageEvent) => {
      if (event.key === "ticketflow_token") void refresh();
    };
    void refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", storage);
    window.addEventListener("ticketflow:session-expired", clear);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", storage);
      window.removeEventListener("ticketflow:session-expired", clear);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      signIn: async (email, password, operator = false) => {
        setError("");
        try {
          const response = await api.login(email, password);
          if (
            operator &&
            !response.user.is_admin &&
            !response.user.roles.includes("operator")
          ) {
            throw new Error(
              "This account does not have operator access. Ask an administrator to grant it.",
            );
          }
          window.localStorage.setItem(
            "ticketflow_token",
            response.access_token,
          );
          setUser(response.user);
          return response.user;
        } catch (cause) {
          const message =
            cause instanceof Error ? cause.message : "Unable to sign in";
          setError(message);
          throw cause;
        }
      },
      signOut: () => {
        window.localStorage.removeItem("ticketflow_token");
        setUser(null);
        setError("");
      },
    }),
    [user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
