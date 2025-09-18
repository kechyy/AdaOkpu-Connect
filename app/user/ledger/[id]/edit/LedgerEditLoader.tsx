// React Query state cached approach
// EditLoader (client)
"use client";

import LedgerForm from "@/components/client/LedgerForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Ledger = { id: string; date: string; contributor: string; currency: string; description: string; amount: number };

async function fetchLedgerById(id: string): Promise<Ledger> {
  const r = await fetch(`/api/ledger/${id}`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function LedgerEditLoader({ id }: { id: string }) {
  const qc = useQueryClient();

  const { data: ledger, isLoading } = useQuery({
    queryKey: ["ledger", id],
    queryFn: () => fetchLedgerById(id),
    // 👇 seed this query from the list cache if available (no extra network)
    initialData: () => {
      const list = qc.getQueryData<Ledger[]>(["ledger"]);
      return list?.find(l => l.id === id);
    },
  });

  if (isLoading && !ledger) return <div>Loading…</div>;
  if (!ledger) return <div className="text-red-600">Support ledger not found.</div>;

  // pass `member` to your form as initial values
  // (you can still use Zustand to keep unsaved edits if you want)
  return <LedgerForm initial={ledger} mode="edit" /> ;
}




