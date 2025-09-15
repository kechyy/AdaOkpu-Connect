import SessionForm from "@/components/client/SessionForm";

export default function NewSessionPage() {
  return (
    <div className="space-y-6">
      <h1 className="h1">Add Session</h1>
      <SessionForm mode="create" />
    </div>
  );
}
