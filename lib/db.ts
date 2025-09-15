import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";

export const MemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  location: z.string().optional().default(""),
  interests: z.string().optional().default(""),
  joined: z.string().min(1)
});
export type Member = z.infer<typeof MemberSchema>;

export const DecisionSchema = z.object({
  id: z.string(),
  date: z.string().min(1),
  decision: z.string().min(1),
  decidedBy: z.string().min(1),
  notes: z.string().optional().default("")
});
export type Decision = z.infer<typeof DecisionSchema>;

export const LedgerSchema = z.object({
  id: z.string(),
  date: z.string().min(1),
  contributor: z.string().min(1),
  description: z.string().min(1),
  amount: z.number()
});
export type LedgerEntry = z.infer<typeof LedgerSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  date: z.string().min(1),
  topic: z.string().min(1),
  speaker: z.string().min(1),
  notes: z.string().optional().default("")
});
export type Session = z.infer<typeof SessionSchema>;

const DB_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "db.json");

type DB = {
  members: Member[];
  decisions: Decision[];
  ledger: LedgerEntry[];
  sessions: Session[];
  welcome: string;
};

const DEFAULT_WELCOME = `Welcome to the Ada-Okpu WhatsApp family!
Our purpose: unite all daughters & granddaughters for support, learning, coordination, and heritage.
Our foundation is LOVE. Even when we disagree, we do so in love.
Tags: [ANN] [EVENT] [HELP] [PRAYER] [JOB] [SELL] [INFO] [URGENT]. Quiet hours: 22:00–06:00.`;

async function ensure() {
  try { await fs.mkdir(DB_DIR, { recursive: true }); } catch {}
  try { await fs.access(DB_FILE); }
  catch {
    const seed: DB = { members: [], decisions: [], ledger: [], sessions: [], welcome: DEFAULT_WELCOME };
    await fs.writeFile(DB_FILE, JSON.stringify(seed, null, 2), "utf-8");
  }
}

export async function readDB(): Promise<DB> {
  await ensure();
  const raw = await fs.readFile(DB_FILE, "utf-8");
  const db = JSON.parse(raw) as Partial<DB>;
  // backfill fields if older file exists
  return {
    members: db.members ?? [],
    decisions: db.decisions ?? [],
    ledger: db.ledger ?? [],
    sessions: db.sessions ?? [],
    welcome: db.welcome ?? DEFAULT_WELCOME,
  };
}
export async function writeDB(db: DB): Promise<void> {
  await ensure();
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
