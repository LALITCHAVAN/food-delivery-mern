import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "@/lib/api";
import type { Profile } from "@/lib/types";

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;

  signUp: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;

  signIn: (email: string, password: string) => Promise<void>;

  signOut: () => Promise<void>;

  updateProfile: (
    data: Partial<Pick<Profile, "name" | "phone" | "address">>
  ) => Promise<void>;

  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "foodhub_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setProfile(null);
        return;
      }

      const response = await api.get("/auth/me");

      setProfile(response.data.user as Profile);
    } catch (error) {
      console.error("Load profile error:", error);

      localStorage.removeItem(TOKEN_KEY);
      setProfile(null);
    }
  }

  useEffect(() => {
    async function initializeAuth() {
      try {
        await loadProfile();
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();
  }, []);

  async function signUp({
    name,
    email,
    phone,
    password,
  }: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        phone,
        password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid registration response.");
      }

      localStorage.setItem(TOKEN_KEY, token);
      setProfile(user as Profile);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed";

      throw new Error(message);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid login response.");
      }

      localStorage.setItem(TOKEN_KEY, token);
      setProfile(user as Profile);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed";

      throw new Error(message);
    }
  }

  async function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    setProfile(null);
  }

  async function updateProfile(
    data: Partial<Pick<Profile, "name" | "phone" | "address">>
  ) {
    if (!profile) {
      throw new Error("Please login first.");
    }

    try {
      const response = await api.put("/auth/profile", data);

      const updatedUser = response.data.user;

      setProfile(updatedUser as Profile);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Profile update failed";

      throw new Error(message);
    }
  }

  async function refreshProfile() {
    await loadProfile();
  }

  const value: AuthContextValue = {
    profile,
    loading,
    isAdmin: profile?.role === "admin",
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}