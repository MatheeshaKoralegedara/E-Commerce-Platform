
export default function Loading() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="skeleton aspect-square rounded-lg"></div>
        <div className="space-y-4">
          <div className="skeleton h-9 w-3/4 rounded"></div>
          <div className="skeleton h-4 w-1/3 rounded"></div>
          <div className="skeleton h-4 w-full rounded"></div>
          <div className="skeleton h-4 w-2/3 rounded"></div>
          <div className="skeleton h-20 w-full rounded-lg mt-6"></div>
        </div>
      </div>
    </main>
  );
}
