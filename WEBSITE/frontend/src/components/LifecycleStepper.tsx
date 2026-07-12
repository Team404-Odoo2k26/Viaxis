"use client";

import { motion } from "framer-motion";

const STEPS = ["Draft", "Dispatched", "Completed", "Cancelled"] as const;

export default function LifecycleStepper({ current }: { current: string }) {
  const idx = STEPS.indexOf(current as typeof STEPS[number]);
  const activeIdx = idx >= 0 ? idx : 0;

  return (
    <div className="flex items-center gap-0 w-full max-w-md">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ scale: i <= activeIdx ? 1.1 : 1, backgroundColor: i <= activeIdx ? "var(--accent)" : "var(--surface-2)" }}
              className="w-3 h-3 rounded-full border"
              style={{ borderColor: "var(--border)" }}
            />
            <span className="text-[10px] mt-1" style={{ color: i <= activeIdx ? "var(--text)" : "var(--text-muted)" }}>{step}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-px mx-1 relative overflow-hidden" style={{ background: "var(--border)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: i < activeIdx ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
                className="absolute inset-y-0 left-0"
                style={{ background: "var(--accent)" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
