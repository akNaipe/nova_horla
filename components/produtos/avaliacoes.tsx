"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Avaliacao } from "@/types";

export function Avaliacoes({ produtoId }: { produtoId: number }) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("avaliacoes")
      .select("*")
      .eq("produto_id", produtoId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setAvaliacoes(data || []);
        setLoading(false);
      });
  }, [produtoId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const media = avaliacoes.length
    ? (avaliacoes.reduce((a, r) => a + r.nota, 0) / avaliacoes.length).toFixed(1)
    : 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-semibold text-lg">Avaliações</h3>
        {avaliacoes.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`h-4 w-4 ${n <= Math.round(Number(media)) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{media} ({avaliacoes.length})</span>
          </div>
        )}
      </div>

      {avaliacoes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Seja o primeiro a avaliar este produto!</p>
      ) : (
        <div className="space-y-4">
          {avaliacoes.map((av) => (
            <div key={av.id} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{av.nome_cliente}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`h-3 w-3 ${n <= av.nota ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{formatDate(av.created_at)}</span>
              </div>
              {av.comentario && <p className="text-sm text-muted-foreground">{av.comentario}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
