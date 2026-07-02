import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProdutoForm } from "@/components/admin/produto-form";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: produto } = await supabase
    .from("produtos")
    .select("*")
    .eq("id", Number(id))
    .single();

  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .order("nome");

  if (!produto) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Editar Produto</h1>
      <ProdutoForm produto={produto} categorias={categorias || []} />
    </div>
  );
}
