"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";

async function fetchWelcome(): Promise<{ text: string }> {
  const r = await fetch("/api/welcome", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to fetch");
  return r.json();
}
async function putWelcome(text: string): Promise<{ text: string }> {
  const r = await fetch("/api/welcome", { method: "PUT", body: JSON.stringify({ text }) });
  if (!r.ok) throw new Error("Failed to save");
  return r.json();
}

export default function WelcomeEditor() {
  const { data, isLoading } = useQuery({ queryKey: ["welcome"], queryFn: fetchWelcome });
  const form = useForm<{ text: string }>({ values: { text: data?.text || "" } });
  const save = useMutation({ mutationFn: (v: { text: string }) => putWelcome(v.text) });

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading…</div>;

  return (
    <form onSubmit={form.handleSubmit(v => save.mutate(v))} className="card space-y-3">
      <textarea className="input h-48" {...form.register("text", { required: true, minLength: 5 })} />
      <button className="btn" disabled={save.isPending}>Save Welcome Text</button>
    </form>
  );
}
