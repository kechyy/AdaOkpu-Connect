import { NextResponse } from "next/server";
import { readDB, writeDB, LedgerSchema } from "@/lib/db";

const PatchSchema = LedgerSchema.partial();

export async function GET(_req: Request, { params }: { params: { id: string }}) {
  const db = await readDB();
  const row = db.ledger.find(x => x.id === params.id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const payload = await req.json();
  if (typeof payload.amount === "string") payload.amount = parseFloat(payload.amount);
  const parsed = PatchSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const db = await readDB();
  const i = db.ledger.findIndex(x => x.id === params.id);
  if (i === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  db.ledger[i] = { ...db.ledger[i], ...parsed.data, id: db.ledger[i].id };
  await writeDB(db);
  return NextResponse.json(db.ledger[i]);
}

export async function DELETE(_req: Request, { params }: { params: { id: string }}) {
  const db = await readDB();
  const before = db.ledger.length;
  db.ledger = db.ledger.filter(x => x.id !== params.id);
  if (db.ledger.length === before) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await writeDB(db);
  return NextResponse.json({ ok: true });
}
