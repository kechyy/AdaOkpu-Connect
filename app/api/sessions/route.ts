import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import {SessionCreateSchema, SessionDoc, toSessionAPI } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/sessions
export async function GET() {
  const db = await getDb();
  const col = db.collection<SessionDoc>("sessions");     // 👈 typed
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(docs.map(toSessionAPI));     // ✅ ok now
}

// POST /api/sessions
export async function POST(req: Request) {
  const payload = await req.json();
  const parsed = SessionCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const db = await getDb();
  const col = db.collection<SessionDoc>("sessions");
  const now = new Date();
  const doc = {
    date: parsed.data.date,
    speaker: parsed.data.speaker,
    notes: parsed.data.notes,
    status: parsed.data.status,
    topic: parsed.data.topic,
    createdAt: now
  } satisfies Omit<SessionDoc, "_id">;

  const { insertedId } = await col.insertOne(doc as any);
  const saved = await col.findOne({ _id: insertedId });
  return NextResponse.json(toSessionAPI(saved as any), { status: 201 });
}
