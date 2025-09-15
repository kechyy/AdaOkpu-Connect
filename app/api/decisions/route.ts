import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { DecisionCreateSchema, DecisionDoc, toDecisionAPI } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/members
export async function GET() {
  const db = await getDb();
  const col = db.collection<DecisionDoc>("decisions");     // 👈 typed
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(docs.map(toDecisionAPI));     // ✅ ok now
}

// POST /api/members
export async function POST(req: Request) {
  const payload = await req.json();
  const parsed = DecisionCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const db = await getDb();
  const col = db.collection<DecisionDoc>("decisions");

  const now = new Date();
  const doc = {
    date: parsed.data.date,
    decidedBy: parsed.data.decidedBy,
    decision: parsed.data.decision,
    notes: parsed.data.notes,
    createdAt: now
  } satisfies Omit<DecisionDoc, "_id">;

  const { insertedId } = await col.insertOne(doc as any);
  const saved = await col.findOne({ _id: insertedId });
  return NextResponse.json(toDecisionAPI(saved as any), { status: 201 });
}
