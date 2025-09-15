import DecisionsTable from "@/components/client/DecisionsTable";

export const dynamic = "force-dynamic";

export default function DecisionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="h1">📝 Decisions Log</h1>
        <p className="lead">One-line record of decisions for transparency.</p>
      </div>
      <DecisionsTable />
    </div>
  );
}
