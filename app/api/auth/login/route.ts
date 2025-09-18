import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export const runtime = "nodejs";

function b64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sign(data: string, secret: string) {
  return b64url(crypto.createHmac("sha256", secret).update(data).digest());
}

export async function POST(req: Request) {
  const { password } = await req.json();

  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;

  if (!expected || !secret) {
    return new NextResponse("Server not configured", { status: 500 });
  }

  if (!password || password !== expected) {
    return new NextResponse("Invalid password", { status: 401 });
  }

  // Create a signed session token (role|iat). Valid for 7 days.
  const iat = Math.floor(Date.now() / 1000);
  const data = `admin|${iat}`;
  const sig = sign(data, secret);
  const token = `${data}.${sig}`;

  const maxAge = 60 * 60 * 24 * 7; // 7 days
  (await cookies()).set("ada_admin", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return NextResponse.json({ ok: true });
}
