import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  const settings = await queryOne("SELECT * FROM app_settings LIMIT 1");
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const settings = await queryOne(
    `UPDATE app_settings SET
      depot_name = COALESCE($1, depot_name),
      currency = COALESCE($2, currency),
      distance_unit = COALESCE($3, distance_unit),
      updated_at = NOW()
     WHERE id = (SELECT id FROM app_settings LIMIT 1) RETURNING *`,
    [body.depot_name, body.currency, body.distance_unit]
  );
  return NextResponse.json(settings);
}
