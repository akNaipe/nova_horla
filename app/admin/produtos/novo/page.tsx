import { createClient } from "@/lib/supabase/server";
import { ProdutoForm } from "@/components/admin/produto-form";

export default async function NovoProdutoPage() {
  const supabase = await createClient();
  const { data: categorias } = await supabase.from("categorias").select("*").order("nome");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Novo Produto</h1>
      <ProdutoForm categorias={categorias || []} />
    </div>
  );
}
