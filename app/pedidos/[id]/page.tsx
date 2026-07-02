import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { Pedido, StatusPedido } from "@/types";

const statusLabels: Record<StatusPedido, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  preparando: "Preparando",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const statusColors: Record<StatusPedido, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-blue-100 text-blue-800",
  preparando: "bg-purple-100 text-purple-800",
  enviado: "bg-indigo-100 text-indigo-800",
  entregue: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

const statusPassos = ["pendente", "confirmado", "preparando", "enviado", "entregue"];

async function getPedido(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pedidos")
    .select("id, cliente_id, status, total, endereco_entrega, created_at, itens:itens_pedido(id, produto_id, quantidade, preco_unitario, subtotal, produto:produtos(id, nome))")
    .eq("id", id)
    .single();

  return data as Pedido | null;
}

export default async function PedidoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedido = await getPedido(id);

  if (!pedido) notFound();

  const indexStatus = statusPassos.indexOf(pedido.status);
  const cancelado = pedido.status === "cancelado";

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pedido #{pedido.id.slice(0, 8)}</h1>
        <p className="text-muted-foreground">
          Realizado em {formatDate(pedido.created_at)}
        </p>
      </div>

      {/* Status Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Status do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className={`${statusColors[pedido.status]} border-0`}>
            {statusLabels[pedido.status]}
          </Badge>

          {!cancelado && (
            <div className="flex items-center gap-1 mt-4">
              {statusPassos.map((passo, i) => (
                <div key={passo} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= indexStatus
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < statusPassos.length - 1 && (
                    <div
                      className={`flex-1 h-1 ${
                        i < indexStatus ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Itens */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Itens do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pedido.itens?.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.produto?.nome || "Produto removido"}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantidade}x {formatCurrency(item.preco_unitario)}
                  </p>
                </div>
                <p className="font-medium">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(pedido.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      {pedido.endereco_entrega && (
        <Card>
          <CardHeader>
            <CardTitle>Endereço de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{pedido.endereco_entrega.rua}, {pedido.endereco_entrega.numero}</p>
            {pedido.endereco_entrega.complemento && <p>{pedido.endereco_entrega.complemento}</p>}
            <p>{pedido.endereco_entrega.bairro}</p>
            <p>{pedido.endereco_entrega.cidade} - {pedido.endereco_entrega.estado}</p>
            <p>CEP: {pedido.endereco_entrega.cep}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
