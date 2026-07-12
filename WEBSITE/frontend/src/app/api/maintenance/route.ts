import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  const logs = await query(`
    SELECT m.*, v.registration_no, v.name_model, v.status AS vehicle_status
    FROM maintenance_logs m
    JOIN vehicles v ON v.id = m.vehicle_id
    ORDER BY m.service_date DESC
  `);
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const log = await queryOne(
    `INSERT INTO maintenance_logs (vehicle_id, service_type, cost, service_date, status, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [
      body.vehicle_id, body.service_type, body.cost, body.service_date,
      body.status ?? "Active", body.notes,
    ]
  );

  if (body.status === "Active" || !body.status) {
    const vehicle = await queryOne<{ status: string }>(
      "SELECT status FROM vehicles WHERE id = $1",
      [body.vehicle_id]
    );
    if (vehicle && vehicle.status !== "Retired") {
      await queryOne("UPDATE vehicles SET status = 'In Shop' WHERE id = $1", [body.vehicle_id]);
    }
  }

  return NextResponse.json(log, { status: 201 });
}
