import MemberForm, { MemberFormValues } from "@/components/client/MemberForm";


export default function NewMemberPage() {
  const today = new Date().toISOString().slice(0, 10);
  const initial: MemberFormValues = { name: "", location: "", interests: "", joined: today };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Add New Member</h1>
        <p className="lead">Create a new entry in the family register.</p>
      </div>
      <MemberForm  initial={initial} mode="create" />
    </div>
  );
}
