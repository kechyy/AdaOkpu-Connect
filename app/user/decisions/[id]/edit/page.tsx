
import DecisionEditLoader from "./DecisionEditLoader";
import Section from "@/components/ui/Section";

export default async function EditDecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Edit Decision</h1>
        <p className="lead">Update the saved details.</p>
      </div>
      <Section title="Decision Details">
        <DecisionEditLoader id={id} />
      </Section>
    </div>
  );
}
