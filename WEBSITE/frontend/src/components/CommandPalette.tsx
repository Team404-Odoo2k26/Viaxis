"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { NAV_ITEMS } from "@/lib/rbac";

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); open ? onClose() : null; }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const filtered = NAV_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const navigate = (href: string) => { router.push(href); onClose(); setQuery(""); };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-md rounded-lg border overflow-hidden"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <Search size={16} style={{ color: "var(--text-muted)" }} />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search modules..." className="flex-1 bg-transparent outline-none text-sm" />
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.map((item) => (
                <button key={item.href} onClick={() => navigate(item.href)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--surface-2)]">
                  {item.label}
                </button>
              ))}
              {filtered.length === 0 && <p className="px-4 py-6 text-sm text-center" style={{ color: "var(--text-muted)" }}>No results</p>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
