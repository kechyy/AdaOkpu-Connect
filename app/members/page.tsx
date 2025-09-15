import MemberTable from "@/components/client/MemberTable";

export const dynamic = "force-dynamic";

export default function MembersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="h1">📄 Member List</h1>
        <p className="lead">Internal list to help us stay connected.</p>
      </div>
      <MemberTable />
    </div>
  );
}
