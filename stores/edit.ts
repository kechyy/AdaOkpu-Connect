// stores/edit.ts
import { create } from "zustand";

export type MemberDraft = {
  id?: string;
  name: string;
  location?: string;
  interests?: string;
  joined: string; // YYYY-MM-DD
};

type EditState = {
  memberDraft: MemberDraft | null;
  setMemberDraft: (m: MemberDraft | null) => void;
  clear: () => void;
};

export const useEditStore = create<EditState>((set) => ({
  memberDraft: null,
  setMemberDraft: (m) => set({ memberDraft: m }),
  clear: () => set({ memberDraft: null }),
}));
