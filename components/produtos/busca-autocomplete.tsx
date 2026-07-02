"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function BuscaAutocomplete() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Array<{ id: number; nome: string; slug: string; preco_venda: number }>>([]);
  const [aberto, setAberto] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setResultados([]); return; }
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("produtos")
        .select("id, nome, slug, preco_venda")
        .eq("ativo", true)
        .ilike("nome", `%${query}%`)
        .limit(5);
      setResultados(data || []);
      setAberto(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produtos..." className="pl-9 h-9 text-sm"
        onKeyDown={(e) => { if (e.key === "Enter") { router.push(`/loja?busca=${query}`); setAberto(false); } }} />
      {aberto && resultados.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-card border rounded-lg shadow-lg overflow-hidden z-50">
          {resultados.map((p) => (
            <Link key={p.id} href={`/loja/${p.slug}`} onClick={() => { setAberto(false); setQuery(""); }}
              className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors text-sm">
              <span>{p.nome}</span>
              <span className="text-muted-foreground">R$ {p.preco_venda.toFixed(2)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
