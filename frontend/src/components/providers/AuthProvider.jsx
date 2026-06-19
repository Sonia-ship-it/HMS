"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, authApi, getStoredUser, setToken, setUser } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored?.token) {
      setLoading(false);
      return;
    }
    setToken(stored.token);
    authApi
      .me()
      .then((me) => {
        setUserState({ ...me, token: stored.token });
        setUser({ ...me, token: stored.token });
      })
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    setToken(data.token);
    const session = { ...data, token: data.token };
    setUser(session);
    setUserState(session);
    return session;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUserState(null);
  };

  const refreshUser = async () => {
    try {
      const me = await authApi.me();
      const token = getStoredUser()?.token;
      setUserState({ ...me, token });
      setUser({ ...me, token });
    } catch (err) {
      console.error("Error refreshing user:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, setUser: setUserState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
