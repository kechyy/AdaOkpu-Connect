export default function EmptyState({ children }: { children: React.ReactNode }) {
    return (
      <div className="rounded-xl border p-10 text-center text-gray-500">
        {children}
      </div>
    );
  }
  