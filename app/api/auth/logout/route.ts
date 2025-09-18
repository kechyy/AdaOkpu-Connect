import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST() {
  (await cookies()).delete("ada_admin");
  return NextResponse.json({ ok: true });
}
