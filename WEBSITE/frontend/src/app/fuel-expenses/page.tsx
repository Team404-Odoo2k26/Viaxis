"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Fuel, DollarSign, Receipt } from "lucide-react";
import StatusPill from "@/components/StatusPill";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import KpiCard from "@/components/KpiCard";
import { useAuth } from "@/context/AuthContext";
import { canEdit } from "@/lib/rbac";
import {
  fetchFuelLogs,
  createFuelLog,
  fetchExpenses,
  createExpense,
  fetchVehicles,
  fetchTrips,
  fetchMaintenance
} from "@/utils/api";
import type { Role, Vehicle, FuelLog, Expense, Trip, MaintenanceLog } from "@/types";

export default function FuelExpensesPage() {
  const { user } = useAuth();
  const canEditExpenses = canEdit(user?.role as Role, "fuel-expenses");

  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  // Forms state
  const [fuelForm, setFuelForm] = useState({ vehicle_id: "", log_date: "", liters: "", cost: "" });
  const [expenseForm, setExpenseForm] = useState({
    trip_id: "",
    vehicle_id: "",
    toll: "",
    other: "",
    linked_maintenance_cost: "",
    status: "Pending",
    notes: ""
  });

  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [fData, eData, vData, tData, mData] = await Promise.all([
        fetchFuelLogs(),
        fetchExpenses(),
        fetchVehicles(),
        fetchTrips(),
        fetchMaintenance()
      ]);
      setFuelLogs(fData);
      setExpenses(eData);
      setVehicles(vData.filter((v: Vehicle) => v.status !== "Retired"));
      setTrips(tData);
      setMaintenance(mData);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fuelForm.vehicle_id) {
      setError("Please select a vehicle");
      return;
    }
    try {
      await createFuelLog({
        vehicle_id: Number(fuelForm.vehicle_id),
        log_date: fuelForm.log_date,
        liters: Number(fuelForm.liters),
        cost: Number(fuelForm.cost),
      });
      setFuelModalOpen(false);
      setFuelForm({ vehicle_id: "", log_date: "", liters: "", cost: "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log fuel");
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createExpense({
        trip_id: expenseForm.trip_id ? Number(expenseForm.trip_id) : null,
        vehicle_id: expenseForm.vehicle_id ? Number(expenseForm.vehicle_id) : null,
        toll: Number(expenseForm.toll || 0),
        other: Number(expenseForm.other || 0),
        linked_maintenance_cost: Number(expenseForm.linked_maintenance_cost || 0),
        status: expenseForm.status,
        notes: expenseForm.notes
      });
      setExpenseModalOpen(false);
      setExpenseForm({
        trip_id: "",
        vehicle_id: "",
        toll: "",
        other: "",
        linked_maintenance_cost: "",
        status: "Pending",
        notes: ""
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expense");
    }
  };

  // Derive total fuel cost and completed maintenance cost
  const totalFuelCost = fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
  const totalMaintenanceCost = maintenance
    .filter(log => log.status === "Completed")
    .reduce((sum, log) => sum + Number(log.cost), 0);

  // Derived Operational Cost = Fuel + Maintenance
  const derivedOperationalCost = totalFuelCost + totalMaintenanceCost;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton rounded" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 skeleton rounded" />
          <div className="h-24 skeleton rounded" />
          <div className="h-24 skeleton rounded" />
        </div>
        <div className="h-64 skeleton rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fuel &amp; Expenses</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Log and review operational expenditures.
          </p>
        </div>
        {canEditExpenses && (
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setFuelModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              <Plus size={16} /> Log Fuel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setExpenseModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <Plus size={16} /> Add Expense
            </motion.button>
          </div>
        )}
      </div>

      {/* Derived Costs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          label="Total Fuel Cost"
          value={totalFuelCost}
          icon={Fuel}
          prefix="$"
        />
        <KpiCard
          label="Completed Maintenance Cost"
          value={totalMaintenanceCost}
          icon={DollarSign}
          prefix="$"
        />
        <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Derived Operational Cost
              </p>
              <h3 className="text-2xl font-semibold mt-1">
                ${derivedOperationalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
                Formula: Fuel (${totalFuelCost.toFixed(2)}) + Maintenance (${totalMaintenanceCost.toFixed(2)})
              </p>
            </div>
            <div className="p-2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <Receipt size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Fuel Logs & General Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Logs Section */}
        <div className="space-y-3">
          <h2 className="text-base font-medium">Fuel Logs</h2>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {fuelLogs.length === 0 ? (
              <EmptyState title="No fuel logs registered" />
            ) : (
              <table className="w-full text-sm">
                <thead style={{ background: "var(--surface)" }}>
                  <tr className="text-xs border-b" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                    <th className="text-left px-4 py-2 font-medium">Vehicle</th>
                    <th className="text-left py-2 font-medium">Log Date</th>
                    <th className="text-left py-2 font-medium">Liters</th>
                    <th className="text-left px-4 py-2 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b last:border-b-0"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <td className="px-4 py-2.5 font-medium">
                        {log.registration_no || `ID: ${log.vehicle_id}`}
                        <span className="block text-[10px] font-normal" style={{ color: "var(--text-muted)" }}>
                          {log.name_model}
                        </span>
                      </td>
                      <td className="py-2.5">{new Date(log.log_date).toLocaleDateString()}</td>
                      <td className="py-2.5">{Number(log.liters).toFixed(2)} L</td>
                      <td className="px-4 py-2.5 font-semibold">${Number(log.cost).toFixed(2)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Expenses Section */}
        <div className="space-y-3">
          <h2 className="text-base font-medium">General Expenses</h2>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {expenses.length === 0 ? (
              <EmptyState title="No expenses registered" />
            ) : (
              <table className="w-full text-sm">
                <thead style={{ background: "var(--surface)" }}>
                  <tr className="text-xs border-b" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                    <th className="text-left px-4 py-2 font-medium">Linkage / Ref</th>
                    <th className="text-left py-2 font-medium">Breakdown (Toll / Other / Maint)</th>
                    <th className="text-left py-2 font-medium">Total</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, i) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b last:border-b-0"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <td className="px-4 py-2.5 font-medium">
                        {expense.registration_no ? `Vehicle: ${expense.registration_no}` : "General"}
                        {expense.source && (
                          <span className="block text-[10px] font-normal" style={{ color: "var(--text-muted)" }}>
                            Trip: {expense.source} → {expense.destination}
                          </span>
                        )}
                        {expense.notes && (
                          <span className="block text-[10px] font-normal italic" style={{ color: "var(--text-muted)" }}>
                            &ldquo;{expense.notes}&rdquo;
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-xs text-neutral-500">
                        ${Number(expense.toll).toFixed(2)} / ${Number(expense.other).toFixed(2)} / ${Number(expense.linked_maintenance_cost).toFixed(2)}
                      </td>
                      <td className="py-2.5 font-semibold">${Number(expense.total ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-2.5">
                        <StatusPill status={expense.status} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Log Fuel Modal */}
      <Modal open={fuelModalOpen} onClose={() => setFuelModalOpen(false)} title="Log Fuel Purchase">
        <form onSubmit={handleFuelSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Vehicle</label>
            <select
              required
              value={fuelForm.vehicle_id}
              onChange={(e) => setFuelForm({ ...fuelForm, vehicle_id: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
              style={{ borderColor: "var(--border)" }}
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.registration_no} — {v.name_model}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Liters</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={fuelForm.liters}
                onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div className="col-span-1">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Cost ($)</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={fuelForm.cost}
                onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div className="col-span-1">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Date</label>
              <input
                type="date"
                required
                value={fuelForm.log_date}
                onChange={(e) => setFuelForm({ ...fuelForm, log_date: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
          </div>

          {error && <p className="text-xs mt-1" style={{ color: "var(--warning)" }}>{error}</p>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-2 rounded-md text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            Save Fuel Log
          </motion.button>
        </form>
      </Modal>

      {/* Add Expense Modal */}
      <Modal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Log General Expense">
        <form onSubmit={handleExpenseSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Trip Linkage (Optional)</label>
              <select
                value={expenseForm.trip_id}
                onChange={(e) => setExpenseForm({ ...expenseForm, trip_id: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)" }}
              >
                <option value="">None / Independent</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>Trip #{t.id} ({t.source} → {t.destination})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Vehicle Linkage (Optional)</label>
              <select
                value={expenseForm.vehicle_id}
                onChange={(e) => setExpenseForm({ ...expenseForm, vehicle_id: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)" }}
              >
                <option value="">None / General</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.registration_no} — {v.name_model}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Toll Fee ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={expenseForm.toll}
                onChange={(e) => setExpenseForm({ ...expenseForm, toll: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Other Fee ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={expenseForm.other}
                onChange={(e) => setExpenseForm({ ...expenseForm, other: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Maintenance Link ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={expenseForm.linked_maintenance_cost}
                onChange={(e) => setExpenseForm({ ...expenseForm, linked_maintenance_cost: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Notes</label>
              <input
                placeholder="Toll receipt, depot storage, etc."
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
          </div>

          {error && <p className="text-xs mt-1" style={{ color: "var(--warning)" }}>{error}</p>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-2.5 rounded-md text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            Save Expense
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
