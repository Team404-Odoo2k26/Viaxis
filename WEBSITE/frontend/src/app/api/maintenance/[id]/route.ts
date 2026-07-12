import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const log = await queryOne<{ vehicle_id: number; status: string }>(
    "SELECT vehicle_id, status FROM maintenance_logs WHERE id = $1",
    [id]
  );
  if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await queryOne(
    `UPDATE maintenance_logs SET
      service_type = COALESCE($1, service_type),
      cost = COALESCE($2, cost),
      service_date = COALESCE($3, service_date),
      status = COALESCE($4, status),
      notes = COALESCE($5, notes),
      completed_at = CASE WHEN $4 = 'Completed' THEN NOW() ELSE completed_at END
     WHERE id = $6 RETURNING *`,
    [body.service_type, body.cost, body.service_date, body.status, body.notes, id]
  );

  if (body.status === "Completed" && log.status === "Active") {
    const vehicle = await queryOne<{ status: string }>(
      "SELECT status FROM vehicles WHERE id = $1",
      [log.vehicle_id]
    );
    if (vehicle && vehicle.status !== "Retired") {
      await queryOne("UPDATE vehicles SET status = 'Available' WHERE id = $1", [log.vehicle_id]);
    }
  }

  return NextResponse.json(updated);
}
