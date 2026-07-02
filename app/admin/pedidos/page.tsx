import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AtualizarStatusPedido } from "@/components/admin/atualizar-status-pedido";
import type { StatusPedido } from "@/types";

const statusCfg: Record<StatusPedido, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400" },
  confirmado: { label: "Confirmado", color: "bg-blue-500/20 text-blue-400" },
  preparando: { label: "Preparando", color: "bg-purple-500/20 text-purple-400" },
  enviado: { label: "Enviado", color: "bg-indigo-500/20 text-indigo-400" },
  entregue: { label: "Entregue", color: "bg-green-500/20 text-green-400" },
  cancelado: { label: "Cancelado", color: "bg-red-500/20 text-red-400" },
};

async function getPedidos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pedidos")
    .select("id, cliente_id, status, total, created_at, cliente:clientes(nome)")
    .order("created_at", { ascending: false });
  return (data || []) as unknown as Array<{
    id: string; cliente_id: string; status: StatusPedido; total: number;
    created_at: string; cliente: { nome: string } | null;
  }>;
}

export default async function AdminPedidosPage() {
  const pedidos = await getPedidos();

  const porStatus: Record<string, typeof pedidos> = {};
  for (const p of pedidos) {
    if (!porStatus[p.status]) porStatus[p.status] = [];
    porStatus[p.status].push(p);
  }

  const resumo = [
    { label: "Total", count: pedidos.length, total: pedidos.reduce((a, p) => a + Number(p.total), 0), color: "" },
    { label: "Pendentes", count: porStatus.pendente?.length || 0, total: porStatus.pendente?.reduce((a, p) => a + Number(p.total), 0) || 0, color: "text-yellow-400" },
    { label: "Cancelados", count: porStatus.cancelado?.length || 0, total: porStatus.cancelado?.reduce((a, p) => a + Number(p.total), 0) || 0, color: "text-red-400" },
    { label: "Entregues", count: porStatus.entregue?.length || 0, total: porStatus.entregue?.reduce((a, p) => a + Number(p.total), 0) || 0, color: "text-green-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">Gerencie todos os pedidos da loja</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {resumo.map((r) => (
          <Card key={r.label}>
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{r.label}</p>
              <p className={`text-lg font-bold mt-1 ${r.color}`}>{r.count}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(r.total)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Lista de Pedidos</CardTitle>
            <div className="flex gap-1 flex-wrap">
              {Object.entries(statusCfg).map(([key, cfg]) => (
                <Badge key={key} className={`${cfg.color} border-0 text-[10px]`}>{cfg.label}</Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!pedidos.length ? (
            <p className="text-muted-foreground p-6 text-sm">Nenhum pedido.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-[11px] text-muted-foreground uppercase tracking-wider">
                    <th className="p-3 font-medium">Pedido</th>
                    <th className="p-3 font-medium">Cliente</th>
                    <th className="p-3 font-medium">Data</th>
                    <th className="p-3 font-medium">Total</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="border-b hover:bg-accent/30 transition-colors">
                      <td className="p-3">
                        <Link href={`/pedidos/${pedido.id}`} className="text-sm font-medium hover:text-primary">
                          #{pedido.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="p-3 text-sm">{pedido.cliente?.nome || "—"}</td>
                      <td className="p-3 text-sm text-muted-foreground">{formatDate(pedido.created_at)}</td>
                      <td className="p-3 text-sm font-medium">{formatCurrency(pedido.total)}</td>
                      <td className="p-3">
                        <Badge className={`${statusCfg[pedido.status]?.color || ""} border-0 text-[10px]`}>
                          {statusCfg[pedido.status]?.label || pedido.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <AtualizarStatusPedido pedidoId={pedido.id} statusAtual={pedido.status} />
                          <Link href={`/pedidos/${pedido.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">Detalhes</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
