import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPedidosLoading() {
  return (
    <div>
      <Skeleton className="h-10 w-32 mb-8" />

      <div className="rounded-lg border bg-card">
        <div className="p-6 pb-2">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="p-0">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
