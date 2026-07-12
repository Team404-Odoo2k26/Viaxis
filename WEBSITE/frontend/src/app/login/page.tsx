"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { login as apiLogin } from "@/utils/api";
import type { Role } from "@/types";

const ROLES: Role[] = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("manager@transitops.com");
  const [password, setPassword] = useState("demo123");
  const [role, setRole] = useState<Role>("Fleet Manager");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await apiLogin({ email, password, role });
      login(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm p-8 rounded-lg border"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">TransitOps</h1>
        <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-muted)" }}>Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none focus:ring-1"
              style={{ borderColor: "var(--border)" }} />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
              style={{ borderColor: "var(--border)" }} />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)}
              className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
              style={{ borderColor: "var(--border)" }}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <motion.input whileTap={{ scale: 0.9 }} type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <a href="#" className="text-xs" style={{ color: "var(--accent)" }}>Forgot password?</a>
          </div>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs px-3 py-2 rounded-md" style={{ background: "var(--warning-muted)", color: "var(--warning)" }}>
              {error}
            </motion.p>
          )}
          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
            className="w-full py-2.5 rounded-md text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--accent)" }}>
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>
        <p className="text-xs mt-4 text-center" style={{ color: "var(--text-muted)" }}>
          Demo: manager@transitops.com / demo123
        </p>
      </motion.div>
    </div>
  );
}
