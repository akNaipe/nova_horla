"use client";

import { useRouter } from "next/navigation";

interface OrdenadorProps {
  valorAtual: string;
  categoria?: string;
}

export function Ordenador({ valorAtual, categoria }: OrdenadorProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href);
    url.searchParams.set("ordenar", e.target.value);
    if (categoria) url.searchParams.set("categoria", categoria);
    router.push(url.toString());
  };

  return (
    <select
      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      value={valorAtual}
      onChange={handleChange}
    >
      <option value="">Ordenar: Mais recentes</option>
      <option value="menor-preco">Menor preço</option>
      <option value="maior-preco">Maior preço</option>
    </select>
  );
}
