import LedgerForm from "@/components/client/LedgerForm";

export default function NewLedgerEntryPage() {
  return (
    <div className="space-y-6">
      <h1 className="h1">Add Ledger Entry</h1>
      <LedgerForm mode="create" />
    </div>
  );
}
