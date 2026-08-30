// Loading state for /shop and /collections/tops (spec section 13: "loading
// and error states on every async surface"). `animate-pulse` is a Tailwind
// built-in CSS animation, not an external animation library.
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-4/5 w-full animate-pulse bg-line" />
          <div className="h-4 w-3/4 animate-pulse bg-line" />
          <div className="h-4 w-1/3 animate-pulse bg-line" />
        </div>
      ))}
    </div>
  );
}
