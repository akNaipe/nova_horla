import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { AdicionarAoCarrinho } from "@/components/produtos/adicionar-ao-carrinho";
import { Avaliacoes } from "@/components/produtos/avaliacoes";
import { FormAvaliacao } from "@/components/produtos/form-avaliacao";
import { VariacoesWrapper } from "@/components/produtos/variacoes-wrapper";
import { ProdutoCard } from "@/components/produtos/produto-card";
import { ChevronLeft, Truck, Shield, RotateCcw, Star } from "lucide-react";
import type { Produto } from "@/types";

async function getProduto(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("produtos")
    .select("id, nome, slug, descricao, preco_venda, preco_promocional, quantidade_estoque, imagem_url, ativo, destaque, sku, data_cadastro, categoria_id")
    .eq("slug", slug)
    .eq("ativo", true)
    .single();
  return data as Produto | null;
}

async function getRelacionados(categoriaId: string | null, produtoId: number) {
  if (!categoriaId) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("produtos")
    .select("id, nome, slug, descricao, preco_venda, preco_promocional, quantidade_estoque, imagem_url, ativo, destaque, sku, data_cadastro, categoria_id, updated_at")
    .eq("ativo", true)
    .eq("categoria_id", categoriaId)
    .neq("id", produtoId)
    .order("data_cadastro", { ascending: false })
    .limit(4);
  return data || [];
}

async function getMediaAvaliacoes(produtoId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("avaliacoes")
    .select("nota")
    .eq("produto_id", produtoId);
  if (!data?.length) return null;
  const media = data.reduce((a, r) => a + r.nota, 0) / data.length;
  return { media: Number(media.toFixed(1)), total: data.length };
}

export default async function ProdutoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const produto = await getProduto(slug);
  if (!produto) notFound();

  const [relacionados, avaliacoesInfo] = await Promise.all([
    getRelacionados(produto.categoria_id, produto.id),
    getMediaAvaliacoes(produto.id),
  ]);

  const temPromocao = !!produto.preco_promocional;
  const desconto = temPromocao ? Math.round((1 - produto.preco_promocional! / produto.preco_venda) * 100) : 0;

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 animate-slide-up animate-stagger-1">
        <Link href="/" className="link-underline">Home</Link>
        <span>/</span>
        <Link href="/loja" className="link-underline">Loja</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{produto.nome}</span>
      </div>

      <Link href="/loja" className="inline-flex items-center text-sm text-muted-foreground link-underline mb-6 animate-slide-up animate-stagger-2">
        <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Imagem + Galeria */}
        <div className="animate-slide-left animate-stagger-3">
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-muted border mb-3 img-zoom-hover">
            {produto.imagem_url ? (
              <Image src={produto.imagem_url} alt={produto.nome} fill className="object-cover img-fade-in" sizes="50vw" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
            )}
            {temPromocao && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 border-0 animate-scale-in">-{desconto}%</Badge>
            )}
          </div>
          {/* Miniaturas (placeholder) */}
          <div className="flex gap-2">
            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-primary">
              {produto.imagem_url ? (
                <Image src={produto.imagem_url} alt="" width={64} height={64} className="object-cover w-full h-full" />
              ) : null}
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-16 h-16 rounded-lg border border-dashed flex items-center justify-center text-[10px] text-muted-foreground bg-muted/30">
                +{i}
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="animate-slide-right animate-stagger-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{produto.nome}</h1>

          {/* Estrelas */}
          {avaliacoesInfo && (
            <div className="flex items-center gap-2 mb-4 animate-slide-up" style={{animationDelay: '0.5s'}}>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`h-4 w-4 transition-colors ${n <= Math.round(avaliacoesInfo.media) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{avaliacoesInfo.media} ({avaliacoesInfo.total})</span>
            </div>
          )}

          {/* Preço */}
          <div className="flex items-baseline gap-3 mb-6 animate-slide-up" style={{animationDelay: '0.6s'}}>
            {temPromocao ? (
              <>
                <span className="text-3xl md:text-4xl font-bold text-red-600">{formatCurrency(produto.preco_promocional!)}</span>
                <span className="text-xl text-muted-foreground line-through">{formatCurrency(produto.preco_venda)}</span>
              </>
            ) : (
              <span className="text-3xl md:text-4xl font-bold">{formatCurrency(produto.preco_venda)}</span>
            )}
          </div>

          {/* Variações */}
          <div className="animate-slide-up" style={{animationDelay: '0.7s'}}>
            <VariacoesWrapper produtoId={produto.id} precoBase={produto.preco_venda} />
          </div>

          {/* Estoque */}
          <div className="mb-6 animate-slide-up" style={{animationDelay: '0.8s'}}>
            {produto.quantidade_estoque > 0 ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-ring" />
                <span className="text-sm text-green-500 font-medium">Em estoque ({produto.quantidade_estoque} unid.)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-red-500 font-medium">Esgotado</span>
              </div>
            )}
          </div>

          <div className="animate-slide-up" style={{animationDelay: '0.9s'}}>
            <AdicionarAoCarrinho produto={produto} />
          </div>

          <div className="space-y-3 mt-6 text-sm text-muted-foreground animate-slide-up" style={{animationDelay: '1s'}}>
            {[{ icon: Truck, text: "Frete grátis para todo Brasil" }, { icon: Shield, text: "Compra 100% segura" }, { icon: RotateCcw, text: "Devolução em até 7 dias" }].map(({ icon: Icon, text }, i) => (
              <div key={text} className="flex items-center gap-3 hover-scale transition-transform" style={{animationDelay: `${1 + i * 0.05}s`}}>
                <Icon className="h-4 w-4 hover-scale transition-transform" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {produto.descricao && (
            <div className="animate-slide-up" style={{animationDelay: '1.2s'}}>
              <Separator className="my-6" />
              <div>
                <h2 className="font-semibold mb-3">Descrição</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{produto.descricao}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avaliações */}
      <Separator className="my-10 animate-slide-up" style={{animationDelay: '1.3s'}} />
      <div className="max-w-2xl animate-slide-up" style={{animationDelay: '1.4s'}}>
        <Avaliacoes produtoId={produto.id} />
        <div className="mt-6">
          <FormAvaliacao produtoId={produto.id} />
        </div>
      </div>

      {/* Produtos Relacionados */}
      {relacionados.length > 0 && (
        <>
          <Separator className="my-10 animate-slide-up" style={{animationDelay: '1.5s'}} />
          <div className="animate-slide-up" style={{animationDelay: '1.6s'}}>
            <h2 className="text-xl font-bold mb-6">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relacionados.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-slide-up card-hover"
                  style={{animationDelay: `${1.7 + i * 0.08}s`}}
                >
                  <ProdutoCard produto={p} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
