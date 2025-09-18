import SessionForm from "@/components/client/SessionForm";
import Section from "@/components/ui/Section";
import SessionEditLoader from "./SessionEditLoader";

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 
  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Edit Session</h1>
        <p className="lead">Update the saved details.</p>
      </div>
      <Section title="Member Details">
        <SessionEditLoader id={id} />
      </Section>
    </div>
  );
}
