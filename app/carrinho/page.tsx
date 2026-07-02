"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, Tag, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import type { CarrinhoItem } from "@/types";

export default function CarrinhoPage() {
  const [itens, setItens] = useState<CarrinhoItem[]>([]);
  const [cupomCodigo, setCupomCodigo] = useState("");
  const [cupomInfo, setCupomInfo] = useState<{ codigo: string; tipo: string; valor: number } | null>(null);
  const [cupomLoading, setCupomLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
    const carrinhoAtualizado = carrinho.map((item: CarrinhoItem) => ({
      ...item,
      slug: item.slug || String(item.produto_id),
    }));
    setItens(carrinhoAtualizado);
  }, []);

  const aplicarCupom = async () => {
    if (!cupomCodigo.trim()) return;
    setCupomLoading(true);
    try {
      const res = await fetch(`/api/cupons/${cupomCodigo.toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cupom inválido");
      setCupomInfo(data);
      toast({ title: "Cupom aplicado!", description: `${data.tipo === "percentual" ? data.valor + "%" : formatCurrency(data.valor)} de desconto` });
    } catch (err) {
      toast({ title: "Cupom inválido", description: err instanceof Error ? err.message : "Código não encontrado", variant: "destructive" });
      setCupomInfo(null);
    }
    setCupomLoading(false);
  };

  const removerCupom = () => {
    setCupomInfo(null);
    setCupomCodigo("");
  };

  const atualizarQuantidade = (produtoId: number, novaQtd: number) => {
    if (novaQtd <= 0) {
      removerItem(produtoId);
      return;
    }
    const novo = itens.map((item) =>
      item.produto_id === produtoId ? { ...item, quantidade: novaQtd } : item
    );
    setItens(novo);
    localStorage.setItem("carrinho", JSON.stringify(novo));
  };

  const removerItem = (produtoId: number) => {
    const novo = itens.filter((item) => item.produto_id !== produtoId);
    setItens(novo);
    localStorage.setItem("carrinho", JSON.stringify(novo));
  };

  const subtotal = useMemo(() => itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0), [itens]);
  const totalItens = useMemo(() => itens.reduce((acc, item) => acc + item.quantidade, 0), [itens]);

  const desconto = useMemo(() => {
    if (!cupomInfo) return 0;
    if (cupomInfo.tipo === "percentual") return subtotal * (cupomInfo.valor / 100);
    return Math.min(cupomInfo.valor, subtotal);
  }, [cupomInfo, subtotal]);

  const total = subtotal - desconto;

  if (itens.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Carrinho Vazio</h1>
        <p className="text-muted-foreground mb-6">Nenhum produto no carrinho ainda.</p>
        <Link href="/loja">
          <Button>Ir para Loja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Itens */}
        <div className="lg:col-span-2 space-y-4">
          {itens.map((item) => (
            <Card key={item.produto_id}>
              <CardContent className="p-4 flex gap-4">
                <div className="w-24 h-24 rounded-md bg-muted relative shrink-0 overflow-hidden">
                  {item.imagem ? (
                    <Image src={item.imagem} alt={item.nome} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      Sem img
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {item.slug && !item.slug.startsWith("http") ? (
                    <Link href={`/loja/${item.slug}`} className="font-semibold hover:text-primary line-clamp-1">
                      {item.nome}
                    </Link>
                  ) : (
                    <p className="font-semibold line-clamp-1">{item.nome}</p>
                  )}
                  <p className="text-sm font-medium mt-1">{formatCurrency(item.preco)}</p>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantidade}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1)}
                      >
                        +
                      </Button>
                    </div>

                    <p className="text-sm font-bold ml-auto">
                      {formatCurrency(item.preco * item.quantidade)}
                    </p>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removerItem(item.produto_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumo */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Cupom */}
              <div className="space-y-2">
                {cupomInfo ? (
                  <div className="flex items-center justify-between p-2 rounded bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-xs font-medium text-green-400">{cupomInfo.codigo}</p>
                        <p className="text-[10px] text-green-500/70">
                          -{cupomInfo.tipo === "percentual" ? `${cupomInfo.valor}%` : formatCurrency(cupomInfo.valor)}
                        </p>
                      </div>
                    </div>
                    <button onClick={removerCupom} className="text-[10px] text-muted-foreground hover:text-foreground">Remover</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input value={cupomCodigo} onChange={(e) => setCupomCodigo(e.target.value)}
                      placeholder="Cupom de desconto" className="h-9 text-sm uppercase" />
                    <Button variant="outline" size="sm" onClick={aplicarCupom} disabled={cupomLoading} className="h-9">
                      {cupomLoading ? "..." : "OK"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-sm">
                <span>Itens ({totalItens})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {desconto > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Desconto</span>
                  <span>-{formatCurrency(desconto)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Frete</span>
                <span className="text-green-600">Grátis</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/checkout" className="w-full" onClick={() => {
                if (cupomInfo) localStorage.setItem("cupom", JSON.stringify(cupomInfo));
                else localStorage.removeItem("cupom");
              }}>
                <Button className="w-full" size="lg">
                  Finalizar Pedido
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Link href="/loja" className="block mt-4">
            <Button variant="ghost" className="w-full">
              Continuar Comprando
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
