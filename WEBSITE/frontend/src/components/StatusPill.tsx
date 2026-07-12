"use client";

import { motion } from "framer-motion";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Available: { bg: "var(--accent-muted)", text: "var(--accent)" },
  "On Trip": { bg: "#1e3a5f", text: "#60a5fa" },
  "In Shop": { bg: "#374151", text: "#9ca3af" },
  Retired: { bg: "#1f1f1f", text: "#6b7280" },
  Suspended: { bg: "var(--warning-muted)", text: "var(--warning)" },
  "Off Duty": { bg: "#1f2937", text: "#9ca3af" },
  Draft: { bg: "var(--surface-2)", text: "var(--text-muted)" },
  Dispatched: { bg: "var(--accent-muted)", text: "var(--accent)" },
  Completed: { bg: "#064e3b", text: "#34d399" },
  Cancelled: { bg: "var(--warning-muted)", text: "var(--warning)" },
  Active: { bg: "var(--accent-muted)", text: "var(--accent)" },
  Pending: { bg: "#422006", text: "#fbbf24" },
  Approved: { bg: "#064e3b", text: "#34d399" },
  Rejected: { bg: "var(--warning-muted)", text: "var(--warning)" },
};

export default function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Draft;
  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: style.bg, color: style.text }}
    >
      {status}
    </motion.span>
  );
}
