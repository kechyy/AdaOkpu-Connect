import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import {LedgerCreateSchema, LedgerDoc, toLedgerAPI } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/ledgers
export async function GET() {
  const db = await getDb();
  const col = db.collection<LedgerDoc>("ledger");     // 👈 typed
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(docs.map(toLedgerAPI));     // ✅ ok now
}

// POST /api/ledgers
export async function POST(req: Request) {
  const payload = await req.json();
  const parsed = LedgerCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const db = await getDb();
  const col = db.collection<LedgerDoc>("ledger");
  const now = new Date();
  const doc = {
    date: parsed.data.date,
    contributor: parsed.data.contributor,
    description: parsed.data.description,
    currency: parsed.data.currency,
    amount: parsed.data.amount,
    createdAt: now
  } satisfies Omit<LedgerDoc, "_id">;

  const { insertedId } = await col.insertOne(doc as any);
  const saved = await col.findOne({ _id: insertedId });
  return NextResponse.json(toLedgerAPI(saved as any), { status: 201 });
}
