import SessionForm from "@/components/client/SessionForm";

export default function EditSessionPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="h1">Edit Session</h1>
      <SessionForm mode="edit" id={params.id} />
    </div>
  );
}
