import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  const drivers = await query("SELECT * FROM drivers ORDER BY name");
  return NextResponse.json(drivers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const existing = await queryOne(
    "SELECT id FROM drivers WHERE license_no = $1",
    [body.license_no]
  );
  if (existing) {
    return NextResponse.json({ error: "License number must be unique" }, { status: 400 });
  }

  const driver = await queryOne(
    `INSERT INTO drivers (name, license_no, license_category, license_expiry, contact, trip_completion_pct, safety_score, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      body.name, body.license_no, body.license_category, body.license_expiry,
      body.contact, body.trip_completion_pct ?? 0, body.safety_score ?? 100, body.status ?? "Available",
    ]
  );
  return NextResponse.json(driver, { status: 201 });
}
