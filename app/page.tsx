export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="h1">Umuada-Ogbonna Tools</h1>
      <p className="lead">Use the navigation to manage members, decisions, support, sessions, and the welcome message.</p>
      <div className="grid md:grid-cols-1 gap-4">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800">Welcome to Umuada Ogbonna Bloodline Sisterhood!</h2>
          <p className="text-gray-600">
            We are so glad to have you join us. Umuada-Ogbonna-Bloodline is a group of women who support each other in our personal and spiritual growth. Here, we build community, share wisdom, and uplift one another in love. We hope you will find this group to be a source of strength, encouragement, and friendship.
          </p>          
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Member List: add and view sisters (local-only storage)</li>
            <li>Decisions Log: record poll outcomes and notes</li>
            <li>Support Ledger: track contributions and expenses</li>
            <li>Monthly Sessions: topics, speakers, notes</li>
            <li>Welcome Text: copy-paste intro for WhatsApp onboarding</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
