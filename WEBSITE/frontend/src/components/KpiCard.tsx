"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  suffix?: string;
}

export default function KpiCard({ label, value, icon: Icon, suffix }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-lg border"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        {Icon && <Icon size={16} style={{ color: "var(--text-muted)" }} />}
      </div>
      <p className="text-2xl font-semibold mt-2 tabular-nums">
        {value}{suffix && <span className="text-base font-normal ml-0.5">{suffix}</span>}
      </p>
    </motion.div>
  );
}
