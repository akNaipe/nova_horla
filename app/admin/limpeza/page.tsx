import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { LimparTudo } from "@/components/admin/limpar-tudo";

async function getStats() {
  const supabase = await createClient();

  const [produtos, categorias, pedidos, clientes] = await Promise.all([
    supabase.from("produtos").select("*", { count: "exact", head: true }),
    supabase.from("categorias").select("*", { count: "exact", head: true }),
    supabase.from("pedidos").select("*", { count: "exact", head: true }),
    supabase.from("clientes").select("*", { count: "exact", head: true }),
  ]);

  return {
    produtos: produtos.count || 0,
    categorias: categorias.count || 0,
    pedidos: pedidos.count || 0,
    clientes: clientes.count || 0,
  };
}

export default async function LimpezaPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Limpeza e Manutenção</h1>
        <p className="text-sm text-muted-foreground">Gerencie e limpe dados do sistema</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.produtos}</p>
            <p className="text-xs text-muted-foreground">Produtos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.categorias}</p>
            <p className="text-xs text-muted-foreground">Categorias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.pedidos}</p>
            <p className="text-xs text-muted-foreground">Pedidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.clientes}</p>
            <p className="text-xs text-muted-foreground">Clientes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Limpar Carrinhos Abandonados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Remove pedidos com status &quot;pendente&quot; criados há mais de 7 dias.
            </p>
            <LimparTudo tipo="carrinhos" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Limpar Pedidos Cancelados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Remove permanentemente pedidos cancelados antigos (mais de 30 dias).
            </p>
            <LimparTudo tipo="cancelados" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Limpar Cache do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Limpa o cache do Next.js e revalida todas as páginas.
            </p>
            <LimparTudo tipo="cache" />
          </CardContent>
        </Card>

        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-red-400">Resetar Produtos Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Remove permanentemente todos os produtos marcados como inativos.
            </p>
            <LimparTudo tipo="inativos" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-orange-400">⚠️ Limpar Tudo (Reset Parcial)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Remove todos os dados de pedidos, itens de pedido e clientes.
            <br /><strong>Produtos e categorias não são removidos.</strong>
          </p>
          <LimparTudo tipo="reset" />
        </CardContent>
      </Card>
    </div>
  );
}
