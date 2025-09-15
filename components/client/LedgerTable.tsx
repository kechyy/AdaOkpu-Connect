"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import Section from "@/components/ui/Section";
import EmptyState from "@/components/ui/EmptyState";

type Entry = { id: string; date: string; contributor: string; description: string; amount: number };

async function fetchList(): Promise<Entry[]> {
  const r = await fetch("/api/ledger", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to fetch");
  return r.json();
}
async function apiDelete(id: string) {
  const r = await fetch(`/api/ledger/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Failed to delete");
}

export default function LedgerTable() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["ledger"], queryFn: fetchList });

  const del = useMutation({
    mutationFn: apiDelete,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["ledger"] });
      const prev = qc.getQueryData<Entry[]>(["ledger"]) || [];
      qc.setQueryData<Entry[]>(["ledger"], prev.filter(x => x.id !== id));
      return { prev };
    },
    onError: (_e,_v,ctx)=>{ if(ctx?.prev) qc.setQueryData(["ledger"], ctx.prev); },
    onSettled: ()=>qc.invalidateQueries({ queryKey: ["ledger"] })
  });

  return (
    <Section title="Support Ledger" actions={<Link href="/support/new" className="btn">Add Entry</Link>}>
      {isLoading ? <div className="p-4 text-sm text-gray-500">Loading…</div> : rows.length === 0 ? (
        <EmptyState>No entries yet.</EmptyState>
      ) : (
        <table className="table">
          <thead><tr><th className="th">Date</th><th className="th">Contributor</th><th className="th">Description</th><th className="th">Amount</th><th className="th text-right w-28">Actions</th></tr></thead>
          <tbody>
            {rows.map(e => (
              <tr key={e.id} className="border-t">
                <td className="td">{e.date}</td>
                <td className="td">{e.contributor}</td>
                <td className="td">{e.description}</td>
                <td className="td">₦{e.amount.toLocaleString()}</td>
                <td className="td">
                  <div className="flex justify-end gap-2">
                    <Link href={`/support/${e.id}/edit`} className="p-2 rounded-lg hover:bg-gray-100" title="Edit"><Pencil2Icon className="size-4" /></Link>
                    <button onClick={()=>del.mutate(e.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Delete"><TrashIcon className="size-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Section>
  );
}
