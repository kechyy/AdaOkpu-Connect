import SessionForm from "@/components/client/SessionForm";

export default async function EditSessionPage({ params }:{ params: Promise<{ id: string }> }) {
  const { id } = await params; 
  return (
    <div className="space-y-6">
      <h1 className="h1">Edit Session</h1>
      <SessionForm mode="edit" id={id} />
    </div>
  );
}
