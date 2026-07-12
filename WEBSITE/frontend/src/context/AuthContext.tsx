"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/types";
import { fetchSettings } from "@/utils/api";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
  currencySymbol: string;
  distanceUnit: string;
  refreshSettings: () => Promise<void>;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [distanceUnit, setDistanceUnit] = useState("km");
  const router = useRouter();
  const pathname = usePathname();

  const refreshSettings = async () => {
    try {
      const data = await fetchSettings();
      if (data) {
        setCurrencySymbol(CURRENCY_SYMBOLS[data.currency] || "₹");
        setDistanceUnit(data.distance_unit || "km");
      }
    } catch (err) {
      console.error("Failed to load settings in AuthContext:", err);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("transitops_user");
    const theme = localStorage.getItem("transitops_theme");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
    }
    if (theme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (user) {
      refreshSettings();
    }
  }, [user]);

  useEffect(() => {
    if (!loaded) return;
    if (!user && pathname !== "/login") router.replace("/login");
    else if (user && pathname === "/login") router.replace("/dashboard");
  }, [user, pathname, loaded, router]);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem("transitops_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("transitops_user");
    router.replace("/login");
  };

  const toggleTheme = () => {
    setDarkMode((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("transitops_theme", next ? "dark" : "light");
      return next;
    });
  };

  if (!loaded) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        darkMode,
        toggleTheme,
        currencySymbol,
        distanceUnit,
        refreshSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
