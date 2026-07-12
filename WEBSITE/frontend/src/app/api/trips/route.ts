import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  const trips = await query(`
    SELECT t.*, v.registration_no AS vehicle_reg, v.name_model AS vehicle_name, v.capacity_kg,
           d.name AS driver_name, d.license_expiry, d.status AS driver_status
    FROM trips t
    LEFT JOIN vehicles v ON v.id = t.vehicle_id
    LEFT JOIN drivers d ON d.id = t.driver_id
    ORDER BY t.created_at DESC
  `);
  return NextResponse.json(trips);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.vehicle_id && body.cargo_weight_kg) {
    const vehicle = await queryOne<{ capacity_kg: number; status: string }>(
      "SELECT capacity_kg, status FROM vehicles WHERE id = $1",
      [body.vehicle_id]
    );
    if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    if (vehicle.status !== "Available") {
      return NextResponse.json({ error: "Vehicle is not available for dispatch" }, { status: 400 });
    }
    if (Number(body.cargo_weight_kg) > Number(vehicle.capacity_kg)) {
      const overage = Number(body.cargo_weight_kg) - Number(vehicle.capacity_kg);
      return NextResponse.json({
        error: `Cargo weight exceeds capacity by ${overage.toFixed(2)} kg`,
        overage,
      }, { status: 400 });
    }
  }

  if (body.driver_id) {
    const driver = await queryOne<{ status: string; license_expiry: string }>(
      "SELECT status, license_expiry FROM drivers WHERE id = $1",
      [body.driver_id]
    );
    if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    if (driver.status === "Suspended" || new Date(driver.license_expiry) < new Date()) {
      return NextResponse.json({ error: "Driver cannot be assigned (suspended or expired license)" }, { status: 400 });
    }
    if (driver.status === "On Trip") {
      return NextResponse.json({ error: "Driver is already on a trip" }, { status: 400 });
    }
  }

  const trip = await queryOne(
    `INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight_kg, planned_distance_km, starting_fuel, status, eta, notes, revenue)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      body.source, body.destination, body.vehicle_id ?? null, body.driver_id ?? null,
      body.cargo_weight_kg, body.planned_distance_km, body.starting_fuel ?? 0, body.status ?? "Draft",
      body.eta, body.notes, body.revenue ?? 0,
    ]
  );
  return NextResponse.json(trip, { status: 201 });
}
