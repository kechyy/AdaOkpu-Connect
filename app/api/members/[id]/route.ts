import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo";
import { MemberCreateSchema, toMemberAPI } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/members/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const db = await getDb();
  const doc = await db
    .collection("members")
    .findOne({ _id: new ObjectId(params.id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toMemberAPI(doc as any));
}

// PATCH /api/members/:id
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  // allow partial updates, but coerce/normalize known fields
  const parsed = MemberCreateSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const db = await getDb();
  await db.collection("members").updateOne(
    { _id: new ObjectId(params.id) },
    { $set: parsed.data }
  );
  const doc = await db
    .collection("members")
    .findOne({ _id: new ObjectId(params.id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toMemberAPI(doc as any));
}

// DELETE /api/members/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const db = await getDb();
  await db.collection("members").deleteOne({ _id: new ObjectId(params.id) });
  return NextResponse.json({ ok: true });
}
