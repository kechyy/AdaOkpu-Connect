// React Query state cached approach
// EditLoader (client)
"use client";

import MemberForm from "@/components/client/MemberForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Member = { id: string; name: string; location?: string; interests?: string; joined: string };

async function fetchMemberById(id: string): Promise<Member> {
  const r = await fetch(`/api/members/${id}`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function EditLoader({ id }: { id: string }) {
  const qc = useQueryClient();

  const { data: member, isLoading } = useQuery({
    queryKey: ["member", id],
    queryFn: () => fetchMemberById(id),
    // 👇 seed this query from the list cache if available (no extra network)
    initialData: () => {
      const list = qc.getQueryData<Member[]>(["members"]);
      return list?.find(m => m.id === id);
    },
  });

  if (isLoading && !member) return <div>Loading…</div>;
  if (!member) return <div className="text-red-600">Member not found.</div>;

  // pass `member` to your form as initial values
  // (you can still use Zustand to keep unsaved edits if you want)
  return <MemberForm initial={member} mode="edit" /> ;
}








// Zustan state approach

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import MemberForm, { MemberFormValues } from "@/components/client/MemberForm";
// import { useEditStore } from "@/stores/edit";

// async function fetchMemberById(id: string): Promise<MemberFormValues> {
//   const r = await fetch(`/api/members/${id}`, { cache: "no-store" });
//   if (!r.ok) throw new Error(await r.text());
//   const m = await r.json();
//   return { id: m.id, name: m.name, location: m.location, interests: m.interests, joined: m.joined };
// }

// export default function EditLoader({ id }: { id: string }) {
//   const draft = useEditStore((s) => s.memberDraft);
//   const clear = useEditStore((s) => s.clear);
//   const [fallback, setFallback] = useState<MemberFormValues | null>(null);
//   const [loading, setLoading] = useState(false);
    

//   const initial = useMemo<MemberFormValues | null>(() => {
//     if (draft && draft.id === id) return draft;
//     return fallback;
//   }, [draft, fallback, id]);

//   useEffect(() => {
//     let ignore = false;
  
//     if (!id) return;
  
//     // If we already have the matching draft, set it and skip fetching.
//     if (draft && draft.id === id) {
//       setFallback(draft);
//       return;
//     }
  
//     // Otherwise, fetch from the API as fallback.
//     setLoading(true);
//     fetchMemberById(id)
//       .then((m) => { if (!ignore) setFallback(m); })
//       .catch(() => { if (!ignore) setFallback(null); })
//       .finally(() => { if (!ignore) setLoading(false); });
  
//     return () => { ignore = true; /* IMPORTANT: don't clear draft here */ };
//   }, [id, draft]);
  

//   if (loading && !initial) return <div className="p-2 text-sm text-gray-500">Loading…</div>;
//   if (!initial) return <div className="p-2 text-sm text-red-600">Member not found.</div>;

//   return <MemberForm initial={initial} mode="edit" />;
// }


