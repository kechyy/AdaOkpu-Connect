import { NextResponse } from "next/server";
import { readDB, writeDB, uid, SessionSchema } from "@/lib/db";

const CreateSchema = SessionSchema.omit({ id: true });

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.sessions);
}

export async function POST(req: Request) {
  const payload = await req.json();
  const parsed = CreateSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const rec = { id: uid(), ...parsed.data };
  const db = await readDB();
  db.sessions.unshift(rec);
  await writeDB(db);
  return NextResponse.json(rec, { status: 201 });
}
