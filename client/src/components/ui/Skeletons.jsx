// Reusable skeleton loaders for lazy/deferred content

export function EventCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/5">
      <div className="h-48 shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-16 shimmer rounded-full" />
        <div className="h-4 w-3/4 shimmer rounded" />
        <div className="h-3 w-full shimmer rounded" />
        <div className="h-3 w-2/3 shimmer rounded" />
        <div className="flex gap-3 pt-2">
          <div className="h-3 w-24 shimmer rounded" />
          <div className="h-3 w-20 shimmer rounded" />
        </div>
      </div>
    </div>
  );
}

export function MemberCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col items-center">
      <div className="w-20 h-20 rounded-full shimmer mb-4" />
      <div className="h-3.5 w-24 shimmer rounded mb-2" />
      <div className="h-3 w-16 shimmer rounded mb-1" />
      <div className="h-2.5 w-12 shimmer rounded" />
    </div>
  );
}

export function GalleryGridSkeleton({ count = 12 }) {
  return (
    <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`break-inside-avoid shimmer rounded-xl ${
          i % 3 === 0 ? 'h-48' : i % 3 === 1 ? 'h-32' : 'h-56'
        }`} />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="w-10 h-10 rounded-xl shimmer mb-4" />
      <div className="h-8 w-16 shimmer rounded mb-2" />
      <div className="h-3 w-24 shimmer rounded" />
    </div>
  );
}

export function TextBlockSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 shimmer rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function FeatureCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 border border-white/5">
      <div className="w-12 h-12 rounded-xl shimmer mb-5" />
      <div className="h-4 w-32 shimmer rounded mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-full shimmer rounded" />
        <div className="h-3 w-4/5 shimmer rounded" />
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 border border-white/5 text-center">
      <div className="w-20 h-20 rounded-full shimmer mx-auto mb-4" />
      <div className="h-4 w-28 shimmer rounded mx-auto mb-2" />
      <div className="h-3 w-24 shimmer rounded mx-auto mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-full shimmer rounded" />
        <div className="h-3 w-3/4 shimmer rounded mx-auto" />
      </div>
    </div>
  );
}
