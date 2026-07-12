export default function Loading() {
  return (
    <div className="min-h-screen bg-[#000000] py-8 md:py-12 px-6 space-y-6">
      {/* Boot sequence skeleton */}
      <div className="border-b border-[#333333] pb-4">
        <div className="h-4 w-48 border border-[#333333] bg-[#1a1a1a] animate-pulse" />
      </div>

      {/* Search skeleton */}
      <div className="border-b border-[#F9F9F9] pb-8">
        <div className="h-10 w-full border border-[#333333] bg-[#1a1a1a] animate-pulse" />
      </div>

      {/* Tools directory header */}
      <div className="flex items-center justify-between border-b border-[#333333] pb-4">
        <div className="h-5 w-32 border border-[#333333] bg-[#1a1a1a] animate-pulse" />
        <div className="h-5 w-24 border border-[#333333] bg-[#1a1a1a] animate-pulse" />
      </div>

      {/* Tool rows */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-[#1a1a1a]">
          <div className="h-4 w-6 border border-[#333333] bg-[#1a1a1a] animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-48 border border-[#333333] bg-[#1a1a1a] animate-pulse" />
          </div>
          <div className="h-4 w-16 border border-[#333333] bg-[#1a1a1a] animate-pulse" />
        </div>
      ))}

      {/* Terminal footer */}
      <div className="border-t border-[#333333] pt-4">
        <div className="h-3 w-40 border border-[#1a1a1a] bg-[#1a1a1a] animate-pulse" />
      </div>
    </div>
  )
}
