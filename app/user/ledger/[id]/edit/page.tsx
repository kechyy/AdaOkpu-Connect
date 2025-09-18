import LedgerForm from "@/components/client/LedgerForm";
import LedgerEditLoader from "./LedgerEditLoader";
import Section from "@/components/ui/Section";

export default async function EditLedgerEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 
    return (
      <div className="space-y-6">
        <div>
          <h1 className="h1">Edit Ledger Entry</h1>
          <p className="lead">Update the saved details.</p>
        </div>
        <Section title="Support Ledger Details">
          <LedgerEditLoader id={id} />
        </Section>
      </div>
    );
}
