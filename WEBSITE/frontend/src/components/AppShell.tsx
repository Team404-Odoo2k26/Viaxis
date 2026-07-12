"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import CommandPalette from "./CommandPalette";
import { useAuth } from "@/context/AuthContext";
import { canAccess, Module } from "@/lib/rbac";
import type { Role } from "@/types";
import { ShieldAlert } from "lucide-react";

export default function AppShell({ children }: { children: ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((o) => !o); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (pathname === "/login" || !user) return <>{children}</>;

  const currentModule = pathname.substring(1).split("/")[0] as Module;
  const isProtected = pathname !== "/" && pathname !== "/login";
  const hasAccess = !isProtected || canAccess(user.role as Role, currentModule);

  return (
    <div className="flex min-h-screen">
      <Sidebar onOpenCommand={() => setCmdOpen(true)} />
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="p-8 w-full"
          >
            {!hasAccess ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <ShieldAlert size={48} className="text-red-500 mb-4 animate-pulse" />
                <h2 className="text-xl font-semibold tracking-tight">Access Denied</h2>
                <p className="text-sm mt-2 max-w-sm" style={{ color: "var(--text-muted)" }}>
                  Your role <strong className="font-semibold">{user.role}</strong> does not have permissions to access the <strong className="font-semibold">{currentModule}</strong> module.
                </p>
              </div>
            ) : (
              children
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
