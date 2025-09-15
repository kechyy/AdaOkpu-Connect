import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo";
import { LedgerCreateSchema, toLedgerAPI, toMemberAPI } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/ledger/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const db = await getDb();
  const doc = await db
    .collection("ledger")
    .findOne({ _id: new ObjectId(params.id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toLedgerAPI(doc as any));
}

// PATCH /api/members/:id
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  // allow partial updates, but coerce/normalize known fields
  const parsed = LedgerCreateSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const db = await getDb();
  await db.collection("ledger").updateOne(
    { _id: new ObjectId(params.id) },
    { $set: parsed.data }
  );
  const doc = await db
    .collection("ledger")
    .findOne({ _id: new ObjectId(params.id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toLedgerAPI(doc as any));
}

// DELETE /api/ledger/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const db = await getDb();
  await db.collection("ledger").deleteOne({ _id: new ObjectId(params.id) });
  return NextResponse.json({ ok: true });
}
