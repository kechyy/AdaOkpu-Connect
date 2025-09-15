import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function GET() {
  const db = await readDB();
  return NextResponse.json({ text: db.welcome });
}

export async function PUT(req: Request) {
  const { text } = await req.json();
  if (typeof text !== "string" || text.length < 5) {
    return NextResponse.json({ error: "Invalid text" }, { status: 400 });
  }
  const db = await readDB();
  db.welcome = text;
  await writeDB(db);
  return NextResponse.json({ text });
}
