"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Session = { id: string; date: string; topic: string; speaker: string; notes?: string };

async function fetchRow(id: string): Promise<Session> {
  const r = await fetch(`/api/sessions/${id}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Not found");
  return r.json();
}
async function apiCreate(payload: Omit<Session, "id">): Promise<Session> {
  const r = await fetch("/api/sessions", { method: "POST", body: JSON.stringify(payload) });
  if (!r.ok) throw new Error("Failed");
  return r.json();
}
async function apiUpdate(id: string, payload: Session): Promise<Session> {
  const r = await fetch(`/api/sessions/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
  if (!r.ok) throw new Error("Failed");
  return r.json();
}

export default function SessionForm({ mode, id }: { mode: "create" | "edit"; id?: string }) {
  const router = useRouter();
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ["session", id], queryFn: () => fetchRow(id!), enabled: mode === "edit" && !!id });
  const form = useForm<Omit<Session, "id"> | Session>({
    defaultValues: mode === "create" ?
      { date: new Date().toISOString().slice(0,10), topic: "", speaker: "", notes: "" } :
      undefined
  });
  useEffect(() => { if (mode === "edit" && data) form.reset(data); }, [mode, data, form]);

  const create = useMutation({
    mutationFn: (p: Omit<Session,"id">) => apiCreate(p),
    onMutate: async (p) => {
      await qc.cancelQueries({ queryKey: ["sessions"] });
      const prev = qc.getQueryData<Session[]>(["sessions"]) || [];
      const temp: Session = { id: "temp-"+Date.now(), ...p };
      qc.setQueryData<Session[]>(["sessions"], [temp, ...prev]);
      return { prev, temp };
    },
    onError: (_e,_v,ctx)=>{ if(ctx?.prev) qc.setQueryData(["sessions"], ctx.prev); },
    onSuccess: (saved,_v,ctx)=>{ qc.setQueryData<Session[]>(["sessions"], (curr=[])=>curr.map(x=>x.id===ctx?.temp.id?saved:x)); },
    onSettled: ()=>router.push("/sessions")
  });

  const update = useMutation({
    mutationFn: (p: Session)=>apiUpdate(p.id, p),
    onMutate: async (p)=>{
      await qc.cancelQueries({ queryKey: ["sessions"] });
      const prev = qc.getQueryData<Session[]>(["sessions"]) || [];
      qc.setQueryData<Session[]>(["sessions"], prev.map(x=>x.id===p.id?{...x,...p}:x));
      return { prev };
    },
    onError: (_e,_v,ctx)=>{ if(ctx?.prev) qc.setQueryData(["sessions"], ctx.prev); },
    onSettled: ()=>router.push("/sessions")
  });

  const onSubmit = (v:any)=> mode==="create"?create.mutate(v as Omit<Session,"id">):update.mutate(v as Session);

  if (mode==="edit" && !data) return <div className="p-4 text-sm text-gray-500">Loading…</div>;

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
