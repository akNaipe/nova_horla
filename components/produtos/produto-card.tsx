import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import type { Produto } from "@/types";

interface ProdutoCardProps {
  produto: Produto;
}

export function ProdutoCard({ produto }: ProdutoCardProps) {
  const temPromocao = !!produto.preco_promocional;

  return (
    <Link href={`/loja/${produto.slug}`} className="group block card-wave">
      <div className="aspect-square relative bg-muted rounded-lg overflow-hidden mb-2">
        {produto.imagem_url ? (
          <Image
            src={produto.imagem_url}
            alt={produto.nome}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Sem imagem
          </div>
        )}
        {temPromocao && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded badge-animated animate-pulse-glow">
            -{Math.round((1 - produto.preco_promocional! / produto.preco_venda) * 100)}%
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">{produto.nome}</h3>
      <div className="mt-1">
        {temPromocao ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-red-600 animate-glow">
              {formatCurrency(produto.preco_promocional!)}
            </span>
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(produto.preco_venda)}
            </span>
          </div>
        ) : (
          <span className="text-sm font-bold">{formatCurrency(produto.preco_venda)}</span>
        )}
      </div>
    </Link>
  );
}
