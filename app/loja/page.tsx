import { ProdutoCard } from "@/components/produtos/produto-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ordenador } from "@/components/produtos/ordenador";
import { createClient } from "@/lib/supabase/server";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Produto, Categoria } from "@/types";

const ITENS_POR_PAGINA = 12;

async function getData(searchParams: {
  busca?: string; categoria?: string; ordenar?: string; pagina?: string;
}) {
  const supabase = await createClient();
  const pagina = Math.max(1, parseInt(searchParams.pagina || "1"));
  const offset = (pagina - 1) * ITENS_POR_PAGINA;

  let query = supabase
    .from("produtos")
    .select("id, nome, slug, preco_venda, preco_promocional, quantidade_estoque, imagem_url, destaque, data_cadastro, categoria_id", { count: "exact" })
    .eq("ativo", true);

  if (searchParams.categoria) query = query.eq("categoria_id", searchParams.categoria);
  if (searchParams.busca) query = query.ilike("nome", `%${searchParams.busca}%`);
  if (searchParams.ordenar === "menor-preco") query = query.order("preco_venda", { ascending: true });
  else if (searchParams.ordenar === "maior-preco") query = query.order("preco_venda", { ascending: false });
  else query = query.order("data_cadastro", { ascending: false });

  const { data: produtos, count } = await query.range(offset, offset + ITENS_POR_PAGINA - 1);
  const { data: categorias } = await supabase.from("categorias").select("id, nome").order("nome");

  const totalPaginas = Math.ceil((count || 0) / ITENS_POR_PAGINA);

  return {
    produtos: (produtos || []) as Produto[],
    categorias: (categorias || []) as Categoria[],
    pagina, totalPaginas, total: count || 0,
  };
}

function Paginacao({ pagina, totalPaginas, baseUrl }: { pagina: number; totalPaginas: number; baseUrl: string }) {
  if (totalPaginas <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {pagina > 1 && (
        <Link href={`${baseUrl}&pagina=${pagina - 1}`} className="p-2 rounded-md border hover:bg-accent">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
        <Link key={p} href={`${baseUrl}&pagina=${p}`}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
            p === pagina ? "bg-primary text-primary-foreground" : "border hover:bg-accent"
          }`}>
          {p}
        </Link>
      ))}
      {pagina < totalPaginas && (
        <Link href={`${baseUrl}&pagina=${pagina + 1}`} className="p-2 rounded-md border hover:bg-accent">
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const { produtos, categorias, pagina, totalPaginas, total } = await getData(sp);

  const montarUrl = (params: Record<string, string>) => {
    const url = new URLSearchParams();
    if (sp.categoria) url.set("categoria", sp.categoria);
    if (sp.busca) url.set("busca", sp.busca);
    if (sp.ordenar) url.set("ordenar", sp.ordenar);
    Object.entries(params).forEach(([k, v]) => url.set(k, v));
    return `/loja?${url.toString()}`;
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form method="GET" action="/loja" className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" name="busca" placeholder="Buscar..." defaultValue={sp.busca || ""} className="pl-9 h-9 text-sm" />
          </div>
        </form>
        <Ordenador valorAtual={sp.ordenar || ""} categoria={sp.categoria} />
      </div>

      <div className="flex gap-6">
        <aside className="hidden md:block w-40 shrink-0">
          <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Categorias</div>
          <div className="space-y-0.5">
            <Link href={montarUrl({ categoria: "", busca: "", ordenar: "" }).replace(/[?&]pagina=\d+/g, "")}
              className={`block px-2 py-1 text-sm rounded ${!sp.categoria ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
              Todos
            </Link>
            {categorias.map((cat) => (
              <Link key={cat.id} href={`/loja?categoria=${cat.id}`}
                className={`block px-2 py-1 text-sm rounded ${sp.categoria === cat.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                {cat.nome}
              </Link>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-3">{total} produto(s) - Página {pagina} de {totalPaginas}</p>
          {produtos.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {produtos.map((p) => <ProdutoCard key={p.id} produto={p} />)}
              </div>
              <Paginacao pagina={pagina} totalPaginas={totalPaginas}
                baseUrl={montarUrl({ pagina: String(pagina) }).replace(/pagina=\d+/, "pagina=PAG")} />
            </>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum produto encontrado</p>
              <Link href="/loja" className="text-sm text-primary hover:underline mt-1 inline-block">Limpar filtros</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
