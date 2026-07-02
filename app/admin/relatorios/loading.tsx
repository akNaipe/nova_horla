import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRelatoriosLoading() {
  return (
    <div>
      <Skeleton className="h-10 w-40 mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-24 mt-2" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6 mb-8">
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-[350px] w-full" />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-5 w-56 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-48 flex-1" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
