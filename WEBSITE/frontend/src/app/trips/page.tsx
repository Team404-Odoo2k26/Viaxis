"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import StatusPill from "@/components/StatusPill";
import LifecycleStepper from "@/components/LifecycleStepper";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/AuthContext";
import { canEdit } from "@/lib/rbac";
import { validateCargoWeight, isLicenseExpired } from "@/lib/business-rules";
import { fetchTrips, fetchVehicles, fetchDrivers, createTrip, updateTrip } from "@/utils/api";
import type { Role, Vehicle, Driver } from "@/types";

interface TripRow {
  id: number; source: string; destination: string; status: string;
  vehicle_id: number | null; driver_id: number | null;
  cargo_weight_kg: number | null; planned_distance_km: number | null;
  vehicle_reg?: string; driver_name?: string; capacity_kg?: number;
  license_expiry?: string; driver_status?: string;
}

export default function TripsPage() {
  const { user } = useAuth();
  const canEditTrips = canEdit(user?.role as Role, "trips");
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [completeModal, setCompleteModal] = useState<TripRow | null>(null);
  const [form, setForm] = useState({ source: "", destination: "", vehicle_id: "", driver_id: "", cargo_weight_kg: "", planned_distance_km: "" });
  const [completeForm, setCompleteForm] = useState({ final_odometer: "", fuel_consumed_liters: "" });
  const [error, setError] = useState("");

  const load = async () => {
    const [t, v, d] = await Promise.all([
      fetchTrips(), fetchVehicles({ dispatchable: "true" }), fetchDrivers(),
    ]);
    setTrips(t); setVehicles(v);
    setDrivers(d.filter((dr: Driver) => dr.status === "Available" && !isLicenseExpired(dr.license_expiry)));
  };

  useEffect(() => { load(); }, []);

  const selectedVehicle = vehicles.find((v) => v.id === Number(form.vehicle_id));
  const cargoValidation = selectedVehicle && form.cargo_weight_kg
    ? validateCargoWeight(Number(form.cargo_weight_kg), Number(selectedVehicle.capacity_kg))
    : null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (cargoValidation && !cargoValidation.valid) {
      setError(`Cargo exceeds capacity by ${cargoValidation.overage.toFixed(2)} kg`);
      return;
    }
    try {
      await createTrip({
        ...form,
        vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,
        driver_id: form.driver_id ? Number(form.driver_id) : null,
        cargo_weight_kg: form.cargo_weight_kg ? Number(form.cargo_weight_kg) : null,
        planned_distance_km: form.planned_distance_km ? Number(form.planned_distance_km) : null,
      });
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const dispatch = async (trip: TripRow) => {
    try {
      await updateTrip(trip.id, { status: "Dispatched" });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Dispatch failed");
    }
  };

  const cancel = async (trip: TripRow) => {
    await updateTrip(trip.id, { status: "Cancelled" });
    load();
  };

  const complete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModal) return;
    await updateTrip(completeModal.id, {
      status: "Completed",
      final_odometer: Number(completeForm.final_odometer),
      fuel_consumed_liters: Number(completeForm.fuel_consumed_liters),
    });
    setCompleteModal(null);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Trips</h1>
        {canEditTrips && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white" style={{ background: "var(--accent)" }}>
            <Plus size={16} /> Create Trip
          </motion.button>
        )}
      </div>

      <div className="grid gap-4">
        {trips.map((trip, i) => (
          <motion.div key={trip.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-lg border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-medium">Trip #{trip.id}: {trip.source} → {trip.destination}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {trip.vehicle_reg ?? "No vehicle"} · {trip.driver_name ?? "No driver"}
                  {trip.cargo_weight_kg && ` · ${trip.cargo_weight_kg} kg`}
                </p>
              </div>
              <StatusPill status={trip.status} />
            </div>
            <LifecycleStepper current={trip.status} />
            {canEditTrips && (
              <div className="flex gap-2 mt-4">
                {trip.status === "Draft" && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => dispatch(trip)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-white" style={{ background: "var(--accent)" }}>
                    Dispatch
                  </motion.button>
                )}
                {trip.status === "Dispatched" && (
                  <>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setCompleteModal(trip); setCompleteForm({ final_odometer: "", fuel_consumed_liters: "" }); }}
                      className="px-3 py-1.5 rounded-md text-xs font-medium text-white" style={{ background: "var(--accent)" }}>
                      Complete
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => cancel(trip)}
                      className="px-3 py-1.5 rounded-md text-xs border" style={{ borderColor: "var(--border)" }}>
                      Cancel
                    </motion.button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Trip">
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Source</label>
              <input required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Destination</label>
              <input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
            </div>
          </div>
          <div>
            <label className="text-xs" style={{ color: "var(--text-muted)" }}>Vehicle (available only)</label>
            <select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }}>
              <option value="">Select vehicle</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_no} — {v.capacity_kg}kg</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs" style={{ color: "var(--text-muted)" }}>Driver (available only)</label>
            <select value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }}>
              <option value="">Select driver</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Cargo Weight (kg)</label>
              <input type="number" value={form.cargo_weight_kg} onChange={(e) => setForm({ ...form, cargo_weight_kg: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: cargoValidation && !cargoValidation.valid ? "var(--warning)" : "var(--border)" }} />
              {cargoValidation && !cargoValidation.valid && (
                <p className="text-xs mt-1" style={{ color: "var(--warning)" }}>Exceeds capacity by {cargoValidation.overage.toFixed(2)} kg</p>
              )}
            </div>
            <div>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Planned Distance (km)</label>
              <input type="number" value={form.planned_distance_km} onChange={(e) => setForm({ ...form, planned_distance_km: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
            </div>
          </div>
          {error && <p className="text-xs" style={{ color: "var(--warning)" }}>{error}</p>}
          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={cargoValidation !== null && !cargoValidation.valid}
            className="w-full py-2 rounded-md text-sm font-medium text-white disabled:opacity-50" style={{ background: "var(--accent)" }}>
            Create Trip
          </motion.button>
        </form>
      </Modal>

      <Modal open={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete Trip">
        <form onSubmit={complete} className="space-y-3">
          <div>
            <label className="text-xs" style={{ color: "var(--text-muted)" }}>Final Odometer</label>
            <input type="number" required value={completeForm.final_odometer} onChange={(e) => setCompleteForm({ ...completeForm, final_odometer: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
          </div>
          <div>
            <label className="text-xs" style={{ color: "var(--text-muted)" }}>Fuel Consumed (liters)</label>
            <input type="number" required value={completeForm.fuel_consumed_liters} onChange={(e) => setCompleteForm({ ...completeForm, fuel_consumed_liters: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
          </div>
          <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full py-2 rounded-md text-sm font-medium text-white" style={{ background: "var(--accent)" }}>
            Complete Trip
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
