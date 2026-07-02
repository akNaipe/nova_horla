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
    <div className="container py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/loja" className="hover:text-primary">Loja</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{produto.nome}</span>
      </div>

      <Link href="/loja" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Imagem + Galeria */}
        <div>
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-muted border mb-3">
            {produto.imagem_url ? (
              <Image src={produto.imagem_url} alt={produto.nome} fill className="object-cover" sizes="50vw" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
            )}
            {temPromocao && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 border-0">-{desconto}%</Badge>
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
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{produto.nome}</h1>

          {/* Estrelas */}
          {avaliacoesInfo && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`h-4 w-4 ${n <= Math.round(avaliacoesInfo.media) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{avaliacoesInfo.media} ({avaliacoesInfo.total})</span>
            </div>
          )}

          {/* Preço */}
          <div className="flex items-baseline gap-3 mb-6">
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
          <VariacoesWrapper produtoId={produto.id} precoBase={produto.preco_venda} />

          {/* Estoque */}
          <div className="mb-6">
            {produto.quantidade_estoque > 0 ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-500 font-medium">Em estoque ({produto.quantidade_estoque} unid.)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-red-500 font-medium">Esgotado</span>
              </div>
            )}
          </div>

          <AdicionarAoCarrinho produto={produto} />

          <div className="space-y-3 mt-6 text-sm text-muted-foreground">
            {[{ icon: Truck, text: "Frete grátis para todo Brasil" }, { icon: Shield, text: "Compra 100% segura" }, { icon: RotateCcw, text: "Devolução em até 7 dias" }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3"><Icon className="h-4 w-4" /><span>{text}</span></div>
            ))}
          </div>

          {produto.descricao && (
            <><Separator className="my-6" /><div><h2 className="font-semibold mb-3">Descrição</h2><p className="text-muted-foreground whitespace-pre-wrap">{produto.descricao}</p></div></>
          )}
        </div>
      </div>

      {/* Avaliações */}
      <Separator className="my-10" />
      <div className="max-w-2xl">
        <Avaliacoes produtoId={produto.id} />
        <div className="mt-6">
          <FormAvaliacao produtoId={produto.id} />
        </div>
      </div>

      {/* Produtos Relacionados */}
      {relacionados.length > 0 && (
        <>
          <Separator className="my-10" />
          <div>
            <h2 className="text-xl font-bold mb-6">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relacionados.map((p) => <ProdutoCard key={p.id} produto={p} />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
