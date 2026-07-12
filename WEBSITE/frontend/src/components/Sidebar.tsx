"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Truck, Users, Route, Wrench, Fuel,
  BarChart3, Settings, LogOut, Moon, Sun, Command,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS, canAccess } from "@/lib/rbac";
import type { Role } from "@/types";

const ICONS: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard, fleet: Truck, drivers: Users, trips: Route,
  maintenance: Wrench, "fuel-expenses": Fuel, analytics: BarChart3, settings: Settings,
};

export default function Sidebar({ onOpenCommand }: { onOpenCommand?: () => void }) {
  const pathname = usePathname();
  const { user, logout, darkMode, toggleTheme } = useAuth();
  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter((item) => canAccess(user.role as Role, item.module));

  return (
    <aside className="w-56 min-h-screen border-r flex flex-col" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
        <h1 className="text-lg font-semibold tracking-tight">TransitOps</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{user.name}</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = ICONS[item.module] ?? LayoutDashboard;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 3, backgroundColor: "var(--surface-2)" }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm"
                style={{ background: active ? "var(--surface-2)" : "transparent", color: active ? "var(--text)" : "var(--text-muted)", fontWeight: active ? 500 : 400 }}
              >
                <Icon size={16} />{item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onOpenCommand} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full" style={{ color: "var(--text-muted)" }}>
          <Command size={16} />Command Palette<kbd className="ml-auto text-xs px-1.5 py-0.5 rounded border" style={{ borderColor: "var(--border)" }}>⌘K</kbd>
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full" style={{ color: "var(--text-muted)" }}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}{darkMode ? "Light Mode" : "Dark Mode"}
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full" style={{ color: "var(--text-muted)" }}>
          <LogOut size={16} />Sign Out
        </motion.button>
      </div>
    </aside>
  );
}
