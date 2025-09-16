"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type SessionFormValues = { id: string; date: string; topic: string; speaker: string; notes?: string; status?: string; };

async function apiCreateSession(data: Omit<SessionFormValues, "id">) {
  console.log('rrrr', data)
  const r = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function apiUpdateSession(id: string, data: Partial<SessionFormValues>) {
  const r = await fetch(`/api/sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}


export default function SessionForm({  initial,
  mode, // "create" | "edit"
}: {
  initial: SessionFormValues;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const form = useForm<SessionFormValues>({ defaultValues: initial });

  const createMut = useMutation({
    mutationFn: (vals: Omit<SessionFormValues, "id">) => apiCreateSession(vals),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      router.push("/sessions");
    },
  });

  const updateMut = useMutation({
    mutationFn: (vals: SessionFormValues) => apiUpdateSession(vals.id!, vals),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      router.push("/sessions");
    },
  });

  const onSubmit = (vals: SessionFormValues) => {
    if (mode === "create") {
      const { id, ...rest } = vals;
      console.log('createee', rest)
      createMut.mutate(rest);
    } else {
      console.log('valls', mode)
      updateMut.mutate(vals);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 card">
      <input className="input" type="date" {...form.register("date", { required: true })} />
      <input className="input" placeholder="Topic" {...form.register("topic", { required: true })} />
      <input className="input" placeholder="Speaker" {...form.register("speaker", { required: true })} />
      <textarea className="input" placeholder="Notes (optional)" {...form.register("notes")} />
      {mode==="edit" && <input type="hidden" {...form.register("id" as any)} />}
      <div className="flex gap-2">
        <button className="btn">Save</button>
        <button type="button" className="px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100" onClick={()=>router.back()}>Cancel</button>
      </div>
    </form>
  );
}
