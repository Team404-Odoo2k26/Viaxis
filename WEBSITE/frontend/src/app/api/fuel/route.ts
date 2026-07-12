import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  const logs = await query(`
    SELECT f.*, v.registration_no, v.name_model
    FROM fuel_logs f
    JOIN vehicles v ON v.id = f.vehicle_id
    ORDER BY f.log_date DESC
  `);
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const log = await queryOne(
    `INSERT INTO fuel_logs (vehicle_id, log_date, liters, cost)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [body.vehicle_id, body.log_date, body.liters, body.cost]
  );
  return NextResponse.json(log, { status: 201 });
}
