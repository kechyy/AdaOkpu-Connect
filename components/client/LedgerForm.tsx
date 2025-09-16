"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type LedgerFormValues = { id: string; date: string; contributor: string; currency: string; description: string; amount: number };


async function apiCreateLedger(data: Omit<LedgerFormValues, "id">) {
  const r = await fetch("/api/ledger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  console.log('rrrr', r)
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function apiUpdateLedger(id: string, data: Partial<LedgerFormValues>) {
  const r = await fetch(`/api/ledger/${id}`, {
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
  initial: LedgerFormValues;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const form = useForm<LedgerFormValues>({ defaultValues: initial });

  const createMut = useMutation({
    mutationFn: (vals: Omit<LedgerFormValues, "id">) => apiCreateLedger(vals),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ledger"] });
      router.push("/ledger");
    },
  });

  const updateMut = useMutation({
    mutationFn: (vals: LedgerFormValues) => apiUpdateLedger(vals.id!, vals),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ledger"] });
      router.push("/ledger");
    },
  });

  const onSubmit = (vals: LedgerFormValues) => {
    if (mode === "create") {
      const { id, ...rest } = vals;
      createMut.mutate(rest);
    } else {
      console.log('valls', mode)
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
