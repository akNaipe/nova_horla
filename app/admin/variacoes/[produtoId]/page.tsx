import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormVariacoes } from "@/components/admin/form-variacoes";

export default async function VariacoesPage({
  params,
}: {
  params: Promise<{ produtoId: string }>;
}) {
  const { produtoId } = await params;
  const supabase = await createClient();

  const { data: produto } = await supabase
    .from("produtos")
    .select("id, nome")
    .eq("id", Number(produtoId))
    .single();

  const { data: variacoes } = await supabase
    .from("variacoes")
    .select("*")
    .eq("produto_id", Number(produtoId))
    .order("tipo");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Variações</h1>
        <p className="text-sm text-muted-foreground">{produto?.nome || "Produto"}</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">Gerenciar Variações</CardTitle></CardHeader>
        <CardContent>
          <FormVariacoes produtoId={Number(produtoId)} variacoes={variacoes || []} />
        </CardContent>
      </Card>
    </div>
  );
}
