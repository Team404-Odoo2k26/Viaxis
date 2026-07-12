import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  const fuelTotal = await queryOne<{ total: string }>(
    "SELECT COALESCE(SUM(cost),0) AS total FROM fuel_logs"
  );
  const maintTotal = await queryOne<{ total: string }>(
    "SELECT COALESCE(SUM(cost),0) AS total FROM maintenance_logs WHERE status = 'Completed'"
  );
  const revenueTotal = await queryOne<{ total: string }>(
    "SELECT COALESCE(SUM(revenue),0) AS total FROM trips WHERE status = 'Completed'"
  );
  const acquisitionTotal = await queryOne<{ total: string }>(
    "SELECT COALESCE(SUM(acquisition_cost),0) AS total FROM vehicles WHERE status != 'Retired'"
  );

  const distanceFuel = await queryOne<{ distance: string; fuel: string }>(`
    SELECT COALESCE(SUM(planned_distance_km),0) AS distance,
           COALESCE(SUM(fuel_consumed_liters),0) AS fuel
    FROM trips WHERE status = 'Completed'
  `);

  const fuel = Number(distanceFuel?.fuel ?? 0);
  const distance = Number(distanceFuel?.distance ?? 0);
  const fuelEfficiency = fuel > 0 ? distance / fuel : 0;

  const vehicleStats = await queryOne<{ total: string; on_trip: string }>(`
    SELECT COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE status = 'On Trip')::int AS on_trip
    FROM vehicles WHERE status != 'Retired'
  `);
  const total = Number(vehicleStats?.total ?? 0);
  const onTrip = Number(vehicleStats?.on_trip ?? 0);
  const fleetUtilization = total > 0 ? (onTrip / total) * 100 : 0;

  const operationalCost = Number(fuelTotal?.total ?? 0) + Number(maintTotal?.total ?? 0);
  const revenue = Number(revenueTotal?.total ?? 0);
  const acquisition = Number(acquisitionTotal?.total ?? 0);
  const roi = acquisition > 0 ? (revenue - operationalCost) / acquisition : 0;

  const monthlyRevenue = await query(`
    SELECT TO_CHAR(completed_at, 'Mon YYYY') AS month,
           COALESCE(SUM(revenue),0)::float AS revenue
    FROM trips WHERE status = 'Completed' AND completed_at IS NOT NULL
    GROUP BY TO_CHAR(completed_at, 'Mon YYYY'), DATE_TRUNC('month', completed_at)
    ORDER BY DATE_TRUNC('month', completed_at)
  `);

  const topCostliest = await query(`
    SELECT v.registration_no, COALESCE(SUM(fl.cost),0) + COALESCE(SUM(ml.cost),0) AS cost
    FROM vehicles v
    LEFT JOIN fuel_logs fl ON fl.vehicle_id = v.id
    LEFT JOIN maintenance_logs ml ON ml.vehicle_id = v.id
    GROUP BY v.id, v.registration_no
    ORDER BY cost DESC LIMIT 5
  `);

  return NextResponse.json({
    fuel_efficiency: Math.round(fuelEfficiency * 100) / 100,
    fleet_utilization: Math.round(fleetUtilization * 100) / 100,
    operational_cost: operationalCost,
    vehicle_roi: Math.round(roi * 10000) / 100,
    monthly_revenue: monthlyRevenue,
    top_costliest_vehicles: topCostliest,
  });
}
