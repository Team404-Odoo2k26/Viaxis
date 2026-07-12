"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, CheckCircle } from "lucide-react";
import StatusPill from "@/components/StatusPill";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { canEdit } from "@/lib/rbac";
import { fetchMaintenance, createMaintenance, updateMaintenance, fetchVehicles } from "@/utils/api";
import type { Role, Vehicle, MaintenanceLog } from "@/types";

export default function MaintenancePage() {
  const { user } = useAuth();
  const canEditMaint = canEdit(user?.role as Role, "maintenance");
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ vehicle_id: "", service_type: "", cost: "", service_date: "", status: "Active", notes: "" });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [mLogs, allVehicles] = await Promise.all([
        fetchMaintenance(),
        fetchVehicles(),
      ]);
      setLogs(mLogs);
      // Only show non-Retired vehicles in the dropdown for starting maintenance
      setVehicles(allVehicles.filter((v: Vehicle) => v.status !== "Retired"));
    } catch (err) {
      console.error("Error loading maintenance data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.vehicle_id) {
      setError("Please select a vehicle");
      return;
    }
    try {
      await createMaintenance({
        ...form,
        vehicle_id: Number(form.vehicle_id),
        cost: Number(form.cost),
      });
      setModalOpen(false);
      setForm({ vehicle_id: "", service_type: "", cost: "", service_date: "", status: "Active", notes: "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create log");
    }
  };

  const handleComplete = async (logId: number) => {
    try {
      await updateMaintenance(logId, { status: "Completed" });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to complete service");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Maintenance Logs</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Monitor and record vehicle service events. Active logs place vehicles &apos;In Shop&apos;.
          </p>
        </div>
        {canEditMaint && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={16} /> Log Service Record
          </motion.button>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {loading ? (
          <div className="h-48 skeleton" />
        ) : logs.length === 0 ? (
          <EmptyState title="No maintenance logs found" />
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: "var(--surface)" }}>
              <tr className="text-xs border-b" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                {["Vehicle", "Service Type", "Cost", "Service Date", "Status", "Notes", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b last:border-b-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="px-4 py-3 font-medium">
                    {log.registration_no || `ID: ${log.vehicle_id}`}
                    <span className="block text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                      {log.name_model}
                    </span>
                  </td>
                  <td className="px-4 py-3">{log.service_type}</td>
                  <td className="px-4 py-3">${Number(log.cost).toLocaleString()}</td>
                  <td className="px-4 py-3">{new Date(log.service_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={log.status} />
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {log.notes || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {canEditMaint && log.status === "Active" ? (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleComplete(log.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium"
                        style={{ borderColor: "var(--border)", color: "var(--accent)" }}
                      >
                        <CheckCircle size={12} /> Complete
                      </motion.button>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>None</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Service Record">
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Vehicle</label>
            <select
              required
              value={form.vehicle_id}
              onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none focus:ring-1"
              style={{ borderColor: "var(--border)" }}
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registration_no} — {v.name_model} ({v.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Service Type</label>
              <input
                required
                placeholder="e.g. Oil Change, Brake replacement"
                value={form.service_type}
                onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Cost ($)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Service Date</label>
              <input
                type="date"
                required
                value={form.service_date}
                onChange={(e) => setForm({ ...form, service_date: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)" }}
              >
                <option value="Active">Active (Vehicle goes In Shop)</option>
                <option value="Completed">Completed (Already done)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Notes</label>
            <textarea
              rows={3}
              placeholder="Provide extra details..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none resize-none"
              style={{ borderColor: "var(--border)" }}
            />
          </div>

          {error && <p className="text-xs mt-1" style={{ color: "var(--warning)" }}>{error}</p>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-2.5 rounded-md text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            Save Record
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
