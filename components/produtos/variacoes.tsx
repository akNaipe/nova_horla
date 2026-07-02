"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Variacao } from "@/types";

interface VariacoesProps {
  produtoId: number;
  precoBase: number;
  onVariacaoChange: (precoExtra: number, variacao: string) => void;
}

export function Variacoes({ produtoId, precoBase, onVariacaoChange }: VariacoesProps) {
  const [variacoes, setVariacoes] = useState<Variacao[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.from("variacoes").select("*").eq("produto_id", produtoId).then(({ data }) => {
      setVariacoes(data || []);
    });
  }, [produtoId]);

  if (!variacoes.length) return null;

  const tipos = [...new Set(variacoes.map((v) => v.tipo))];

  const handleSelect = (tipo: string, valor: string) => {
    const novo = { ...selected, [tipo]: valor };
    setSelected(novo);

    const variacaoSelecionada = variacoes.find(
      (v) =>
        Object.entries(novo).every(([k, val]) =>
          k === tipo ? val === valor : v.tipo === k && v.valor === val
        ) && v.tipo === tipo && v.valor === valor
    );
    onVariacaoChange(variacaoSelecionada?.preco_adicional || 0,
      Object.values(novo).join(" / "));
  };

  return (
    <div className="space-y-4 mb-6">
      {tipos.map((tipo) => (
        <div key={tipo}>
          <p className="text-sm font-medium mb-2 capitalize">{tipo}</p>
          <div className="flex flex-wrap gap-2">
            {variacoes
              .filter((v) => v.tipo === tipo)
              .map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelect(tipo, v.valor)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                    selected[tipo] === v.valor
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "hover:border-primary/50"
                  } ${v.estoque <= 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                  disabled={v.estoque <= 0}
                >
                  {v.valor}
                  {v.preco_adicional > 0 && ` +R$${v.preco_adicional}`}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
