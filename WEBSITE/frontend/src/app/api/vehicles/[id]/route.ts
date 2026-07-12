import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (body.registration_no) {
    const existing = await queryOne(
      "SELECT id FROM vehicles WHERE registration_no = $1 AND id != $2",
      [body.registration_no, id]
    );
    if (existing) {
      return NextResponse.json({ error: "Registration number must be unique" }, { status: 400 });
    }
  }

  const vehicle = await queryOne(
    `UPDATE vehicles SET
      registration_no = COALESCE($1, registration_no),
      name_model = COALESCE($2, name_model),
      type = COALESCE($3, type),
      capacity_kg = COALESCE($4, capacity_kg),
      odometer = COALESCE($5, odometer),
      acquisition_cost = COALESCE($6, acquisition_cost),
      status = COALESCE($7, status),
      region = COALESCE($8, region)
     WHERE id = $9 RETURNING *`,
    [
      body.registration_no, body.name_model, body.type, body.capacity_kg,
      body.odometer, body.acquisition_cost, body.status, body.region, id,
    ]
  );
  return NextResponse.json(vehicle);
}
