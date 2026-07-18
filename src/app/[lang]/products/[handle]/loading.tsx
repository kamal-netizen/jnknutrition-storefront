export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-[#E2E8F0] rounded-lg animate-pulse" />
        <div className="space-y-5">
          <div className="h-9 w-3/4 bg-[#E2E8F0] rounded animate-pulse" />
          <div className="h-6 w-1/4 bg-[#E2E8F0] rounded animate-pulse" />
          <div className="h-12 w-full bg-[#E2E8F0] rounded animate-pulse" />
          <div className="h-12 w-full bg-[#E2E8F0] rounded animate-pulse" />
          <div className="space-y-2 pt-4">
            <div className="h-4 w-full bg-[#E2E8F0] rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-[#E2E8F0] rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-[#E2E8F0] rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
