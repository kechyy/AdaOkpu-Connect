import { NextResponse } from "next/server";
import { readDB, writeDB, SessionSchema } from "@/lib/db";

const PatchSchema = SessionSchema.partial();

export async function GET(_req: Request, { params }: { params: { id: string }}) {
  const db = await readDB();
  const row = db.sessions.find(x => x.id === params.id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const payload = await req.json();
  const parsed = PatchSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const db = await readDB();
  const i = db.sessions.findIndex(x => x.id === params.id);
  if (i === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  db.sessions[i] = { ...db.sessions[i], ...parsed.data, id: db.sessions[i].id };
  await writeDB(db);
  return NextResponse.json(db.sessions[i]);
}

export async function DELETE(_req: Request, { params }: { params: { id: string }}) {
  const db = await readDB();
  const before = db.sessions.length;
  db.sessions = db.sessions.filter(x => x.id !== params.id);
  if (db.sessions.length === before) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await writeDB(db);
  return NextResponse.json({ ok: true });
}
