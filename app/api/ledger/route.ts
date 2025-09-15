import { NextResponse } from "next/server";
import { readDB, writeDB, uid, LedgerSchema } from "@/lib/db";

const CreateSchema = LedgerSchema.omit({ id: true });

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.ledger);
}

export async function POST(req: Request) {
  const payload = await req.json();
  if (typeof payload.amount === "string") payload.amount = parseFloat(payload.amount);
  const parsed = CreateSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const rec = { id: uid(), ...parsed.data };
  const db = await readDB();
  db.ledger.unshift(rec);
  await writeDB(db);
  return NextResponse.json(rec, { status: 201 });
}
