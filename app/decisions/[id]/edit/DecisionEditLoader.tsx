// React Query state cached approach
// EditLoader (client)
"use client";

import DecisionForm from "@/components/client/DecisionForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type Decision = { id: string; date: string; decision: string; decidedBy: string; notes?: string };

async function fetchDecisionById(id: string): Promise<Decision> {
  const r = await fetch(`/api/decisions/${id}`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function DecisionEditLoader({ id }: { id: string }) {
  const qc = useQueryClient();

  const { data: decision, isLoading } = useQuery({
    queryKey: ["decisions", id],
    queryFn: () => fetchDecisionById(id),
    // 👇 seed this query from the list cache if available (no extra network)
    initialData: () => {
      const list = qc.getQueryData<Decision[]>(["decisions"]);
      return list?.find(d => d.id === id);
    },
  });

  if (isLoading && !decision) return <div>Loading…</div>;
  if (!decision) return <div className="text-red-600">Decision not found.</div>;

  // pass `member` to your form as initial values
  // (you can still use Zustand to keep unsaved edits if you want)
  return <DecisionForm initial={decision} mode="edit" /> ;
}




