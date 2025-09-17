"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const INTEREST_OPTIONS = [
  "Welfare & Care",
  "Events & Logistics",
  "Finance & Contributions",
  "Media & Communications",
  "Prayer & Chaplaincy",
  "Mentoring & Youth",
  "Business & Careers",
  "Health & Wellness",
  "Education & Scholarships",
  "Culture & Heritage",
  "Safeguarding & Security",
  "Fundraising & Partnerships",
  "Technology & Data",
  "Hospitality & Visitation",
  "Immigration & Abroad Support",
  "Outreach & Community Service",
  "Other",
] as const;

const LOCATION_OPTIONS = [
  "Aba, Nigeria",
  "Enugu, Nigeria",
  "Lagos, Nigeria",
  "Abuja, Nigeria",
  "Port Harcourt, Nigeria",
  "Onitsha, Nigeria",
  "Owerri, Nigeria",
  "London, UK",
  "Birmingham, UK",
  "Coventry, UK",
  "Manchester, UK",
  "Glasgow, UK",
  "Dublin, Ireland",
  "New York, USA",
  "Houston, USA",
  "Toronto, Canada",
];

export type MemberFormValues = {
  id?: string;
  name: string;
  surname: string;
  family_name: string; // father's name / family name
  location?: string;
  // Allow multi-select for interests in the form; join to string on submit for API
  interests?: string | string[];
  joined: string; // YYYY-MM-DD
  whatsapp: string;
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

  // Ensure interests default to an array for the <select multiple>
  const defaultInterests = Array.isArray(initial.interests)
    ? initial.interests
    : initial.interests
    ? initial.interests.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const form = useForm<MemberFormValues>({
    defaultValues: { ...initial, interests: defaultInterests },
  });

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
    // Normalize payload
    const payload: MemberFormValues = {
      ...vals,
      name: vals.name?.trim(),
      surname: vals.surname?.trim(),
      family_name: vals.family_name?.trim(),
      location: vals.location?.trim(),
      whatsapp: vals.whatsapp.replace(/\s|-/g, ""), // remove spaces/dashes
      interests: Array.isArray(vals.interests)
        ? vals.interests.join(", ")
        : (vals.interests ?? ""),
    };

    if (mode === "create") {
      const { id, ...rest } = payload;
      createMut.mutate(rest);
    } else {
      updateMut.mutate(payload);
    }
  };

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 card">
      <input
        className="input"
        placeholder="First Name"
        {...form.register("name", { required: "First name is required" })}
      />
      {errors.name && (
        <p className="text-xs text-red-600">{String(errors.name.message)}</p>
      )}

      <input
        className="input"
        placeholder="Surname"
        {...form.register("surname", { required: "Surname is required" })}
      />
      {errors.surname && (
        <p className="text-xs text-red-600">{String(errors.surname.message)}</p>
      )}

      <input
        className="input"
        placeholder="Father's / Family Name"
        {...form.register("family_name", { required: "Family name is required" })}
      />
      {errors.family_name && (
        <p className="text-xs text-red-600">{String(errors.family_name.message)}</p>
      )}

      {/* Location with datalist (searchable, but still allows free text) */}
      <input
        className="input"
        placeholder="City, Country"
        list="location-list"
        autoComplete="off"
        {...form.register("location")}
      />
      <datalist id="location-list">
        {LOCATION_OPTIONS.map((loc) => (
          <option key={loc} value={loc} />
        ))}
      </datalist>

      {/* WhatsApp number */}
      <input
        className="input"
        type="tel"
        placeholder="WhatsApp Number (e.g., +2348012345678)"
        {...form.register("whatsapp", {
          required: "WhatsApp number is required",
          pattern: {
            value: /^\+?\d{10,15}$/,
            message: "Enter a valid phone (10–15 digits, optional +)",
          },
        })}
      />
      {errors.whatsapp && (
        <p className="text-xs text-red-600">{String(errors.whatsapp.message)}</p>
      )}

      {/* Interests as dropdown (multi-select) */}
      <label className="text-sm text-gray-600">Interests (choose one or more)</label>
      <select
        className="input h-auto"
        multiple
        {...form.register("interests", { required: true })}
      >
        {INTEREST_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {errors.interests && (
        <p className="text-xs text-red-600">Select at least one interest</p>
      )}

      <input
        className="input"
        type="date"
        {...form.register("joined", { required: "Date joined is required" })}
      />
      {errors.joined && (
        <p className="text-xs text-red-600">{String(errors.joined.message)}</p>
      )}

      {mode === "edit" && <input type="hidden" {...form.register("id" as const)} />}

      <div className="flex gap-2">
        <button className="btn" disabled={createMut.isPending || updateMut.isPending}>
          Save
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
