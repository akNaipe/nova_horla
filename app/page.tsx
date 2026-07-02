import Link from "next/link";
import Image from "next/image";
import { ProdutoCard } from "@/components/produtos/produto-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ShoppingBag, ArrowRight } from "lucide-react";

async function getProdutos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("produtos")
    .select("id, nome, slug, preco_venda, preco_promocional, quantidade_estoque, imagem_url, destaque, data_cadastro, categoria_id")
    .eq("ativo", true)
    .eq("destaque", true)
    .order("data_cadastro", { ascending: false })
    .limit(8);
  return data || [];
}

async function getCategorias() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categorias")
    .select("id, nome")
    .order("nome");
  return data || [];
}

export default async function HomePage() {
  const [produtos, categorias] = await Promise.all([getProdutos(), getCategorias()]);

  return (
    <div>
      {/* Hero simplificado */}
      <section className="py-12 md:py-20">
        <div className="container max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Bem-vindo à <span className="text-primary">Nova Loja</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            Produtos selecionados com preços justos e entrega rápida.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/loja">
              <Button>Ver Produtos <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
            </Link>
            <Link href="/auth/cadastro">
              <Button variant="outline">Criar Conta</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categorias - simples em linha */}
      {categorias.length > 0 && (
        <section className="container max-w-4xl mb-10">
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/loja" className="px-4 py-1.5 rounded-full text-sm border hover:bg-accent transition-colors">
              Todos
            </Link>
            {categorias.map((cat) => (
              <Link
                key={cat.id}
                href={`/loja?categoria=${cat.id}`}
                className="px-4 py-1.5 rounded-full text-sm border hover:bg-accent transition-colors"
              >
                {cat.nome}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Destaques */}
      <section className="container max-w-6xl mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">Destaques</h2>
          <Link href="/loja" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            Ver tudo <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {produtos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {produtos.map((produto) => (
              <ProdutoCard key={produto.id} produto={produto} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum destaque no momento.</p>
          </div>
        )}
      </section>

      {/* Info minimalista */}
      <section className="border-t">
        <div className="container max-w-4xl py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div className="p-3">
              <p className="font-medium">🚚 Frete Grátis</p>
              <p className="text-muted-foreground text-xs">Acima de R$ 99</p>
            </div>
            <div className="p-3">
              <p className="font-medium">🔒 Seguro</p>
              <p className="text-muted-foreground text-xs">Compra protegida</p>
            </div>
            <div className="p-3">
              <p className="font-medium">💳 Parcelamento</p>
              <p className="text-muted-foreground text-xs">Em até 12x</p>
            </div>
            <div className="p-3">
              <p className="font-medium">📦 Entrega</p>
              <p className="text-muted-foreground text-xs">Para todo Brasil</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
