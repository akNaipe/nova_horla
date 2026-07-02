"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { atualizarStatusPedido } from "@/lib/supabase/actions";
import { useToast } from "@/components/ui/use-toast";
import type { StatusPedido } from "@/types";

interface AtualizarStatusPedidoProps {
  pedidoId: string;
  statusAtual: StatusPedido;
}

const proximoStatus: Record<StatusPedido, StatusPedido | null> = {
  pendente: "confirmado",
  confirmado: "preparando",
  preparando: "enviado",
  enviado: "entregue",
  entregue: null,
  cancelado: null,
};

const statusLabels: Record<StatusPedido, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  preparando: "Preparando",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function AtualizarStatusPedido({ pedidoId, statusAtual }: AtualizarStatusPedidoProps) {
  const router = useRouter();
  const { toast } = useToast();
  const proximo = proximoStatus[statusAtual];

  if (!proximo) return null;

  const handleAtualizar = async () => {
    const { error } = await atualizarStatusPedido(pedidoId, proximo);
    if (error) {
      toast({ title: "Erro ao atualizar status", description: error, variant: "destructive" });
    } else {
      toast({ title: `Status atualizado para "${statusLabels[proximo]}"` });
    }
    router.refresh();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleAtualizar}>
      Avançar para {statusLabels[proximo]}
    </Button>
  );
}
