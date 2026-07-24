
export default function Loading() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="aspect-square max-w-md bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </main>
  );
}