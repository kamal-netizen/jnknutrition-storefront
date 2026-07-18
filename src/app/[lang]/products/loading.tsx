export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-8 w-48 bg-[#E2E8F0] rounded animate-pulse mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-[#E2E8F0] rounded-lg animate-pulse" />
            <div className="h-4 w-3/4 bg-[#E2E8F0] rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-[#E2E8F0] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
