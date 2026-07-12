"use client";

import { motion } from "framer-motion";
import { PackageOpen } from "lucide-react";

export default function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full border flex items-center justify-center mb-4" style={{ borderColor: "var(--border)" }}>
        <PackageOpen size={28} strokeWidth={1.2} style={{ color: "var(--text-muted)" }} />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{description}</p>}
    </motion.div>
  );
}
