import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo";
import { SessionCreateSchema, toSessionAPI } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/sessions/:id
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const doc = await db
    .collection("sessions")
    .findOne({ _id: new ObjectId(id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toSessionAPI(doc as any));
}

// PATCH /api/sessions/:id
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  // allow partial updates, but coerce/normalize known fields
  const parsed = SessionCreateSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const db = await getDb();
  await db.collection("sessions").updateOne(
    { _id: new ObjectId(id) },
    { $set: parsed.data }
  );
  const doc = await db
    .collection("sessions")
    .findOne({ _id: new ObjectId(id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toSessionAPI(doc as any));
}

// DELETE /api/sessions/:id
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  await db.collection("sessions").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}
