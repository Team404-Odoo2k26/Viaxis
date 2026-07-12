import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const trip = await queryOne<{ status: string; vehicle_id: number; driver_id: number }>(
    "SELECT status, vehicle_id, driver_id FROM trips WHERE id = $1",
    [id]
  );
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const newStatus = body.status;

  if (newStatus === "Dispatched" && trip.status === "Draft") {
    if (!body.vehicle_id && !trip.vehicle_id) {
      return NextResponse.json({ error: "Vehicle required for dispatch" }, { status: 400 });
    }
    if (!body.driver_id && !trip.driver_id) {
      return NextResponse.json({ error: "Driver required for dispatch" }, { status: 400 });
    }

    const vehicleId = body.vehicle_id ?? trip.vehicle_id;
    const driverId = body.driver_id ?? trip.driver_id;

    const vehicle = await queryOne<{ status: string; capacity_kg: number }>(
      "SELECT status, capacity_kg FROM vehicles WHERE id = $1",
      [vehicleId]
    );
    const driver = await queryOne<{ status: string; license_expiry: string }>(
      "SELECT status, license_expiry FROM drivers WHERE id = $1",
      [driverId]
    );

    if (!vehicle || vehicle.status !== "Available") {
      return NextResponse.json({ error: "Vehicle not available" }, { status: 400 });
    }
    if (!driver || driver.status !== "Available" || new Date(driver.license_expiry) < new Date()) {
      return NextResponse.json({ error: "Driver not assignable" }, { status: 400 });
    }

    const cargoWeight = body.cargo_weight_kg;
    if (cargoWeight && Number(cargoWeight) > Number(vehicle.capacity_kg)) {
      const overage = Number(cargoWeight) - Number(vehicle.capacity_kg);
      return NextResponse.json({ error: `Cargo exceeds capacity by ${overage.toFixed(2)} kg`, overage }, { status: 400 });
    }

    await queryOne("UPDATE vehicles SET status = 'On Trip' WHERE id = $1", [vehicleId]);
    await queryOne("UPDATE drivers SET status = 'On Trip' WHERE id = $1", [driverId]);

    const updated = await queryOne(
      `UPDATE trips SET status = 'Dispatched', vehicle_id = $1, driver_id = $2,
       dispatched_at = NOW(), eta = COALESCE($3, eta)
       WHERE id = $4 RETURNING *`,
      [vehicleId, driverId, body.eta, id]
    );
    return NextResponse.json(updated);
  }

  if (newStatus === "Completed" && trip.status === "Dispatched") {
    if (!body.final_odometer || !body.fuel_consumed_liters) {
      return NextResponse.json({ error: "Final odometer and fuel consumed required" }, { status: 400 });
    }

    const updated = await queryOne(
      `UPDATE trips SET status = 'Completed', final_odometer = $1, fuel_consumed_liters = $2,
       completed_at = NOW(), revenue = COALESCE($3, revenue) WHERE id = $4 RETURNING *`,
      [body.final_odometer, body.fuel_consumed_liters, body.revenue, id]
    );

    if (trip.vehicle_id) {
      await queryOne(
        "UPDATE vehicles SET status = 'Available', odometer = $1 WHERE id = $2",
        [body.final_odometer, trip.vehicle_id]
      );
    }
    if (trip.driver_id) {
      await queryOne("UPDATE drivers SET status = 'Available' WHERE id = $1", [trip.driver_id]);
    }

    // Auto-log each fuel stop into fuel_logs table
    const fuelStops: { liters: number; cost: number }[] = body.fuel_stops ?? [];
    if (fuelStops.length > 0 && trip.vehicle_id) {
      for (const stop of fuelStops) {
        if (stop.liters > 0 && stop.cost >= 0) {
          await query(
            `INSERT INTO fuel_logs (vehicle_id, trip_id, log_date, liters, cost, source)
             VALUES ($1, $2, CURRENT_DATE, $3, $4, 'Trip Stop')`,
            [trip.vehicle_id, id, stop.liters, stop.cost]
          );
        }
      }
    }

    return NextResponse.json(updated);
  }

  if (newStatus === "Cancelled" && trip.status === "Dispatched") {
    const updated = await queryOne(
      "UPDATE trips SET status = 'Cancelled', cancelled_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    if (trip.vehicle_id) {
      await queryOne("UPDATE vehicles SET status = 'Available' WHERE id = $1", [trip.vehicle_id]);
    }
    if (trip.driver_id) {
      await queryOne("UPDATE drivers SET status = 'Available' WHERE id = $1", [trip.driver_id]);
    }
    return NextResponse.json(updated);
  }

  const updated = await queryOne(
    `UPDATE trips SET
      source = COALESCE($1, source),
      destination = COALESCE($2, destination),
      vehicle_id = COALESCE($3, vehicle_id),
      driver_id = COALESCE($4, driver_id),
      cargo_weight_kg = COALESCE($5, cargo_weight_kg),
      planned_distance_km = COALESCE($6, planned_distance_km),
      starting_fuel = COALESCE($7, starting_fuel),
      revenue = COALESCE($8, revenue),
      notes = COALESCE($9, notes)
     WHERE id = $10 RETURNING *`,
    [
      body.source, body.destination, body.vehicle_id, body.driver_id,
      body.cargo_weight_kg, body.planned_distance_km, body.starting_fuel, body.revenue, body.notes, id,
    ]
  );
  return NextResponse.json(updated);
}
