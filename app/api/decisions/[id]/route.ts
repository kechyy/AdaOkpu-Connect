import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo";
import { MemberCreateSchema, toMemberAPI } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/decisions/:id
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const doc = await db
    .collection("decisions")
    .findOne({ _id: new ObjectId(id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toMemberAPI(doc as any));
}

// PATCH /api/decisions/:id
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  // allow partial updates, but coerce/normalize known fields
  const parsed = MemberCreateSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const db = await getDb();
  await db.collection("decisions").updateOne(
    { _id: new ObjectId(id) },
    { $set: parsed.data }
  );
  const doc = await db
    .collection("decisions")
    .findOne({ _id: new ObjectId(id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toMemberAPI(doc as any));
}

// DELETE /api/decisions/:id
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  await db.collection("decisions").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}