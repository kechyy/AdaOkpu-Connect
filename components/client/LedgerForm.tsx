"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Entry = { id: string; date: string; contributor: string; description: string; amount: number };

async function fetchRow(id: string): Promise<Entry> {
  const r = await fetch(`/api/ledger/${id}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Not found");
  return r.json();
}
async function apiCreate(payload: Omit<Entry, "id">): Promise<Entry> {
  const r = await fetch("/api/ledger", { method: "POST", body: JSON.stringify({ ...payload, amount: Number(payload.amount) }) });
  if (!r.ok) throw new Error("Failed");
  return r.json();
}
async function apiUpdate(id: string, payload: Entry): Promise<Entry> {
  const r = await fetch(`/api/ledger/${id}`, { method: "PATCH", body: JSON.stringify({ ...payload, amount: Number(payload.amount) }) });
  if (!r.ok) throw new Error("Failed");
  return r.json();
}

export default function LedgerForm({ mode, id }: { mode: "create" | "edit"; id?: string }) {
  const router = useRouter();
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ["ledger", id], queryFn: () => fetchRow(id!), enabled: mode === "edit" && !!id });
  const form = useForm<Omit<Entry, "id"> | Entry>({
    defaultValues: mode === "create" ?
      { date: new Date().toISOString().slice(0,10), contributor: "", description: "", amount: 0 } :
      undefined
  });
  useEffect(() => { if (mode === "edit" && data) form.reset(data); }, [mode, data, form]);

  const create = useMutation({
    mutationFn: (p: Omit<Entry,"id">) => apiCreate(p),
    onMutate: async (p) => {
      await qc.cancelQueries({ queryKey: ["ledger"] });
      const prev = qc.getQueryData<Entry[]>(["ledger"]) || [];
      const temp: Entry = { id: "temp-"+Date.now(), ...p };
      qc.setQueryData<Entry[]>(["ledger"], [temp, ...prev]);
      return { prev, temp };
    },
    onError: (_e,_v,ctx)=>{ if(ctx?.prev) qc.setQueryData(["ledger"], ctx.prev); },
    onSuccess: (saved,_v,ctx)=>{ qc.setQueryData<Entry[]>(["ledger"], (curr=[])=>curr.map(x=>x.id===ctx?.temp.id?saved:x)); },
    onSettled: ()=>router.push("/support")
  });

  const update = useMutation({
    mutationFn: (p: Entry)=>apiUpdate(p.id, p),
    onMutate: async (p)=>{
      await qc.cancelQueries({ queryKey: ["ledger"] });
      const prev = qc.getQueryData<Entry[]>(["ledger"]) || [];
      qc.setQueryData<Entry[]>(["ledger"], prev.map(x=>x.id===p.id?{...x,...p}:x));
      return { prev };
    },
    onError: (_e,_v,ctx)=>{ if(ctx?.prev) qc.setQueryData(["ledger"], ctx.prev); },
    onSettled: ()=>router.push("/support")
  });

  const onSubmit = (v:any)=> mode==="create"?create.mutate(v as Omit<Entry,"id">):update.mutate(v as Entry);

  if (mode==="edit" && !data) return <div className="p-4 text-sm text-gray-500">Loading…</div>;

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
