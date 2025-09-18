// middleware.ts (project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN_PATH = "/auth/login";

// --- helpers for HMAC + base64url (Edge safe) ---
function base64UrlFromArrayBuffer(buf: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSha256B64Url(secret: string, data: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return base64UrlFromArrayBuffer(sig);
}

async function verifyToken(token: string, secret: string) {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = await hmacSha256B64Url(secret, data);
  if (sig !== expected) return false;

  const [role, iatStr] = data.split("|");
  const iat = Number(iatStr || 0);
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  const now = Math.floor(Date.now() / 1000);

  return role === "admin" && !!iat && now - iat < maxAge;
}

// --- required export: middleware ---
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Allow public auth pages and static assets
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Require session on protected routes
  const token = req.cookies.get("ada_admin")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = LOGIN_PATH; // always send to /auth/login
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret || !(await verifyToken(token, secret))) {
    const url = req.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Limit where middleware runs (your chosen protected pages)
export const config = {
  matcher: [
    "/",                 // protect home
    "/members/:path*",
    "/sessions/:path*",
    "/decisions/:path*",
    "/ledger/:path*",
    "/welcome/:path*",
    "/user/:path*",
  ],
};
