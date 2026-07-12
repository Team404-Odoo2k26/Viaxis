import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();

  const attempt = await queryOne<{ failed_count: number; locked_until: string | null }>(
    "SELECT failed_count, locked_until FROM login_attempts WHERE email = $1",
    [email]
  );

  if (attempt?.locked_until && new Date(attempt.locked_until) > new Date()) {
    return NextResponse.json(
      { error: "Account locked due to too many failed attempts. Try again later." },
      { status: 423 }
    );
  }

  const user = await queryOne<{ id: number; email: string; name: string; role: string; password_hash: string }>(
    "SELECT id, email, name, role, password_hash FROM users WHERE email = $1",
    [email]
  );

  if (!user || user.password_hash !== password || user.role !== role) {
    const count = (attempt?.failed_count ?? 0) + 1;
    const lockedUntil = count >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;

    await queryOne(
      `INSERT INTO login_attempts (email, failed_count, locked_until, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (email) DO UPDATE SET failed_count = $2, locked_until = $3, updated_at = NOW()`,
      [email, count, lockedUntil]
    );

    return NextResponse.json(
      { error: count >= 5 ? "Account locked after 5 failed attempts" : "Invalid credentials" },
      { status: 401 }
    );
  }

  await queryOne("DELETE FROM login_attempts WHERE email = $1", [email]);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}
