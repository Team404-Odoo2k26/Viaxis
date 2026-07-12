import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  const stats = await queryOne(`
    SELECT
      (SELECT COUNT(*)::int FROM vehicles WHERE status != 'Retired') AS active_vehicles,
      (SELECT COUNT(*)::int FROM vehicles WHERE status = 'Available') AS available_vehicles,
      (SELECT COUNT(*)::int FROM vehicles WHERE status = 'In Shop') AS vehicles_in_maintenance,
      (SELECT COUNT(*)::int FROM trips WHERE status = 'Dispatched') AS active_trips,
      (SELECT COUNT(*)::int FROM trips WHERE status = 'Draft') AS pending_trips,
      (SELECT COUNT(*)::int FROM drivers WHERE status IN ('Available', 'On Trip')) AS drivers_on_duty
  `);

  const breakdown = await query<{ status: string; count: string }>(
    `SELECT status, COUNT(*)::int AS count FROM vehicles GROUP BY status`
  );

  const vehicleBreakdown: Record<string, number> = {
    Available: 0,
    "On Trip": 0,
    "In Shop": 0,
    Retired: 0,
  };
  breakdown.forEach((r) => {
    vehicleBreakdown[r.status] = Number(r.count);
  });

  const total = Number(stats?.active_vehicles ?? 0);
  const onTrip = vehicleBreakdown["On Trip"] ?? 0;
  const fleetUtilization = total > 0 ? Math.round((onTrip / total) * 100) : 0;

  const recentTrips = await query(`
    SELECT t.*, v.registration_no AS vehicle_reg, v.name_model AS vehicle_name,
           d.name AS driver_name
    FROM trips t
    LEFT JOIN vehicles v ON v.id = t.vehicle_id
    LEFT JOIN drivers d ON d.id = t.driver_id
    ORDER BY t.created_at DESC LIMIT 10
  `);

  return NextResponse.json({
    ...stats,
    fleet_utilization: fleetUtilization,
    vehicle_breakdown: vehicleBreakdown,
    recent_trips: recentTrips,
  });
}
