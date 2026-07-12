import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const driver = await queryOne(
    `UPDATE drivers SET
      name = COALESCE($1, name),
      license_no = COALESCE($2, license_no),
      license_category = COALESCE($3, license_category),
      license_expiry = COALESCE($4, license_expiry),
      contact = COALESCE($5, contact),
      trip_completion_pct = COALESCE($6, trip_completion_pct),
      safety_score = COALESCE($7, safety_score),
      status = COALESCE($8, status)
     WHERE id = $9 RETURNING *`,
    [
      body.name, body.license_no, body.license_category, body.license_expiry,
      body.contact, body.trip_completion_pct, body.safety_score, body.status, id,
    ]
  );
  return NextResponse.json(driver);
}
