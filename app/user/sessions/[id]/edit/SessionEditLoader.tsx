// React Query state cached approach
// EditLoader (client)
"use client";

import SessionForm from "@/components/client/SessionForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Session = { id: string; date: string; topic: string; speaker: string; notes?: string; status?: string; };

async function fetchSessionById(id: string): Promise<Session> {
  const r = await fetch(`/api/sessions/${id}`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function SessionEditLoader({ id }: { id: string }) {
  const qc = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", id],
    queryFn: () => fetchSessionById(id),
    // 👇 seed this query from the list cache if available (no extra network)
    initialData: () => {
      const list = qc.getQueryData<Session[]>(["sessions"]);
      return list?.find(s => s.id === id);
    },
  });

  if (isLoading && !sessions) return <div>Loading…</div>;
  if (!sessions) return <div className="text-red-600">Session not found.</div>;

  // pass `member` to your form as initial values
  // (you can still use Zustand to keep unsaved edits if you want)
  return <SessionForm initial={sessions} mode="edit" /> ;
}




