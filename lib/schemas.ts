import { z } from "zod";
import { ObjectId, WithId } from "mongodb";

// Accept either "string of interests" or ["array", "of", "strings"]
const Interests = z.union([
  z.string().transform((s) => s.trim()),
  z.array(z.string()).transform((arr) => arr.join(", ")),
]);

export const MemberCreateSchema = z.object({
  name: z.string().min(1),
  location: z.string().default(""),
  interests: Interests.default(""),
  joined: z.union([z.string(), z.coerce.date()]).transform((v) =>
    typeof v === "string" ? new Date(v) : v
  ),
});

export type MemberCreate = z.infer<typeof MemberCreateSchema>;

// your MemberDoc type:
export type MemberDoc = {
  _id: ObjectId;          // keep _id here if you wish
  name: string;
  location: string;
  interests: string;
  joined: Date;
  createdAt: Date;
};

export type MemberAPI = {
  id: string;
  name: string;
  location: string;
  interests: string;
  joined: string;     // YYYY-MM-DD for the client
  createdAt: string;  // ISO
};

export function toMemberAPI(d: WithId<MemberDoc>): MemberAPI {
  return {
    id: d._id.toString(),
    name: d.name,
    location: d.location,
    interests: d.interests,
    joined: d.joined.toISOString().slice(0, 10),
    createdAt: d.createdAt.toISOString(),
  };
}





// Decision model

export const DecisionCreateSchema = z.object({
  date: z.union([z.string(), z.coerce.date()]).transform((v) => new Date(v)),
  decision: z.string().min(1),
  decidedBy: z.string().min(1),
  notes: z.string().optional().default(""),
});

export type DecisionCreate = z.infer<typeof DecisionCreateSchema>;

// your MemberDoc type:
export type DecisionDoc = {
  _id: ObjectId;          // keep _id here if you wish
  date: Date;
  decision: string;
  decidedBy: string;
  notes: string;
  createdAt: Date
};

export type DecisionAPI = {
  id: string;
  date: string;
  decision: string;
  decidedBy: string;
  notes: string; 
  createdAt: string;
};

export function toDecisionAPI(d: WithId<DecisionDoc>): DecisionAPI {
  return {
    id: d._id.toString(),
    date: d.date.toISOString().slice(0, 10),
    decision: d.decision,
    decidedBy: d.decidedBy,
    notes: d.notes,
    createdAt: d.createdAt.toISOString(),
  };
}







// Ledger Model
export const LedgerCreateSchema = z.object({
  date: z.union([z.string(), z.coerce.date()]).transform((v) => new Date(v)),
  type: z.enum(["in", "out"]),
  contributor: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number(),
  currency: z.string().default("NGN"),
});

export type LedgerCreate = z.infer<typeof LedgerCreateSchema>;

// your MemberDoc type:
export type LedgerDoc = {
  _id: ObjectId;          // keep _id here if you wish
  date: Date;
  contributor: string;
  description: string;
  amount: number;
  currency: string
  createdAt: Date
};

export type LedgerAPI = {
  id: string;
  date: string;
  contributor: string;
  description: string;
  amount: number; 
  currency: string;
  createdAt: string;
};

export function toLedgerAPI(l: WithId<LedgerDoc>): LedgerAPI {
  return {
    id: l._id.toString(),
    date: l.date.toISOString().slice(0, 10),
    contributor: l.contributor,
    description: l.description,
    amount: l.amount,
    currency: l.currency,
    createdAt: l.createdAt.toISOString(),
  };
}

export const SessionCreateSchema = z.object({
  date: z.union([z.string(), z.coerce.date()]).transform((v) => new Date(v)),
  topic: z.string().min(1),
  speaker: z.string().min(1),
  notes: z.string().optional().default(""),
  status: z.enum(["scheduled", "planned", "done"]).default("scheduled"),
});

// helpers to map _id -> id + ISO dates if you need them
export const toAPI = (doc: any) => ({
  ...doc,
  id: (doc._id as ObjectId).toString(),
  _id: undefined,
  date: doc.date ? new Date(doc.date).toISOString().slice(0, 10) : undefined,
  createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
});

