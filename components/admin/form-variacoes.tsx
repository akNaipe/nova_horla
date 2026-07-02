"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import type { Variacao } from "@/types";

export function FormVariacoes({ produtoId, variacoes: initial }: { produtoId: number; variacoes: Variacao[] }) {
  const [items, setItems] = useState(initial.length ? initial : []);
  const [novoTipo, setNovoTipo] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [novoPreco, setNovoPreco] = useState("");
  const [novoEstoque, setNovoEstoque] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const addVariacao = async () => {
    if (!novoTipo || !novoValor) return;
    setLoading(true);
    const { error } = await supabase.from("variacoes").insert({
      produto_id: produtoId, tipo: novoTipo, valor: novoValor,
      preco_adicional: parseFloat(novoPreco || "0"), estoque: parseInt(novoEstoque || "0"),
    });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Variação adicionada!" }); setNovoTipo(""); setNovoValor(""); setNovoPreco(""); setNovoEstoque(""); }
    router.refresh();
    setLoading(false);
  };

  const removeVariacao = async (id: string) => {
    const { error } = await supabase.from("variacoes").delete().eq("id", id);
    if (error) toast({ title: "Erro", variant: "destructive" });
    else toast({ title: "Variação removida" });
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        <Input value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)} placeholder="Tipo (ex: Cor)" className="h-9 text-sm" />
        <Input value={novoValor} onChange={(e) => setNovoValor(e.target.value)} placeholder="Valor (ex: Preto)" className="h-9 text-sm" />
        <Input type="number" value={novoPreco} onChange={(e) => setNovoPreco(e.target.value)} placeholder="R$ extra" className="h-9 text-sm" />
        <Input type="number" value={novoEstoque} onChange={(e) => setNovoEstoque(e.target.value)} placeholder="Estoque" className="h-9 text-sm" />
        <Button size="sm" onClick={addVariacao} disabled={loading}><Plus className="h-4 w-4" /></Button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma variação.</p>}
        {items.map((v) => (
          <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
            <div className="flex gap-4">
              <span className="font-medium capitalize">{v.tipo}:</span>
              <span>{v.valor}</span>
              {v.preco_adicional > 0 && <span className="text-green-400">+R${v.preco_adicional}</span>}
              <span className={`${v.estoque <= 0 ? "text-red-400" : "text-muted-foreground"}`}>{v.estoque} unid.</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeVariacao(v.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
