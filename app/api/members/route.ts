import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { MemberCreateSchema, MemberDoc, toMemberAPI } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/members
export async function GET() {
  const db = await getDb();
  const col = db.collection<MemberDoc>("members");     // 👈 typed
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(docs.map(toMemberAPI));     // ✅ ok now
}

// POST /api/members
export async function POST(req: Request) {
  const payload = await req.json();
  const parsed = MemberCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const db = await getDb();
  const col = db.collection<MemberDoc>("members");

  const now = new Date();
  const doc = {
    name: parsed.data.name,
    surname: parsed.data.surname,
    family_name: parsed.data.family_name,
    location: parsed.data.location,
    whatsapp: parsed.data.whatsapp,
    interests: parsed.data.interests,
    joined: parsed.data.joined,
    createdAt: now,
  } satisfies Omit<MemberDoc, "_id">;

  const { insertedId } = await col.insertOne(doc as any);
  const saved = await col.findOne({ _id: insertedId });
  return NextResponse.json(toMemberAPI(saved as any), { status: 201 });
}
