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
      {/* Hero com fundo animado sofisticado */}
      <section className="relative py-16 md:py-28 overflow-hidden animated-hero-bg hero-full-animated">
        {/* Blobs flutuantes de fundo */}
        <div className="animated-blob blob-1" />
        <div className="animated-blob blob-2" />
        <div className="animated-blob blob-3" />

        {/* Glows de fundo */}
        <div className="glow-circle glow-1" />
        <div className="glow-circle glow-2" />

        {/* Linhas animadas */}
        <div className="absolute top-0 left-0 right-0 h-1 animated-line" />
        <div className="absolute bottom-0 left-0 right-0 h-1 animated-line" style={{animationDelay: '0.5s'}} />

        {/* Conteúdo principal */}
        <div className="container max-w-4xl text-center relative z-10">
          <div className="flex justify-center mb-6 animate-floating">
            <div className="p-4 rounded-full bg-primary/10 animate-pulse-glow">
              <Waves className="h-10 w-10 text-primary animate-wave" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 animate-glow">
            Bem-vindo à <span className="text-primary">Nova Horla</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6 slide-in" style={{animation: 'slideInWave 0.8s ease-out 0.2s both'}}>
            Produtos com a energia do mar. Frescor, estilo e qualidade que fluem como as ondas.
          </p>
          <div className="flex gap-3 justify-center" style={{animation: 'slideInWave 0.8s ease-out 0.4s both'}}>
            <Link href="/loja">
              <Button size="lg" className="btn-wave">Ver Produtos <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
            </Link>
            <Link href="/auth/cadastro">
              <Button variant="outline" size="lg" className="btn-wave">Criar Conta</Button>
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
          <h2 className="text-xl font-semibold animate-glow">Destaques</h2>
          <Link href="/loja" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 link-animated">
            Ver tudo <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {produtos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {produtos.map((produto, i) => (
              <div key={produto.id} style={{animation: `slideInWave 0.6s ease-out ${i * 0.1}s both`}}>
                <div className="card-wave">
                  <ProdutoCard produto={produto} />
                </div>
              </div>
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
      <section className="border-t wave-divider wave-container">
        <div className="container max-w-4xl py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            {[
              { icon: Droplets, title: "Frete Grátis", desc: "Acima de R$ 99" },
              { icon: Droplets, title: "Compra Segura", desc: "Dados protegidos" },
              { icon: Droplets, title: "Parcelamento", desc: "Em até 12x" },
              { icon: Droplets, title: "Entrega", desc: "Para todo Brasil" }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="p-3 card-wave" style={{animation: `slideInWave 0.6s ease-out ${0.8 + i * 0.1}s both`}}>
                  <Icon className="h-5 w-5 mx-auto mb-1.5 text-primary animate-wave" />
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-xs">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
