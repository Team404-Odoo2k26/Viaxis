"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Shield } from "lucide-react";
import { fetchSettings, updateSettings } from "@/utils/api";
import { RBAC_MATRIX, getPermissions } from "@/lib/rbac";
import type { Module, Permission } from "@/lib/rbac";
import type { Role } from "@/types";

import { useAuth } from "@/context/AuthContext";
import { DROPDOWN_CLASS, DROPDOWN_STYLE } from "@/utils/dropdown";

const MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  fleet: "Fleet",
  drivers: "Drivers",
  trips: "Trips",
  maintenance: "Maintenance",
  "fuel-expenses": "Fuel & Expenses",
  analytics: "Analytics",
  settings: "Settings",
};

const ROLES: Role[] = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];
const MODULES: Module[] = ["dashboard", "fleet", "drivers", "trips", "maintenance", "fuel-expenses", "analytics", "settings"];

export default function SettingsPage() {
  const { refreshSettings } = useAuth();
  const [settings, setSettings] = useState({ depot_name: "", currency: "INR", distance_unit: "km" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        if (data) {
          setSettings({
            depot_name: data.depot_name || "",
            currency: data.currency || "INR",
            distance_unit: data.distance_unit || "km",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateSettings(settings);
      await refreshSettings();
      setMessage("Settings saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton rounded" />
        <div className="h-64 skeleton rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Manage global preferences and view system authorization rules.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* General Settings */}
        <div className="md:col-span-1">
          <h2 className="text-base font-medium mb-3">General</h2>
          <form onSubmit={handleSave} className="space-y-4 rounded-lg border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Depot Name</label>
              <input
                required
                value={settings.depot_name}
                onChange={(e) => setSettings({ ...settings, depot_name: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none focus:ring-1"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className={DROPDOWN_CLASS}
                style={DROPDOWN_STYLE}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Distance Unit</label>
              <select
                value={settings.distance_unit}
                onChange={(e) => setSettings({ ...settings, distance_unit: e.target.value })}
                className={DROPDOWN_CLASS}
                style={DROPDOWN_STYLE}
              >
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
              </select>
            </div>
            {message && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs py-1" style={{ color: "var(--accent)" }}>
                {message}
              </motion.p>
            )}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              <Save size={14} />
              {saving ? "Saving..." : "Save Settings"}
            </motion.button>
          </form>
        </div>

        {/* RBAC Matrix */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} />
            <h2 className="text-base font-medium">RBAC Permission Matrix</h2>
          </div>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-sm">
              <thead style={{ background: "var(--surface)" }}>
                <tr className="text-xs border-b" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  {MODULES.map((m) => (
                    <th key={m} className="text-center px-2 py-3 font-medium">{MODULE_LABELS[m]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLES.map((r, i) => (
                  <tr key={r} className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3.5 font-medium">{r}</td>
                    {MODULES.map((m) => {
                      const perm = RBAC_MATRIX[r][m];
                      return (
                        <td key={m} className="text-center px-2 py-3.5">
                          {perm === "edit" ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                              ✓
                            </span>
                          ) : perm === "view" ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-normal" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                              view
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--border)" }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
