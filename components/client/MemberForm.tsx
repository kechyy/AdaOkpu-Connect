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
  "Manchester, UK",
  "Glasgow, UK",
  "Dublin, Ireland",
  "New York, USA",
  "Houston, USA",
  "Toronto, Canada",
];

// Minimal, friendly set for MVP. Add more anytime.
const COUNTRY_OPTIONS = [
  { code: "+234", label: "Nigeria", flag: "🇳🇬" },
  { code: "+44",  label: "United Kingdom", flag: "🇬🇧" },
  { code: "+1",   label: "United States/Canada", flag: "🇺🇸" },
  { code: "+353", label: "Ireland", flag: "🇮🇪" },
  { code: "+233", label: "Ghana", flag: "🇬🇭" },
  { code: "+27",  label: "South Africa", flag: "🇿🇦" },
  { code: "+49",  label: "Germany", flag: "🇩🇪" },
  { code: "+33",  label: "France", flag: "🇫🇷" },
  { code: "+39",  label: "Italy", flag: "🇮🇹" },
  { code: "+971", label: "UAE", flag: "🇦🇪" },
  { code: "+61",  label: "Australia", flag: "🇦🇺" },
  { code: "+254", label: "Kenya", flag: "🇰🇪" },
] as const;

export type MemberFormValues = {
  id?: string;
  name: string;
  surname: string;
  family_name: string; // father's / family name
  location?: string;
  // interests will be selected as array in the form; we join to string for API
  interests?: string | string[];
  joined: string; // YYYY-MM-DD
  whatsapp: string; // final combined value sent to API (e.g., +2348012345678)

  // UI-only fields for the split WhatsApp input:
  whatsapp_code?: string;   // e.g., +234
  whatsapp_number?: string; // digits only (local part)
};

async function apiCreateMember(data: Omit<MemberFormValues, "id" | "whatsapp_code" | "whatsapp_number">) {
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

function parseWhatsapp(initial?: string) {
  const raw = (initial ?? "").replace(/\s|-/g, "");
  if (!raw) return { code: "+234", number: "" }; // sensible default
  // match by longest code first
  const sorted = [...COUNTRY_OPTIONS].sort((a, b) => b.code.length - a.code.length);
  for (const c of sorted) {
    if (raw.startsWith(c.code)) {
      const remainder = raw.slice(c.code.length).replace(/\D/g, "");
      return { code: c.code, number: remainder };
    }
  }
  // fallback: no known code found; if it starts with +, treat first 3–4 as code
  if (raw.startsWith("+")) {
    return { code: raw.slice(0, 4), number: raw.slice(4).replace(/\D/g, "") };
  }
  // otherwise, assume Nigeria local number without +
  return { code: "+234", number: raw.replace(/\D/g, "") };
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

  // Prepare defaults for interests (array for multi-select) and whatsapp split
  const defaultInterests = Array.isArray(initial.interests)
    ? initial.interests
    : initial.interests
    ? initial.interests.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const { code: initCode, number: initNumber } = parseWhatsapp(initial.whatsapp);

  const form = useForm<MemberFormValues>({
    defaultValues: {
      ...initial,
      interests: defaultInterests,
      whatsapp_code: initCode,
      whatsapp_number: initNumber,
    },
  });

  const createMut = useMutation({
    mutationFn: (vals: Omit<MemberFormValues, "id" | "whatsapp_code" | "whatsapp_number">) => apiCreateMember(vals),
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
    // Normalize WhatsApp number: digits only, drop leading 0s in the local part (basic trunk drop)
    const digitsOnlyLocal = (vals.whatsapp_number ?? "").replace(/\D/g, "");
    const normalizedLocal = digitsOnlyLocal.replace(/^0+/, "");
    const code = vals.whatsapp_code || "+234";
    const combinedWhatsapp = `${code}${normalizedLocal}`;

    const payload: MemberFormValues = {
      ...vals,
      name: vals.name?.trim(),
      surname: vals.surname?.trim(),
      family_name: vals.family_name?.trim(),
      location: vals.location?.trim(),
      whatsapp: combinedWhatsapp,
      interests: Array.isArray(vals.interests)
        ? vals.interests.join(", ")
        : (vals.interests ?? ""),
    };

    // Remove UI-only fields before sending
    delete (payload as any).whatsapp_code;
    delete (payload as any).whatsapp_number;

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
      {errors.name && <p className="text-xs text-red-600">{String(errors.name.message)}</p>}

      <input
        className="input"
        placeholder="Surname"
        {...form.register("surname", { required: "Surname is required" })}
      />
      {errors.surname && <p className="text-xs text-red-600">{String(errors.surname.message)}</p>}

      <input
        className="input"
        placeholder="Father's / Family Name"
        {...form.register("family_name", { required: "Family name is required" })}
      />
      {errors.family_name && <p className="text-xs text-red-600">{String(errors.family_name.message)}</p>}

      {/* Location with datalist (searchable but allows free text) */}
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

      {/* WhatsApp split: country code (with flag) + local number */}
      <label className="text-sm text-gray-600">WhatsApp</label>
      <div className="grid grid-cols-[8.5rem_1fr] gap-2 sm:grid-cols-[10rem_1fr]">
        <select
          className="input h-auto"
          {...form.register("whatsapp_code", { required: "Code is required" })}
        >
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.label} ({c.code})
            </option>
          ))}
        </select>
        <input
          className="input"
          type="tel"
          placeholder="WhatsApp number (digits only)"
          inputMode="numeric"
          {...form.register("whatsapp_number", {
            required: "WhatsApp number is required",
            pattern: {
              value: /^\d{6,14}$/,
              message: "Enter digits only (6–14)",
            },
          })}
        />
      </div>
      {(errors.whatsapp_code || errors.whatsapp_number) && (
        <p className="text-xs text-red-600">
          {String(errors.whatsapp_code?.message || errors.whatsapp_number?.message)}
        </p>
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
      {errors.interests && <p className="text-xs text-red-600">Select at least one interest</p>}

      <input
        className="input"
        type="date"
        {...form.register("joined", { required: "Date joined is required" })}
      />
      {errors.joined && <p className="text-xs text-red-600">{String(errors.joined.message)}</p>}

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
