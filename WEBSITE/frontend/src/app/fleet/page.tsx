"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import StatusPill from "@/components/StatusPill";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { canEdit } from "@/lib/rbac";
import { fetchVehicles, createVehicle } from "@/utils/api";
import type { Role, Vehicle } from "@/types";
import { DROPDOWN_CLASS, FILTER_DROPDOWN_CLASS, DROPDOWN_STYLE } from "@/utils/dropdown";

export default function FleetPage() {
  const { user, currencySymbol } = useAuth();
  const canEditFleet = canEdit(user?.role as Role, "fleet");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ registration_no: "", name_model: "", type: "Van", capacity_kg: 500, odometer: 0, acquisition_cost: 0, region: "North" });
  const [error, setError] = useState("");

  const load = () => {
    const params: Record<string, string> = {};
    if (typeFilter) params.type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;
    fetchVehicles(params).then(setVehicles).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createVehicle(form);
      setModalOpen(false);
      setForm({ registration_no: "", name_model: "", type: "Van", capacity_kg: 500, odometer: 0, acquisition_cost: 0, region: "North" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Fleet</h1>
        {canEditFleet && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}>
            <Plus size={16} /> Add Vehicle
          </motion.button>
        )}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input placeholder="Search reg. no." value={search} onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={FILTER_DROPDOWN_CLASS} style={DROPDOWN_STYLE}>
          <option value="">All Types</option><option>Van</option><option>Truck</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={FILTER_DROPDOWN_CLASS} style={DROPDOWN_STYLE}>
          <option value="">All Status</option>
          {["Available", "On Trip", "In Shop", "Retired"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {loading ? <div className="h-48 skeleton" /> : vehicles.length === 0 ? (
          <EmptyState title="No vehicles found" />
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: "var(--surface)" }}>
              <tr className="text-xs" style={{ color: "var(--text-muted)" }}>
                {["Reg. No.", "Name/Model", "Type", "Capacity", "Odometer", "Cost", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v, i) => (
                <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-3 font-medium">{v.registration_no}</td>
                  <td className="py-3">{v.name_model}</td>
                  <td className="py-3">{v.type}</td>
                  <td className="py-3">{v.capacity_kg} kg</td>
                  <td className="py-3">{Number(v.odometer).toLocaleString()}</td>
                  <td className="py-3">{currencySymbol}{Number(v.acquisition_cost).toLocaleString()}</td>
                  <td className="py-3"><StatusPill status={v.status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Vehicle">
        <form onSubmit={handleCreate} className="space-y-3">
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>* Indicates required fields</p>
          {[{ k: "registration_no", l: "Registration No." }, { k: "name_model", l: "Name/Model" }].map(({ k, l }) => (
            <div key={k}>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>
                {l}<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input required value={form[k as keyof typeof form] as string} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Type<span className="text-red-500 ml-0.5">*</span></label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={DROPDOWN_CLASS} style={DROPDOWN_STYLE}>
                <option>Van</option><option>Truck</option>
              </select>
            </div>
            <div>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Capacity (kg)<span className="text-red-500 ml-0.5">*</span></label>
              <input type="number" required value={form.capacity_kg} onChange={(e) => setForm({ ...form, capacity_kg: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Acquisition Cost<span className="text-red-500 ml-0.5">*</span></label>
              <input type="number" required value={form.acquisition_cost} onChange={(e) => setForm({ ...form, acquisition_cost: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Region</label>
              <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
            </div>
          </div>
          {error && <p className="text-xs" style={{ color: "var(--warning)" }}>{error}</p>}
          <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full py-2 rounded-md text-sm font-medium text-white" style={{ background: "var(--accent)" }}>
            Save Vehicle
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
