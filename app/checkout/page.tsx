"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { CarrinhoItem, Cliente } from "@/types";
import type { User } from "@supabase/supabase-js";

export default function CheckoutPage() {
  const [itens, setItens] = useState<CarrinhoItem[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [endereco, setEndereco] = useState({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  useEffect(() => {
    const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
    if (carrinho.length === 0) {
      router.push("/carrinho");
      return;
    }
    setItens(carrinho);

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/auth/login?redirect=/checkout");
        return;
      }
      setUser(data.user);
      supabase
        .from("clientes")
        .select("id, user_id, nome, email, telefone, endereco, created_at")
        .eq("user_id", data.user.id)
        .single()
        .then(({ data: cl }) => {
          if (cl) {
            setCliente(cl);
            if (cl.endereco) {
              setEndereco((prev) => ({ ...prev, ...(cl.endereco as typeof endereco) }));
            }
          }
        });
    });
  }, []);

  const [cupomInfo, setCupomInfo] = useState<{ codigo: string; tipo: string; valor: number } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cupom");
      if (saved) setCupomInfo(JSON.parse(saved));
    } catch {}
  }, []);

  const subtotal = useMemo(() => itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0), [itens]);
  const desconto = useMemo(() => {
    if (!cupomInfo) return 0;
    if (cupomInfo.tipo === "percentual") return subtotal * (cupomInfo.valor / 100);
    return Math.min(cupomInfo.valor, subtotal);
  }, [cupomInfo, subtotal]);
  const total = subtotal - desconto;

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !user) return;

    setLoading(true);
    try {
      // Atualizar endereço do cliente
      await supabase
        .from("clientes")
        .update({ endereco })
        .eq("id", cliente.id);

      // Criar pedido no banco
      const resPedido = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: cliente.id,
          itens: itens.map((item) => ({
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco,
            subtotal: item.preco * item.quantidade,
          })),
          total,
          endereco_entrega: endereco,
          metodo_pagamento: "mercadopago",
        }),
      });

      if (!resPedido.ok) {
        const err = await resPedido.json();
        throw new Error(err.error || "Erro ao criar pedido");
      }

      // Criar preferência no Mercado Pago
      const resMP = await fetch("/api/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itens.map((item) => ({
            title: item.nome,
            quantity: item.quantidade,
            price: item.preco,
          })),
          cliente_id: cliente.id,
          email: user.email,
          endereco_entrega: endereco,
        }),
      });

      if (!resMP.ok) {
        const err = await resMP.json();
        throw new Error(err.error || "Erro ao gerar pagamento");
      }

      const mpData = await resMP.json();

      // Limpar carrinho
      localStorage.removeItem("carrinho");

      // Redirecionar para o Mercado Pago
      window.location.href = mpData.init_point || mpData.sandbox_init_point;
    } catch (err) {
      toast({
        title: "Erro ao finalizar pedido",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (itens.length === 0) return null;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleFinalizar}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Dados do Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {cliente?.nome} &mdash; {cliente?.email}
                </p>
              </CardContent>
            </Card>

            {/* Endereço de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" value={endereco.cep} onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })} required placeholder="00000-000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input id="estado" value={endereco.estado} onChange={(e) => setEndereco({ ...endereco, estado: e.target.value })} required placeholder="SP" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={endereco.cidade} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" value={endereco.bairro} onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })} required />
                </div>
                <div className="grid grid-cols-[1fr_80px] gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rua">Rua</Label>
                    <Input id="rua" value={endereco.rua} onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input id="numero" value={endereco.numero} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input id="complemento" value={endereco.complemento} onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })} />
                </div>
              </CardContent>
            </Card>

            {/* Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Mercado Pago</p>
                    <p className="text-sm text-blue-700">Pagamento processado com segurança pelo Mercado Pago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {itens.map((item) => (
                  <div key={item.produto_id} className="flex gap-3">
                    <div className="w-12 h-12 rounded bg-muted shrink-0 overflow-hidden relative">
                      {item.imagem ? (
                        <Image src={item.imagem} alt={item.nome} fill className="object-cover" sizes="48px" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantidade}x {formatCurrency(item.preco)}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(item.preco * item.quantidade)}
                    </p>
                  </div>
                ))}
                <Separator />
                {cupomInfo && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Cupom ({cupomInfo.codigo})</span>
                    <span>-{formatCurrency(desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Processando..." : "Finalizar Pedido"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
