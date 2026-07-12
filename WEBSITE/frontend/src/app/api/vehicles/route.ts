import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const region = searchParams.get("region");
  const search = searchParams.get("search");
  const dispatchable = searchParams.get("dispatchable");

  let sql = "SELECT * FROM vehicles WHERE 1=1";
  const params: unknown[] = [];
  let i = 1;

  if (type) { sql += ` AND type = $${i++}`; params.push(type); }
  if (status) { sql += ` AND status = $${i++}`; params.push(status); }
  if (region) { sql += ` AND region = $${i++}`; params.push(region); }
  if (search) { sql += ` AND registration_no ILIKE $${i++}`; params.push(`%${search}%`); }
  if (dispatchable === "true") {
    sql += ` AND status = 'Available'`;
  }

  sql += " ORDER BY registration_no";
  const vehicles = await query(sql, params);
  return NextResponse.json(vehicles);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const existing = await queryOne(
    "SELECT id FROM vehicles WHERE registration_no = $1",
    [body.registration_no]
  );
  if (existing) {
    return NextResponse.json({ error: "Registration number must be unique" }, { status: 400 });
  }

  const vehicle = await queryOne(
    `INSERT INTO vehicles (registration_no, name_model, type, capacity_kg, odometer, acquisition_cost, status, region)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      body.registration_no, body.name_model, body.type, body.capacity_kg,
      body.odometer ?? 0, body.acquisition_cost, body.status ?? "Available", body.region,
    ]
  );
  return NextResponse.json(vehicle, { status: 201 });
}
