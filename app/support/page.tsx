import LedgerTable from "@/components/client/LedgerTable";

export const dynamic = "force-dynamic";

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="h1">🤝 Support Ledger</h1>
        <p className="lead">Transparent record of contributions and disbursements.</p>
      </div>
      <LedgerTable />
    </div>
  );
}
