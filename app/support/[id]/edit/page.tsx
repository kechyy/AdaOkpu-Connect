import LedgerForm from "@/components/client/LedgerForm";

export default function EditLedgerEntryPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="h1">Edit Ledger Entry</h1>
      <LedgerForm mode="edit" id={params.id} />
    </div>
  );
}
