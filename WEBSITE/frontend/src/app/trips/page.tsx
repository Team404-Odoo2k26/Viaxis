"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, MapPin } from "lucide-react";
import StatusPill from "@/components/StatusPill";
import LifecycleStepper from "@/components/LifecycleStepper";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/AuthContext";
import { canEdit } from "@/lib/rbac";
import { validateCargoWeight, isLicenseExpired } from "@/lib/business-rules";
import { fetchTrips, fetchVehicles, fetchDrivers, createTrip, updateTrip } from "@/utils/api";
import type { Role, Vehicle, Driver } from "@/types";
import { DROPDOWN_CLASS, DROPDOWN_STYLE } from "@/utils/dropdown";
import MapPicker from "@/components/MapPicker";

interface TripRow {
  id: number; source: string; destination: string; status: string;
  vehicle_id: number | null; driver_id: number | null;
  cargo_weight_kg: number | null; planned_distance_km: number | null;
  starting_fuel: number | null;
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
  const [editingTrip, setEditingTrip] = useState<TripRow | null>(null);
  const [form, setForm] = useState({ source: "", destination: "", vehicle_id: "", driver_id: "", cargo_weight_kg: "", planned_distance_km: "", starting_fuel: "", revenue: "" });
  const [completeForm, setCompleteForm] = useState({ final_odometer: "", starting_odometer: "", initial_fuel: "", final_fuel: "" });
  const [fuelStops, setFuelStops] = useState<{ id: number; liters: string; cost: string }[]>([]);
  const totalStopsFuel = fuelStops.reduce((sum, stop) => sum + (Number(stop.liters) || 0), 0);
  const totalStopsCost = fuelStops.reduce((sum, stop) => sum + (Number(stop.cost) || 0), 0);
  const avgFuelPrice = totalStopsFuel > 0 ? totalStopsCost / totalStopsFuel : 95;
  const calculatedFuelConsumed = Math.max(0, (Number(completeForm.initial_fuel) || 0) + totalStopsFuel - (Number(completeForm.final_fuel) || 0));
  const calculatedFuelCost = calculatedFuelConsumed * avgFuelPrice;
  const [error, setError] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<TripRow | null>(null);
  const [pinningMode, setPinningMode] = useState<"source" | "destination">("source");

  // Dynamically estimate suggested revenue based on distance and cargo
  useEffect(() => {
    if (!editingTrip && (form.planned_distance_km || form.cargo_weight_kg)) {
      const suggested = Math.round((Number(form.planned_distance_km) || 0) * 15 + (Number(form.cargo_weight_kg) || 0) * 1.5);
      setForm((f) => ({ ...f, revenue: String(suggested) }));
    }
  }, [form.planned_distance_km, form.cargo_weight_kg, editingTrip]);

  const load = async () => {
    const [t, v, d] = await Promise.all([
      fetchTrips(), fetchVehicles({ dispatchable: "true" }), fetchDrivers(),
    ]);
    setTrips(t); setVehicles(v);
    setDrivers(d.filter((dr: Driver) => dr.status === "Available" && !isLicenseExpired(dr.license_expiry)));
    if (t.length > 0) {
      setSelectedTrip((prev) => prev ? (t.find((x: any) => x.id === prev.id) || t[0]) : t[0]);
    }
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
      const payload = {
        source: form.source,
        destination: form.destination,
        vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,
        driver_id: form.driver_id ? Number(form.driver_id) : null,
        cargo_weight_kg: form.cargo_weight_kg ? Number(form.cargo_weight_kg) : null,
        planned_distance_km: form.planned_distance_km ? Number(form.planned_distance_km) : null,
        starting_fuel: form.starting_fuel ? Number(form.starting_fuel) : null,
        revenue: form.revenue ? Number(form.revenue) : 0,
      };

      if (editingTrip) {
        await updateTrip(editingTrip.id, payload);
      } else {
        await createTrip(payload);
      }
      setModalOpen(false);
      setEditingTrip(null);
      setForm({ source: "", destination: "", vehicle_id: "", driver_id: "", cargo_weight_kg: "", planned_distance_km: "", starting_fuel: "", revenue: "" });
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
    if (Number(completeForm.final_odometer) < Number(completeForm.starting_odometer)) {
      alert("Final odometer reading cannot be less than the starting odometer reading.");
      return;
    }
    try {
      await updateTrip(completeModal.id, {
        status: "Completed",
        final_odometer: Number(completeForm.final_odometer),
        fuel_consumed_liters: calculatedFuelConsumed,
        fuel_stops: fuelStops.map(stop => ({
          liters: Number(stop.liters),
          cost: Number(stop.cost)
        }))
      });
      setCompleteModal(null);
      setFuelStops([]);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Complete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Trips</h1>
        {canEditTrips && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => {
            setEditingTrip(null);
            setForm({ source: "", destination: "", vehicle_id: "", driver_id: "", cargo_weight_kg: "", planned_distance_km: "", starting_fuel: "", revenue: "" });
            setModalOpen(true);
          }}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white" style={{ background: "var(--accent)" }}>
            <Plus size={16} /> Create Trip
          </motion.button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left side: Trips list */}
        <div className="w-full lg:w-1/2 space-y-4">
          {trips.length === 0 ? (
            <div className="rounded-lg border p-12 text-center" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No trips created yet.</p>
            </div>
          ) : (
            trips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setSelectedTrip(trip);
                  if (canEditTrips && trip.status === "Draft") {
                    setEditingTrip(trip);
                    setForm({
                      source: trip.source,
                      destination: trip.destination,
                      vehicle_id: trip.vehicle_id ? String(trip.vehicle_id) : "",
                      driver_id: trip.driver_id ? String(trip.driver_id) : "",
                      cargo_weight_kg: trip.cargo_weight_kg ? String(trip.cargo_weight_kg) : "",
                      planned_distance_km: trip.planned_distance_km ? String(trip.planned_distance_km) : "",
                      starting_fuel: trip.starting_fuel ? String(trip.starting_fuel) : "",
                      revenue: trip.revenue ? String(trip.revenue) : "",
                    });
                    setModalOpen(true);
                  }
                }}
                className="rounded-lg border p-5 transition-all duration-200"
                style={{
                  borderColor: selectedTrip?.id === trip.id ? "var(--accent)" : "var(--border)",
                  background: "var(--surface)",
                  cursor: "pointer",
                  boxShadow: selectedTrip?.id === trip.id ? "0 0 0 1px var(--accent)" : "none"
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-medium">Trip #{trip.id}: {trip.source} &rarr; {trip.destination}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {trip.vehicle_reg ?? "No vehicle"} &middot; {trip.driver_name ?? "No driver"}
                      {trip.cargo_weight_kg && ` &middot; ${trip.cargo_weight_kg} kg`}
                    </p>
                  </div>
                  <StatusPill status={trip.status} />
                </div>
                <LifecycleStepper current={trip.status} />
                {canEditTrips && (
                  <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    {trip.status === "Draft" && (
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => dispatch(trip)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-white" style={{ background: "var(--accent)" }}>
                        Dispatch
                      </motion.button>
                    )}
                    {trip.status === "Dispatched" && (
                      <>
                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => {
                          const v = vehicles.find((veh) => veh.id === trip.vehicle_id);
                          setCompleteModal(trip);
                          setCompleteForm({
                            final_odometer: "",
                            starting_odometer: v ? String(v.odometer) : "0",
                            initial_fuel: trip.starting_fuel ? String(trip.starting_fuel) : "",
                            final_fuel: ""
                          });
                          setFuelStops([]);
                        }}
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
            ))
          )}
        </div>

        {/* Right side: Interactive Google Maps Route */}
        <div className="w-full lg:w-1/2 shrink-0 lg:sticky lg:top-6">
          <div
            className="rounded-lg border overflow-hidden p-1 flex flex-col"
            style={{ borderColor: "var(--border)", background: "var(--surface)", height: "calc(100vh - 220px)", minHeight: "500px" }}
          >
            {selectedTrip ? (
              <div className="flex flex-col h-full">
                <div className="flex-1 w-full bg-neutral-950 relative">
                  <iframe
                    title={`Route Map for Trip #${selectedTrip.id}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedTrip.source + " to " + selectedTrip.destination)}&t=&z=11&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>
                <div className="p-4 border-t flex items-start gap-3" style={{ borderColor: "var(--border)" }}>
                  <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-800" style={{ color: "var(--accent)" }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{selectedTrip.source} &rarr; {selectedTrip.destination}</h4>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      Active Route Map for Trip #{selectedTrip.id}. Planned Distance: {selectedTrip.planned_distance_km ? `${selectedTrip.planned_distance_km} km` : "N/A"}.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <MapPin size={32} className="text-neutral-400 animate-pulse mb-2" />
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Select a trip card to view route track.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal 
        open={modalOpen} 
        onClose={() => { 
          setModalOpen(false); 
          setEditingTrip(null); 
          setForm({ source: "", destination: "", vehicle_id: "", driver_id: "", cargo_weight_kg: "", planned_distance_km: "", starting_fuel: "", revenue: "" }); 
        }} 
        title={editingTrip ? "Edit Trip" : "Create Trip"}
        sizeClassName="max-w-3xl"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>* Indicates required fields</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Form Inputs */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs" style={{ color: "var(--text-muted)" }}>Source<span className="text-red-500 ml-0.5">*</span></label>
                  <input required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
                </div>
                <div>
                  <label className="text-xs" style={{ color: "var(--text-muted)" }}>Destination<span className="text-red-500 ml-0.5">*</span></label>
                  <input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
                </div>
              </div>
              
              <div>
                <label className="text-xs" style={{ color: "var(--text-muted)" }}>Vehicle (available only)</label>
                <select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
                  className={DROPDOWN_CLASS} style={DROPDOWN_STYLE}>
                  <option value="">Select vehicle</option>
                  {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_no} — {v.capacity_kg}kg</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs" style={{ color: "var(--text-muted)" }}>Driver (available only)</label>
                <select value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}
                  className={DROPDOWN_CLASS} style={DROPDOWN_STYLE}>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs" style={{ color: "var(--text-muted)" }}>Starting Fuel (Liters)<span className="text-red-500 ml-0.5">*</span></label>
                  <input type="number" required min="0" value={form.starting_fuel} onChange={(e) => setForm({ ...form, starting_fuel: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
                </div>
                <div>
                  <label className="text-xs" style={{ color: "var(--text-muted)" }}>Revenue (₹)<span className="text-red-500 ml-0.5">*</span></label>
                  <input type="number" required min="0" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
                </div>
              </div>
            </div>

            {/* Right Column: Map Selection */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <label className="text-xs mb-1 block font-medium" style={{ color: "var(--text-muted)" }}>Select Place on Map</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setPinningMode("source")}
                    className="px-3 py-1.5 rounded text-xs border transition-colors duration-150 font-medium cursor-pointer"
                    style={{
                      background: pinningMode === "source" ? "var(--accent)" : "transparent",
                      color: pinningMode === "source" ? "white" : "var(--text)",
                      borderColor: pinningMode === "source" ? "var(--accent)" : "var(--border)"
                    }}
                  >
                    📍 Pin Source
                  </button>
                  <button
                    type="button"
                    onClick={() => setPinningMode("destination")}
                    className="px-3 py-1.5 rounded text-xs border transition-colors duration-150 font-medium cursor-pointer"
                    style={{
                      background: pinningMode === "destination" ? "var(--accent)" : "transparent",
                      color: pinningMode === "destination" ? "white" : "var(--text)",
                      borderColor: pinningMode === "destination" ? "var(--accent)" : "var(--border)"
                    }}
                  >
                    📍 Pin Destination
                  </button>
                </div>
                <MapPicker
                  activeMode={pinningMode}
                  onSelect={(val) => {
                    if (pinningMode === "source") {
                      setForm((f) => ({ ...f, source: val }));
                    } else {
                      setForm((f) => ({ ...f, destination: val }));
                    }
                  }}
                  onDistanceChange={(dist) => {
                    setForm((f) => ({ ...f, planned_distance_km: String(dist) }));
                  }}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs mt-1" style={{ color: "var(--warning)" }}>{error}</p>}
          
          <div className="flex gap-3 mt-4 w-full">
            {editingTrip && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={async () => {
                  if (confirm("Are you sure you want to cancel this trip?")) {
                    await cancel(editingTrip);
                    setModalOpen(false);
                    setEditingTrip(null);
                    setForm({ source: "", destination: "", vehicle_id: "", driver_id: "", cargo_weight_kg: "", planned_distance_km: "", starting_fuel: "", revenue: "" });
                  }
                }}
                className="flex-1 py-2.5 rounded-md text-sm font-medium border text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer text-center"
                style={{ borderColor: "var(--border)" }}
              >
                Cancel Trip
              </motion.button>
            )}
            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={cargoValidation !== null && !cargoValidation.valid}
              className="flex-1 py-2.5 rounded-md text-sm font-medium text-white disabled:opacity-50" style={{ background: "var(--accent)" }}>
              {editingTrip ? "Save Changes" : "Create Trip"}
            </motion.button>
          </div>
        </form>
      </Modal>

      <Modal open={!!completeModal} onClose={() => { setCompleteModal(null); setFuelStops([]); }} title="Complete Trip">
        <form onSubmit={complete} className="space-y-3">
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>* Indicates required fields</p>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Starting Odometer (km)<span className="text-red-500 ml-0.5">*</span></label>
              <input type="number" required value={completeForm.starting_odometer} onChange={(e) => setCompleteForm({ ...completeForm, starting_odometer: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Final Odometer (km)<span className="text-red-500 ml-0.5">*</span></label>
              <input type="number" required value={completeForm.final_odometer} onChange={(e) => setCompleteForm({ ...completeForm, final_odometer: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Initial Fuel in Tank (L)<span className="text-red-500 ml-0.5">*</span></label>
              <input type="number" required min="0" value={completeForm.initial_fuel} onChange={(e) => setCompleteForm({ ...completeForm, initial_fuel: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Final Fuel in Tank (L)<span className="text-red-500 ml-0.5">*</span></label>
              <input type="number" required min="0" value={completeForm.final_fuel} onChange={(e) => setCompleteForm({ ...completeForm, final_fuel: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border text-sm bg-transparent" style={{ borderColor: "var(--border)" }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Fuel Stops Refueling</label>
              <button
                type="button"
                onClick={() => setFuelStops([...fuelStops, { id: Date.now(), liters: "", cost: "" }])}
                className="text-[10px] px-2 py-1 border rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                style={{ borderColor: "var(--border)" }}
              >
                + Add Fuel Stop
              </button>
            </div>
            {fuelStops.length > 0 && (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {fuelStops.map((stop, index) => (
                  <div key={stop.id} className="flex gap-2 items-center">
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>#{index + 1}:</span>
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="0.1"
                      placeholder="Liters (L)"
                      value={stop.liters}
                      onChange={(e) => {
                        const updated = fuelStops.map((s) => s.id === stop.id ? { ...s, liters: e.target.value } : s);
                        setFuelStops(updated);
                      }}
                      className="flex-1 min-w-[70px] px-2 py-1.5 rounded border text-xs bg-transparent"
                      style={{ borderColor: "var(--border)" }}
                    />
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Cost (₹)"
                      value={stop.cost}
                      onChange={(e) => {
                        const updated = fuelStops.map((s) => s.id === stop.id ? { ...s, cost: e.target.value } : s);
                        setFuelStops(updated);
                      }}
                      className="flex-1 min-w-[70px] px-2 py-1.5 rounded border text-xs bg-transparent"
                      style={{ borderColor: "var(--border)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setFuelStops(fuelStops.filter((s) => s.id !== stop.id))}
                      className="text-xs px-2 py-1.5 border rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                      style={{ borderColor: "var(--border)" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Preview Box */}
          <div className="rounded border p-3 text-xs space-y-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div>
              <span className="font-semibold block mb-1">Trip Metrics Preview</span>
              <div className="flex justify-between">
                <span>Distance Traveled:</span>
                <span className="font-mono">
                  {Number(completeForm.final_odometer) || 0} km - {Number(completeForm.starting_odometer) || 0} km = <strong className="text-blue-500">{Math.max(0, (Number(completeForm.final_odometer) || 0) - (Number(completeForm.starting_odometer) || 0))} km</strong>
                </span>
              </div>
            </div>
            
            <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <span className="font-semibold block mb-1">Fuel Consumption Preview</span>
              <div className="flex justify-between text-[11px]" style={{ color: "var(--text-muted)" }}>
                <span>Formula:</span>
                <span>Initial + Refueled - Final</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                <span>Calculation:</span>
                <span>
                  {Number(completeForm.initial_fuel) || 0}L + {totalStopsFuel}L - {Number(completeForm.final_fuel) || 0}L
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t mt-1" style={{ borderColor: "var(--border)" }}>
                <span>Total Consumed:</span>
                <span className="text-emerald-500">{calculatedFuelConsumed.toFixed(1)} Liters</span>
              </div>
            </div>

            <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <span className="font-semibold block mb-1">Fuel Cost Calculator</span>
              <div className="flex justify-between text-[11px]" style={{ color: "var(--text-muted)" }}>
                <span>Avg Fuel Price:</span>
                <span className="font-mono">₹{avgFuelPrice.toFixed(2)} / L</span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t mt-1" style={{ borderColor: "var(--border)" }}>
                <span>Total Fuel Cost:</span>
                <span className="text-amber-500">₹{calculatedFuelCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full py-2 rounded-md text-sm font-medium text-white" style={{ background: "var(--accent)" }}>
            Complete Trip
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
