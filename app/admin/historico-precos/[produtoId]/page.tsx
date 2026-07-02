import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function HistoricoPrecosPage({
  params,
}: {
  params: Promise<{ produtoId: string }>;
}) {
  const { produtoId } = await params;
  const supabase = await createClient();

  const { data: produto } = await supabase
    .from("produtos")
    .select("nome, preco_venda")
    .eq("id", Number(produtoId))
    .single();

  const { data: historico } = await supabase
    .from("historico_precos")
    .select("preco_antigo, preco_novo, created_at")
    .eq("produto_id", Number(produtoId))
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico de Preços</h1>
        <p className="text-sm text-muted-foreground">{produto?.nome || "Produto"} — Preço atual: {formatCurrency(produto?.preco_venda || 0)}</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {!historico?.length ? (
            <p className="text-sm text-muted-foreground p-6">Nenhuma alteração de preço registrada.</p>
          ) : (
            <div className="divide-y">
              {historico.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-4 text-sm">
                  <div>
                    <span className="text-muted-foreground line-through">{formatCurrency(h.preco_antigo)}</span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span className="font-medium text-green-400">{formatCurrency(h.preco_novo)}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(h.created_at).toLocaleString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
