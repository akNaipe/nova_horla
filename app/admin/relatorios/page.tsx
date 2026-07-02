import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

const GraficoVendas = dynamic(
  () => import("@/components/admin/grafico-vendas").then((mod) => mod.GraficoVendas),
  { ssr: false }
);

const TabelaProdutosMaisVendidos = dynamic(
  () => import("@/components/admin/tabela-produtos-mais-vendidos").then((mod) => mod.TabelaProdutosMaisVendidos),
  { ssr: false }
);

async function getRelatorios() {
  const supabase = await createClient();

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

  // Vendas do mês por dia
  const { data: vendasMes } = await supabase
    .from("pedidos")
    .select("created_at, total, status")
    .gte("created_at", inicioMes.toISOString())
    .not("status", "eq", "cancelado")
    .order("created_at");

  // Agrupar por dia
  const vendasPorDia: Record<string, { total: number; quantidade: number }> = {};
  let totalMes = 0;
  let qtdMes = 0;

  for (const v of vendasMes || []) {
    const dia = new Date(v.created_at).toLocaleDateString("pt-BR");
    if (!vendasPorDia[dia]) vendasPorDia[dia] = { total: 0, quantidade: 0 };
    vendasPorDia[dia].total += Number(v.total);
    vendasPorDia[dia].quantidade += 1;
    totalMes += Number(v.total);
    qtdMes += 1;
  }

  // Produtos mais vendidos
  const { data: itens } = await supabase
    .from("itens_pedido")
    .select("produto_id, quantidade, subtotal, produto:produtos(nome), pedido:pedidos!inner(created_at, status)")
    .gte("pedido.created_at", inicioMes.toISOString())
    .not("pedido.status", "eq", "cancelado");

  const agg: Record<string, { nome: string; quantidade: number; total: number }> = {};
  for (const item of itens || []) {
    const nome = item.produto?.[0]?.nome || "Produto removido";
    if (!agg[item.produto_id]) agg[item.produto_id] = { nome, quantidade: 0, total: 0 };
    agg[item.produto_id].quantidade += item.quantidade;
    agg[item.produto_id].total += Number(item.subtotal);
  }

  const produtosMaisVendidos = Object.values(agg)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  return {
    vendasPorDia: Object.entries(vendasPorDia).map(([data, vals]) => ({
      data,
      ...vals,
    })),
    totalMes,
    qtdMes,
    produtosMaisVendidos,
  };
}

export default async function AdminRelatoriosPage() {
  const data = await getRelatorios();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Relatórios</h1>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.totalMes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pedidos no Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.qtdMes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.qtdMes > 0 ? formatCurrency(data.totalMes / data.qtdMes) : "R$ 0,00"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vendas por Dia (Este Mês)</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficoVendas data={data.vendasPorDia} />
        </CardContent>
      </Card>

      {/* Produtos mais vendidos */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Vendidos (Este Mês)</CardTitle>
        </CardHeader>
        <CardContent>
          <TabelaProdutosMaisVendidos data={data.produtosMaisVendidos} />
        </CardContent>
      </Card>
    </div>
  );
}
