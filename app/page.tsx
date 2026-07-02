import Link from "next/link";
import Image from "next/image";
import { ProdutoCard } from "@/components/produtos/produto-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Waves, ArrowRight, Droplets, ShoppingBag } from "lucide-react";

async function getProdutos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("produtos")
    .select("id, nome, slug, descricao, preco_venda, preco_promocional, quantidade_estoque, imagem_url, ativo, destaque, sku, data_cadastro, categoria_id, updated_at")
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
      {/* Hero com tema de ondas */}
      <section className="relative py-16 md:py-28 overflow-hidden">
        {/* Gradiente ondulado de fundo */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/5" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 0, 50 10 T 100 10' fill='none' stroke='%232A9D8F' stroke-width='2'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 20px',
        }} />
        <div className="container max-w-4xl text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10">
              <Waves className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Bem-vindo à <span className="text-primary">Nova Horla</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            Produtos com a energia do mar. Frescor, estilo e qualidade que fluem como as ondas.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/loja">
              <Button size="lg">Ver Produtos <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
            </Link>
            <Link href="/auth/cadastro">
              <Button variant="outline" size="lg">Criar Conta</Button>
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

      {/* Info com ícones de onda */}
      <section className="border-t wave-divider">
        <div className="container max-w-4xl py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div className="p-3">
              <Droplets className="h-5 w-5 mx-auto mb-1.5 text-primary" />
              <p className="font-medium">Frete Grátis</p>
              <p className="text-muted-foreground text-xs">Acima de R$ 99</p>
            </div>
            <div className="p-3">
              <Droplets className="h-5 w-5 mx-auto mb-1.5 text-primary" />
              <p className="font-medium">Compra Segura</p>
              <p className="text-muted-foreground text-xs">Dados protegidos</p>
            </div>
            <div className="p-3">
              <Droplets className="h-5 w-5 mx-auto mb-1.5 text-primary" />
              <p className="font-medium">Parcelamento</p>
              <p className="text-muted-foreground text-xs">Em até 12x</p>
            </div>
            <div className="p-3">
              <Droplets className="h-5 w-5 mx-auto mb-1.5 text-primary" />
              <p className="font-medium">Entrega</p>
              <p className="text-muted-foreground text-xs">Para todo Brasil</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
