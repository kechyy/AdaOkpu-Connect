"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import Section from "@/components/ui/Section";
import EmptyState from "@/components/ui/EmptyState";
import { useEditStore } from "@/stores/edit";

type Member = {
  id: string;
  name: string;
  location?: string;
  interests?: string;
  joined: string;
};

async function fetchMembers(): Promise<Member[]> {
  const r = await fetch("/api/members", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to fetch");
  return r.json();
}
async function apiDelete(id: string) {
  const r = await fetch(`/api/members/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Failed to delete");
}

export default function MemberTable() {
  const qc = useQueryClient();
  const router = useRouter();
  const setDraft = useEditStore(s => s.setMemberDraft);

  const { data: members = [], isLoading } = useQuery({ queryKey: ["members"], queryFn: fetchMembers });

  const del = useMutation({
    mutationFn: apiDelete,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["members"] });
      const prev = qc.getQueryData<Member[]>(["members"]) || [];
      qc.setQueryData<Member[]>(["members"], prev.filter(m => m.id !== id));
      return { prev };
    },
    onError: (_e, _vars, ctx) => { if (ctx?.prev) qc.setQueryData(["members"], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });

  const onEdit = (m: Member) => {
    setDraft(m);
    router.push(`/members/${m.id}/edit`);
  };

  const confirmDelete = (id: string) => {
    if (confirm("Delete this member?")) del.mutate(id);
  };

  return (
    <Section title="Current Members" actions={<Link href="/members/new" className="btn">Add New Member</Link>}>
      {isLoading ? (
        <div className="p-4 text-sm text-gray-500">Loading…</div>
      ) : members.length === 0 ? (
        <EmptyState>No members found. Add the first one!</EmptyState>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th className="th">Name</th>
              <th className="th">Location</th>
              <th className="th">Interest Areas</th>
              <th className="th">Intro Date</th>
              <th className="th text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} className="border-t">
                <td className="td">{m.name}</td>
                <td className="td">{m.location}</td>
                <td className="td">{m.interests}</td>
                <td className="td">{m.joined}</td>
                <td className="td">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => onEdit(m)} title="Edit">
                      <Pencil2Icon className="size-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50" onClick={() => confirmDelete(m.id)} title="Delete">
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
