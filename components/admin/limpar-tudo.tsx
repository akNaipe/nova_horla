"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, RefreshCw } from "lucide-react";

interface LimparTudoProps {
  tipo: "carrinhos" | "cancelados" | "cache" | "inativos" | "reset";
}

const confirmacoes: Record<string, string> = {
  carrinhos: "Tem certeza? Isso vai remover pedidos pendentes antigos.",
  cancelados: "Tem certeza? Isso vai deletar pedidos cancelados permanentemente.",
  cache: "Tem certeza? Vai limpar o cache do sistema.",
  inativos: "⚠️ Isso vai deletar TODOS os produtos inativos permanentemente!",
  reset: "⚠️⚠️ Isso vai remover TODOS os pedidos, itens e clientes!",
};

const labels: Record<string, string> = {
  carrinhos: "Limpar Carrinhos Abandonados",
  cancelados: "Limpar Cancelados",
  cache: "Limpar Cache",
  inativos: "Remover Inativos",
  reset: "Resetar Dados",
};

export function LimparTudo({ tipo }: LimparTudoProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLimpar = async () => {
    if (!confirm(confirmacoes[tipo])) return;
    setLoading(true);

    try {
      if (tipo === "cache") {
        router.refresh();
        toast({ title: "Cache limpo!" });
        setLoading(false);
        return;
      }

      const res = await fetch("/api/limpeza", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: tipo }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro");
      }

      toast({
        title: tipo === "reset" ? "Dados resetados!" : "Operação concluída!",
        description: data.removidos ? `${data.removidos} registro(s) removido(s).` : undefined,
      });

      router.refresh();
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={tipo === "reset" || tipo === "inativos" ? "destructive" : "outline"}
      size="sm"
      onClick={handleLimpar}
      disabled={loading}
      className="gap-2"
    >
      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {loading ? "Limpando..." : labels[tipo]}
    </Button>
  );
}
