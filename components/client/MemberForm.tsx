
"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export type MemberFormValues = {
  id?: string;
  name: string;
  location?: string;
  interests?: string;
  joined: string; // YYYY-MM-DD
};

async function apiCreateMember(data: Omit<MemberFormValues, "id">) {
  const r = await fetch("/api/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function apiUpdateMember(id: string, data: Partial<MemberFormValues>) {
  const r = await fetch(`/api/members/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function MemberForm({
  initial,
  mode, // "create" | "edit"
}: {
  initial: MemberFormValues;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const form = useForm<MemberFormValues>({ defaultValues: initial });

  const createMut = useMutation({
    mutationFn: (vals: Omit<MemberFormValues, "id">) => apiCreateMember(vals),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      router.push("/members");
    },
  });

  const updateMut = useMutation({
    mutationFn: (vals: MemberFormValues) => apiUpdateMember(vals.id!, vals),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      router.push("/members");
    },
  });

  const onSubmit = (vals: MemberFormValues) => {
    if (mode === "create") {
      const { id, ...rest } = vals;
      createMut.mutate(rest);
    } else {
      updateMut.mutate(vals);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 card">
    <input className="input" placeholder="Name" {...form.register("name", { required: true })} />
    <input className="input" placeholder="City, Country" {...form.register("location")} />
    <input className="input" placeholder="Interests" {...form.register("interests")} />
    <input className="input" type="date" {...form.register("joined")} />
    {mode === "edit" && <input type="hidden" {...form.register("id" as any)} />}
    <div className="flex gap-2">
      <button className="btn" disabled={createMut.isPending || updateMut.isPending}>Save</button>
      <button type="button" className="px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100" onClick={() => router.back()}>
        Cancel
      </button>
    </div>
  </form>
  );
}

