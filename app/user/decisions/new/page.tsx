import DecisionForm, { DecisionFormValues } from "@/components/client/DecisionForm";

export default function NewDecisionPage() {
  const initial: DecisionFormValues = { id: "", date: "", decision: "", decidedBy: "", notes: "" };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Add New Decision</h1>
        <p className="lead">Create a new entry in the family register.</p>
      </div>
      <DecisionForm  initial={initial} mode="create" />
    </div>
  );
}


