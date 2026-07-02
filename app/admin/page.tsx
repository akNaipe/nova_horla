import { DollarSign, ShoppingBag, Users, Package, TrendingUp, TrendingDown, AlertTriangle, Tag, BarChart3, Clock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

async function getDashboardData() {
  const supabase = await createClient();
  const agora = new Date();
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const mesPassado = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
  const fimMesPassado = new Date(agora.getFullYear(), agora.getMonth(), 0);

  const [vendasHoje, vendasMes, vendasMesPassado, totalPedidos, totalClientes, pedidosPendentes, estoqueBaixo, pedidosRecentes, produtosSemEstoque] = await Promise.all([
    supabase.from("pedidos").select("total").gte("created_at", inicioHoje.toISOString()).not("status", "eq", "cancelado"),
    supabase.from("pedidos").select("total, status").gte("created_at", inicioMes.toISOString()).not("status", "eq", "cancelado"),
    supabase.from("pedidos").select("total").gte("created_at", mesPassado.toISOString()).lte("created_at", fimMesPassado.toISOString()).not("status", "eq", "cancelado"),
    supabase.from("pedidos").select("*", { count: "exact", head: true }),
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("produtos").select("id, nome, quantidade_estoque, preco_venda, imagem_url").lte("quantidade_estoque", 5).order("quantidade_estoque").limit(5),
    supabase.from("pedidos").select("id, total, status, created_at, cliente:clientes(nome)").order("created_at", { ascending: false }).limit(5),
    supabase.from("produtos").select("id, nome").eq("quantidade_estoque", 0).limit(3),
  ]);

  const totalHoje = vendasHoje.data?.reduce((a, p) => a + Number(p.total), 0) || 0;
  const totalMes = vendasMes.data?.reduce((a, p) => a + Number(p.total), 0) || 0;
  const totalMesPassadoVal = vendasMesPassado.data?.reduce((a, p) => a + Number(p.total), 0) || 0;
  const variacao = totalMesPassadoVal > 0 ? ((totalMes - totalMesPassadoVal) / totalMesPassadoVal) * 100 : 0;

  return {
    totalHoje, totalMes, variacao: Math.round(variacao * 100) / 100,
    totalPedidos: totalPedidos.count || 0, totalClientes: totalClientes.count || 0,
    pedidosPendentes: pedidosPendentes.count || 0,
    estoqueBaixo: estoqueBaixo.data || [], produtosSemEstoque: produtosSemEstoque.data || [],
    pedidosRecentes: pedidosRecentes.data || [],
  };
}

const statusCfg: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400" },
  confirmado: { label: "Confirmado", color: "bg-blue-500/20 text-blue-400" },
  preparando: { label: "Preparando", color: "bg-purple-500/20 text-purple-400" },
  enviado: { label: "Enviado", color: "bg-indigo-500/20 text-indigo-400" },
  entregue: { label: "Entregue", color: "bg-green-500/20 text-green-400" },
  cancelado: { label: "Cancelado", color: "bg-red-500/20 text-red-400" },
};

export default async function AdminDashboardPage() {
  const d = await getDashboardData();

  const cards = [
    { title: "Vendas Hoje", value: formatCurrency(d.totalHoje), icon: DollarSign, color: "text-green-400" },
    { title: "Vendas do Mês", value: formatCurrency(d.totalMes), icon: ShoppingBag, color: "text-blue-400",
      extra: d.variacao !== 0 ? { icon: d.variacao > 0 ? TrendingUp : TrendingDown, text: `${Math.abs(d.variacao)}% vs mês anterior`, color: d.variacao > 0 ? "text-green-400" : "text-red-400" } : null },
    { title: "Pedidos", value: d.totalPedidos, icon: Package, color: "text-purple-400", extra: d.pedidosPendentes ? { text: `${d.pedidosPendentes} pendentes`, color: "text-yellow-400" } : null },
    { title: "Clientes", value: d.totalClientes, icon: Users, color: "text-cyan-400" },
    { title: "Estoque Crítico", value: d.estoqueBaixo.length, icon: AlertTriangle, color: "text-orange-400", extra: d.produtosSemEstoque.length ? { text: `${d.produtosSemEstoque.length} sem estoque`, color: "text-red-400" } : null },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up animate-stagger-1">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral da sua loja</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/produtos/novo"><Button size="sm" className="btn-hover">+ Novo Produto</Button></Link>
          <Link href="/admin/pedidos"><Button variant="outline" size="sm" className="btn-hover">Gerenciar Pedidos</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className="animate-slide-up card-hover" style={{animationDelay: `${0.2 + i * 0.08}s`}}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{c.title}</CardTitle>
                <Icon className={`h-4 w-4 transition-colors ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{c.value}</div>
                {c.extra && (
                  <div className={`flex items-center gap-1 text-[10px] mt-0.5 ${c.extra.color}`}>
                    {"icon" in c.extra && c.extra.icon ? (() => { const Ei = c.extra.icon; return <Ei className="h-3 w-3" />; })() : null}
                    {c.extra.text}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up card-hover animate-stagger-2" style={{animationDelay: '0.6s'}}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Pedidos Recentes</CardTitle>
              <Link href="/admin/pedidos" className="text-xs text-primary link-underline">Ver todos</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!d.pedidosRecentes.length ? (
              <p className="text-sm text-muted-foreground p-4">Nenhum pedido ainda.</p>
            ) : (
              <div className="divide-y">
                {d.pedidosRecentes.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors animate-slide-up" style={{animationDelay: `${0.7 + i * 0.05}s`}}>
                    <div>
                      <Link href={`/pedidos/${p.id}`} className="text-sm font-medium link-underline">#{p.id.slice(0, 8)}</Link>
                      <p className="text-[11px] text-muted-foreground">{(p.cliente as unknown as Array<{ nome: string }>)?.[0]?.nome || "—"}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <Badge className={`${statusCfg[p.status]?.color || "bg-gray-500/20"} border-0 text-[10px]`}>{statusCfg[p.status]?.label || p.status}</Badge>
                      <span className="text-sm font-medium">{formatCurrency(p.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-400" /> Estoque Baixo</CardTitle>
              <Link href="/admin/produtos" className="text-xs text-primary hover:underline">Gerenciar</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!d.estoqueBaixo.length ? (
              <p className="text-sm text-muted-foreground p-4">Estoque OK.</p>
            ) : (
              <div className="divide-y">
                {d.estoqueBaixo.map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {prod.imagem_url ? (
                        <img src={prod.imagem_url} alt="" className="w-8 h-8 rounded object-cover bg-muted shrink-0" />
                      ) : <div className="w-8 h-8 rounded bg-muted shrink-0" />}
                      <div className="min-w-0">
                        <Link href={`/admin/produtos/${prod.id}`} className="text-sm font-medium hover:text-primary truncate block">{prod.nome}</Link>
                        <p className="text-[11px] text-muted-foreground">{formatCurrency(prod.preco_venda)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${prod.quantidade_estoque === 0 ? "text-red-400" : "text-orange-400"}`}>{prod.quantidade_estoque}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Atalhos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Atalhos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: "/admin/produtos/novo", icon: Package, label: "Novo Produto", color: "text-blue-400" },
              { href: "/admin/pedidos", icon: Eye, label: "Ver Pedidos", color: "text-purple-400" },
              { href: "/admin/categorias", icon: Tag, label: "Categorias", color: "text-green-400" },
              { href: "/admin/relatorios", icon: BarChart3, label: "Relatórios", color: "text-cyan-400" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="p-3 rounded-lg border hover:bg-accent transition-colors text-center">
                  <Icon className={`h-5 w-5 mx-auto mb-1 ${item.color}`} />
                  <p className="text-xs font-medium">{item.label}</p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
