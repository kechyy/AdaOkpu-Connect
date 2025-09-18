"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    startTransition(async () => {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (r.ok) {
        router.push(next);
      } else {
        const msg = await r.text();
        setErr(msg || "Login failed");
      }
    });
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
        <form onSubmit={onSubmit} className="card w-full max-w-sm grid gap-4">
            <div>
            <h1 className="text-xl font-semibold">Admin Login</h1>
            <p className="text-sm text-gray-500">Restricted area</p>
            </div>
            <input
            type="password"
            className="input"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            />
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button className="btn" disabled={pending || !password}>
            {pending ? "Signing in…" : "Sign in"}
            </button>
        </form>
    </div>
  );
}
