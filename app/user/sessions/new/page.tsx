import SessionForm, { SessionFormValues } from "@/components/client/SessionForm";

export default function NewSessionPage() {
  const initial : SessionFormValues = { id: "", date: "", topic: "", speaker: "", notes: "", status: "scheduled" };
  return (
    <div className="space-y-6">
      <h1 className="h1">Add Session</h1>
      <p className="lead">Create a new session entry.</p>
      <SessionForm initial={initial} mode="create" />
    </div>
  );
}
