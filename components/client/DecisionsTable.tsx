"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import Section from "@/components/ui/Section";
import EmptyState from "@/components/ui/EmptyState";

type Decision = { id: string; date: string; decision: string; decidedBy: string; notes?: string };

async function fetchList(): Promise<Decision[]> {
  const r = await fetch("/api/decisions", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to fetch");
  return r.json();
}
async function apiDelete(id: string) {
  const r = await fetch(`/api/decisions/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Failed to delete");
}

export default function DecisionsTable() {
  const qc = useQueryClient();
  const router = useRouter();
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["decisions"], queryFn: fetchList });

  const del = useMutation({
    mutationFn: apiDelete,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["decisions"] });
      const prev = qc.getQueryData<Decision[]>(["decisions"]) || [];
      qc.setQueryData<Decision[]>(["decisions"], prev.filter(x => x.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(["decisions"], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["decisions"] }),
  });

  const onEdit = (d: Decision) => {
    router.push(`/decisions/${d.id}/edit`);
  };

  const confirmDelete = (id: string) => {
    console.log('idddd', id)
    if (confirm("Delete this member?")) del.mutate(id);
  }

  return (
    <Section title="Decisions" actions={<Link href="/decisions/new" className="btn">Add Decision</Link>}>
      {isLoading ? <div className="p-4 text-sm text-gray-500">Loading…</div> : rows.length === 0 ? (
        <EmptyState>No decisions yet.</EmptyState>
      ) : (
        <table className="table">
          <thead><tr><th className="th">Date</th><th className="th">Decision</th><th className="th">By</th><th className="th text-right w-28">Actions</th></tr></thead>
          <tbody>
            {rows.map(d => (
              <tr key={d.id} className="border-t">
                <td className="td">{d.date}</td>
                <td className="td">{d.decision}</td>
                <td className="td">{d.decidedBy}</td>
                <td className="td">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => onEdit(d)} title="Edit">
                      <Pencil2Icon className="size-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50" onClick={() => confirmDelete(d.id)} title="Delete">
                      <TrashIcon className="size-4" />
                    </button>
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
