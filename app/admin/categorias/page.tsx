import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormCategoria } from "@/components/admin/form-categoria";

async function getCategorias() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categorias")
    .select("id, nome, slug, descricao, created_at, updated_at")
    .order("nome");
  return data || [];
}

export default async function AdminCategoriasPage() {
  const categorias = await getCategorias();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Categorias</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Nova Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <FormCategoria />
          </CardContent>
        </Card>

        {/* Lista */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias Cadastradas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {categorias.length === 0 ? (
              <p className="text-muted-foreground p-6">Nenhuma categoria cadastrada.</p>
            ) : (
              <div className="divide-y">
                {categorias.map((cat) => (
                  <div key={cat.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{cat.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        slug: {cat.slug}
                      </p>
                    </div>
                    <FormCategoria categoria={cat} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
