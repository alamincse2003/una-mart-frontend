"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiClient, ApiError } from "./api-client";
import { useCart } from "./cart-context";
import type { Me } from "./types";

interface AuthContextValue {
  /** null = logged out; undefined = not known yet. */
  user: Me | null | undefined;
  /** Phone + OTP login. The guest cart is merged server-side. */
  verifyOtp: (phone: string, code: string) => Promise<Me>;
  /** After any login made elsewhere (e.g. admin login). */
  setUser: (user: Me | null) => void;
  updateMe: (patch: { name?: string; email?: string }) => Promise<Me>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// The session lives in an httpOnly cookie the page can't read; GET /auth/me
// tells us who (if anyone) is logged in.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null | undefined>(undefined);
  const { refresh: refreshCart } = useCart();

  useEffect(() => {
    apiClient
      .me()
      .then(setUser)
      .catch((error: unknown) => {
        // 401 = guest. Anything else (API down): treat as guest for now.
        if (!(error instanceof ApiError) || error.status !== 401) console.warn("Could not load session", error);
        setUser(null);
      });
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, code: string) => {
      const me = await apiClient.verifyOtp(phone, code);
      setUser(me);
      await refreshCart(); // guest cart was merged into the account
      return me;
    },
    [refreshCart]
  );

  const updateMe = useCallback(async (patch: { name?: string; email?: string }) => {
    const me = await apiClient.updateMe(patch);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    await apiClient.logout().catch(() => undefined);
    setUser(null);
    await refreshCart();
  }, [refreshCart]);

  const value = useMemo(
    () => ({ user, verifyOtp, setUser, updateMe, logout }),
    [user, verifyOtp, updateMe, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
