"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type EntryFormValues = { id: string; date: string; contributor: string; description: string; amount: number };


async function apiCreateDecision(data: Omit<DecisionFormValues, "id">) {
  const r = await fetch("/api/decisions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function apiUpdateMember(id: string, data: Partial<DecisionFormValues>) {
  const r = await fetch(`/api/decisions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function LedgerForm({
  initial,
  mode, // "create" | "edit"
}: {
  initial: DecisionFormValues;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const form = useForm<DecisionFormValues>({ defaultValues: initial });

  const createMut = useMutation({
    mutationFn: (vals: Omit<DecisionFormValues, "id">) => apiCreateDecision(vals),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["decisions"] });
      router.push("/decisions");
    },
  });

  const updateMut = useMutation({
    mutationFn: (vals: DecisionFormValues) => apiUpdateMember(vals.id!, vals),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["decisions"] });
      router.push("/decisions");
    },
  });

  const onSubmit = (vals: DecisionFormValues) => {
    if (mode === "create") {
      const { id, ...rest } = vals;
      createMut.mutate(rest);
    } else {
      updateMut.mutate(vals);
    }
  };


  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 card">
      <input className="input" type="date" {...form.register("date", { required: true })} />
      <input className="input" placeholder="Contributor" {...form.register("contributor", { required: true })} />
      <input className="input" placeholder="Description" {...form.register("description", { required: true })} />
      <input className="input" type="number" step="0.01" placeholder="Amount" {...form.register("amount", { valueAsNumber: true })} />
      {mode==="edit" && <input type="hidden" {...form.register("id" as any)} />}
      <div className="flex gap-2">
        <button className="btn">Save</button>
        <button type="button" className="px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100" onClick={()=>router.back()}>Cancel</button>
      </div>
    </form>
  );
}
