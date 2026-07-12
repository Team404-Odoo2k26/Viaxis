"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("transitops_user");
    const theme = localStorage.getItem("transitops_theme");
    if (stored) setUser(JSON.parse(stored));
    if (theme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    setLoaded(true);
  }, []);

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
    <AuthContext.Provider value={{ user, login, logout, darkMode, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
