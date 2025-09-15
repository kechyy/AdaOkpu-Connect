import LedgerForm, { LedgerFormValues } from "@/components/client/LedgerForm";

export default function NewLedgerEntryPage() {
  const initial: LedgerFormValues = { id: "", date: "", contributor: "", currency: "", description: "", amount: 0 };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Add New Support Ledger</h1>
        <p className="lead">Create a new new support ledger entry.</p>
      </div>
      <LedgerForm  initial={initial} mode="create" />
    </div>
  );
}
