import SessionsTable from "@/components/client/SessionsTable";

export const dynamic = "force-dynamic";

export default function SessionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="h1">📅 Monthly Sessions</h1>
        <p className="lead">Plan, document, and learn together.</p>
      </div>
      <SessionsTable />
    </div>
  );
}
