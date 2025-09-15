import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo";
import { MemberCreateSchema, toMemberAPI } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Normalize and validate the dynamic route id
function extractId(ctx: { params: Record<string, string | string[]> }) {
  const raw = ctx.params?.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  return id ?? "";
}

// GET /api/members/:id
export async function GET(
  _req: NextRequest,
  ctx: { params: Record<string, string | string[]> }
) {
  const id = extractId(ctx);
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const db = await getDb();
  const doc = await db
    .collection("decisions")
    .findOne({ _id: new ObjectId(id) });

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toMemberAPI(doc as any));
}

// PATCH /api/members/:id
export async function PATCH(
  req: NextRequest,
  ctx: { params: Record<string, string | string[]> }
) {
  const id = extractId(ctx);
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = MemberCreateSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const db = await getDb();
  await db
    .collection("decisions")
    .updateOne({ _id: new ObjectId(id) }, { $set: parsed.data });

  const doc = await db
    .collection("decisions")
    .findOne({ _id: new ObjectId(id) });

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toMemberAPI(doc as any));
}

// DELETE /api/members/:id
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Record<string, string | string[]> }
) {
  const id = extractId(ctx);
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection("decisions").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}
