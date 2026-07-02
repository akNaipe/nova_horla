"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { criarCupom } from "@/lib/supabase/actions";

export function FormCupom() {
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState("percentual");
  const [valor, setValor] = useState("");
  const [valor_minimo, setValorMinimo] = useState("");
  const [usos_maximos, setUsosMaximos] = useState("");
  const [expira_em, setExpiraEm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !valor) return;
    setLoading(true);
    const { error } = await criarCupom({
      codigo,
      tipo,
      valor: parseFloat(valor),
      valor_minimo: valor_minimo ? parseFloat(valor_minimo) : undefined,
      usos_maximos: usos_maximos ? parseInt(usos_maximos) : undefined,
      expira_em: expira_em || undefined,
    });
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      toast({ title: "Cupom criado!" });
      setCodigo(""); setValor(""); setValorMinimo(""); setUsosMaximos(""); setExpiraEm("");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Código</Label>
        <Input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="PROMO10" className="h-9 font-mono uppercase" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Tipo</Label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="percentual">Percentual (%)</option>
            <option value="fixo">Valor Fixo (R$)</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Valor</Label>
          <Input type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)}
            placeholder={tipo === "percentual" ? "10" : "19.90"} className="h-9" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Valor Mínimo (R$)</Label>
          <Input type="number" step="0.01" min="0" value={valor_minimo} onChange={(e) => setValorMinimo(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Usos Máximos</Label>
          <Input type="number" min="0" value={usos_maximos} onChange={(e) => setUsosMaximos(e.target.value)} className="h-9" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Expira em</Label>
        <Input type="date" value={expira_em} onChange={(e) => setExpiraEm(e.target.value)} className="h-9" />
      </div>
      <Button type="submit" size="sm" disabled={loading} className="w-full">
        {loading ? "Criando..." : "Criar Cupom"}
      </Button>
    </form>
  );
}
