"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, AlertTriangle } from "lucide-react";
import StatusPill from "@/components/StatusPill";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { canEdit } from "@/lib/rbac";
import { isLicenseExpired } from "@/lib/business-rules";
import { fetchDrivers, createDriver, updateDriver } from "@/utils/api";
import type { Role, Driver, DriverStatus } from "@/types";

export default function DriversPage() {
  const { user } = useAuth();
  const canEditDrivers = canEdit(user?.role as Role, "drivers");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", license_no: "", license_category: "Commercial B", license_expiry: "", contact: "" });

  const load = () => fetchDrivers().then(setDrivers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggleStatus = async (d: Driver, status: DriverStatus) => {
    if (!canEditDrivers) return;
    await updateDriver(d.id, { status });
    load();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDriver(form);
    setModalOpen(false);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Drivers</h1>
        {canEditDrivers && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white" style={{ background: "var(--accent)" }}>
            <Plus size={16} /> Add Driver
          </motion.button>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {loading ? <div className="h-48 skeleton" /> : drivers.length === 0 ? (
          <EmptyState title="No drivers registered" />
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: "var(--surface)" }}>
              <tr className="text-xs" style={{ color: "var(--text-muted)" }}>
                {["Name", "License", "Category", "Expiry", "Contact", "Completion", "Safety", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.map((d, i) => {
                const expired = isLicenseExpired(d.license_expiry);
                return (
                  <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="py-3">{d.license_no}</td>
                    <td className="py-3">{d.license_category}</td>
                    <td className="py-3">
                      <span className={expired ? "flex items-center gap-1" : ""} style={expired ? { color: "var(--warning)" } : {}}>
                        {expired && <AlertTriangle size={12} />}
                        {d.license_expiry}
                      </span>
                    </td>
                    <td className="py-3">{d.contact ?? "—"}</td>
                    <td className="py-3">{d.trip_completion_pct}%</td>
                    <td className="py-3">{d.safety_score}</td>
                    <td className="py-3">
                      {canEditDrivers ? (
                        <div className="flex gap-1 flex-wrap">
                          {(["Available", "Off Duty", "Suspended"] as DriverStatus[]).map((s) => (
                            <motion.button key={s} whileTap={{ scale: 0.95 }} onClick={() => toggleStatus(d, s)}
                              className="px-2 py-0.5 rounded text-xs border"
                              style={{ borderColor: d.status === s ? "var(--accent)" : "var(--border)", background: d.status === s ? "var(--accent-muted)" : "transparent" }}>
                              {s}
                            </motion.button>
                          ))}
                        </div>
                      ) : <StatusPill status={d.status} />}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Driver">
        <form onSubmit={handleCreate} className="space-y-3">
          {[{ k: "name", l: "Name" }, { k: "license_no", l: "License No." }, { k: "contact", l: "Contact" }].map(({ k, l }) => (
            <div key={k}>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>{l}</label>
              <input required={k !== "contact"} value={form[k as keyof typeof form]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
            </div>
          ))}
          <div>
            <label className="text-xs" style={{ color: "var(--text-muted)" }}>License Expiry</label>
            <input type="date" required value={form.license_expiry} onChange={(e) => setForm({ ...form, license_expiry: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
          </div>
          <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full py-2 rounded-md text-sm font-medium text-white" style={{ background: "var(--accent)" }}>
            Save Driver
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
