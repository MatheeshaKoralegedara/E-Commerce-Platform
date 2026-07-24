
export default function Loading() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}