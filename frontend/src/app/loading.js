
export default function Loading() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="space-y-6">
        <div className="skeleton h-4 w-24 rounded"></div>
        <div className="skeleton h-9 w-64 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-[var(--color-line)] rounded-lg overflow-hidden">
              <div className="skeleton aspect-square"></div>
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 rounded w-3/4"></div>
                <div className="skeleton h-3 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
