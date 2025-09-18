import MemberForm, { MemberFormValues } from "@/components/client/MemberForm";
import Section from "@/components/ui/Section";
import EditLoader from "./EditLoader";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  // Server shell; actual draft comes from client store (fast), with a client fallback fetcher.
  const { id } = await params; 
  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Edit Member</h1>
        <p className="lead">Update the saved details.</p>
      </div>
      <Section title="Member Details">
        <EditLoader id={id} />
      </Section>
    </div>
  );
}
