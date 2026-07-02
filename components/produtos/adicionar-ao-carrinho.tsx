"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import type { Produto } from "@/types";

interface AdicionarAoCarrinhoProps {
  produto: Produto;
}

export function AdicionarAoCarrinho({ produto }: AdicionarAoCarrinhoProps) {
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAdicionar = () => {
    setLoading(true);

    const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
    const index = carrinho.findIndex(
      (item: { produto_id: number }) => item.produto_id === produto.id
    );

    if (index >= 0) {
      carrinho[index].quantidade += quantidade;
    } else {
      carrinho.push({
        produto_id: produto.id,
        nome: produto.nome,
        slug: produto.slug,
        preco: produto.preco_promocional || produto.preco_venda,
        imagem: produto.imagem_url || "",
        quantidade,
      });
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    setLoading(false);

    toast({
      title: "Adicionado ao carrinho!",
      description: `${quantidade}x ${produto.nome}`,
    });

    router.refresh();
  };

  if (produto.quantidade_estoque <= 0) {
    return <Button disabled>Indisponível</Button>;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
          disabled={quantidade <= 1}
        >
          -
        </Button>
        <Input
          type="number"
          value={quantidade}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (val >= 1 && val <= produto.quantidade_estoque) setQuantidade(val);
          }}
          className="w-16 text-center"
          min={1}
          max={produto.quantidade_estoque}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantidade(Math.min(produto.quantidade_estoque, quantidade + 1))}
          disabled={quantidade >= produto.quantidade_estoque}
        >
          +
        </Button>
      </div>
      <Button size="lg" onClick={handleAdicionar} disabled={loading}>
        {loading ? "Adicionando..." : "Adicionar ao Carrinho"}
      </Button>
    </div>
  );
}
