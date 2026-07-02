import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PedidoDetalheLoading() {
  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle><Skeleton className="h-5 w-36" /></CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-24 rounded-full" />
          <div className="flex items-center gap-1 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center flex-1">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                {i < 4 && <Skeleton className="flex-1 h-1" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Itens */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle><Skeleton className="h-5 w-32" /></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          <div className="h-px bg-border my-4" />
          <div className="flex justify-between">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-20" />
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-5 w-48" /></CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
        </CardContent>
      </Card>
    </div>
  );
}
