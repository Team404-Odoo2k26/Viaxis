"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Truck, Users, Route, Wrench } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import StatusPill from "@/components/StatusPill";
import { fetchDashboardStats } from "@/utils/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-24 rounded-lg skeleton" />)}
      </div>
    );
  }

  const s = stats as Record<string, number>;
  const breakdown = stats?.vehicle_breakdown as Record<string, number> ?? {};
  const recentTrips = (stats?.recent_trips as Record<string, unknown>[]) ?? [];
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Active Vehicles" value={s.active_vehicles ?? 0} icon={Truck} />
        <KpiCard label="Available Vehicles" value={s.available_vehicles ?? 0} icon={Truck} />
        <KpiCard label="In Maintenance" value={s.vehicles_in_maintenance ?? 0} icon={Wrench} />
        <KpiCard label="Active Trips" value={s.active_trips ?? 0} icon={Route} />
        <KpiCard label="Pending Trips" value={s.pending_trips ?? 0} icon={Route} />
        <KpiCard label="Drivers On Duty" value={s.drivers_on_duty ?? 0} icon={Users} />
        <KpiCard label="Fleet Utilization" value={s.fleet_utilization ?? 0} suffix="%" icon={Truck} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <h2 className="text-sm font-medium mb-4">Vehicle Status Breakdown</h2>
          {["Available", "On Trip", "In Shop", "Retired"].map((status) => (
            <div key={status} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>{status}</span>
                <span style={{ color: "var(--text-muted)" }}>{breakdown[status] ?? 0}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((breakdown[status] ?? 0) / total) * 100}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{ background: "var(--accent)" }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <h2 className="text-sm font-medium p-5 pb-3">Recent Trips</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                <th className="text-left px-5 py-2">Trip</th>
                <th className="text-left py-2">Vehicle</th>
                <th className="text-left py-2">Driver</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((trip, i) => (
                <motion.tr
                  key={String(trip.id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="px-5 py-2.5">#{String(trip.id)}</td>
                  <td className="py-2.5">{String(trip.vehicle_reg ?? "—")}</td>
                  <td className="py-2.5">{String(trip.driver_name ?? "—")}</td>
                  <td className="py-2.5"><StatusPill status={String(trip.status)} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
