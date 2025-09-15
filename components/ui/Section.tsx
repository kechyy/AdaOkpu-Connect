export default function Section({ title, description, actions, children }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex justify-between">
        <h2 className="h2">{title}</h2>
        <a>{actions}</a>
      </div>
      {description && <p className="lead">{description}</p>}
      <div className="card">{children}</div>
    </section>
  );
}
