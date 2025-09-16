export default function Section({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="h2 min-w-0 truncate">{title}</h2>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {description && <p className="lead">{description}</p>}
      <div className="card overflow-x-hidden">{children}</div>
    </section>
  );
}
