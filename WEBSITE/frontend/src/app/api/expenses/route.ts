import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  const expenses = await query(`
    SELECT e.*,
      (COALESCE(e.toll,0) + COALESCE(e.other,0) + COALESCE(e.linked_maintenance_cost,0)) AS total,
      v.registration_no, t.source, t.destination
    FROM expenses e
    LEFT JOIN vehicles v ON v.id = e.vehicle_id
    LEFT JOIN trips t ON t.id = e.trip_id
    ORDER BY e.created_at DESC
  `);
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const expense = await queryOne(
    `INSERT INTO expenses (trip_id, vehicle_id, toll, other, linked_maintenance_cost, status, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      body.trip_id, body.vehicle_id, body.toll ?? 0, body.other ?? 0,
      body.linked_maintenance_cost ?? 0, body.status ?? "Pending", body.notes,
    ]
  );
  return NextResponse.json(expense, { status: 201 });
}
