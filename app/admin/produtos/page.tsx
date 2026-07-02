import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { ExcluirProdutoButton } from "@/components/admin/excluir-produto-button";
import { DuplicarProdutoButton } from "@/components/admin/duplicar-produto";

async function getProdutos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("produtos")
    .select("id, nome, slug, preco_venda, preco_promocional, quantidade_estoque, imagem_url, ativo, destaque, data_cadastro, categoria_id")
    .order("data_cadastro", { ascending: false });

  return data || [];
}

export default async function AdminProdutosPage() {
  const produtos = await getProdutos();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Link href="/admin/produtos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Produto</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Categoria</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Preço</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Estoque</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum produto cadastrado
                    </td>
                  </tr>
                ) : (
                  produtos.map((produto) => (
                    <tr key={produto.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted overflow-hidden relative shrink-0">
                            {produto.imagem_url ? (
                              <Image src={produto.imagem_url} alt={produto.nome} fill className="object-cover" sizes="40px" />
                            ) : null}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{produto.nome}</p>
                            <p className="text-xs text-muted-foreground">{produto.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">-</td>
                      <td className="p-4 text-sm">
                        {produto.preco_promocional ? (
                          <div>
                            <span className="text-red-600 font-medium">{formatCurrency(produto.preco_promocional)}</span>
                            <span className="text-xs text-muted-foreground line-through ml-1">{formatCurrency(produto.preco_venda)}</span>
                          </div>
                        ) : (
                          formatCurrency(produto.preco_venda)
                        )}
                      </td>
                      <td className="p-4 text-center text-sm">
                        <span className={produto.quantidade_estoque <= 5 ? "text-orange-600 font-medium" : ""}>
                          {produto.quantidade_estoque}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={produto.ativo ? "secondary" : "outline"} className={produto.ativo ? "bg-green-100 text-green-700" : ""}>
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/produtos/${produto.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/variacoes/${produto.id}`}>                             <Button variant="ghost" size="icon" className="h-8 w-8" title="Variações">📋</Button>                           </Link>                           <Link href={`/admin/historico-precos/${produto.id}`}>                             <Button variant="ghost" size="icon" className="h-8 w-8" title="Histórico de Preços">📊</Button>                           </Link>                           <DuplicarProdutoButton id={produto.id} />
                          <ExcluirProdutoButton id={produto.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
