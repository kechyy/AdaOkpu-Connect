"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import Section from "@/components/ui/Section";
import EmptyState from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";

type Session = { id: string; date: string; topic: string; speaker: string; notes?: string; status: string; };

async function fetchSessions(): Promise<Session[]> {
  const r = await fetch("/api/sessions", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to fetch");
  return r.json();
}
async function apiDelete(id: string) {
  const r = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Failed to delete");
}


export default function SessionsTable() {
  const qc = useQueryClient();
  const router = useRouter();

  const { data: sessions = [], isLoading } = useQuery({ queryKey: ["sessions"], queryFn: fetchSessions });

  const del = useMutation({
    mutationFn: apiDelete,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["sessions"] });
      const prev = qc.getQueryData<Session[]>(["sessions"]) || [];
      qc.setQueryData<Session[]>(["sessions"], prev.filter(s => s.id !== id));
      return { prev };
    },
    onError: (_e, _vars, ctx) => { if (ctx?.prev) qc.setQueryData(["sessions"], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });

  const onEdit = (m: Session) => {
    router.push(`/sessions/${m.id}/edit`);
  };

  const confirmDelete = (id: string) => {
    if (confirm("Delete this session?")) del.mutate(id);
  };

  return (
    <Section title="Monthly Sessions" actions={<Link href="/sessions/new" className="btn">Add Session</Link>}>
      {isLoading ? <div className="p-4 text-sm text-gray-500">Loading…</div> : sessions.length === 0 ? (
        <EmptyState>No sessions yet.</EmptyState>
      ) : (
        <table className="table">
          <thead><tr><th className="th">Date</th><th className="th">Topic</th><th className="th">Speaker</th><th className="th text-right w-28">Actions</th></tr></thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className="border-t">
                <td className="td text-sm">{s.date}</td>
                <td className="td text-sm">{s.topic}</td>
                <td className="td text-sm">{s.speaker}</td>
                <td className="td text-sm">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => onEdit(s)} title="Edit">
                      <Pencil2Icon className="size-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50" onClick={() => confirmDelete(s.id)} title="Delete">
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
