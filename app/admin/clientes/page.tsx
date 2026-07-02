import { Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

async function getClientes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("id, user_id, nome, email, telefone, created_at, pedidos:pedidos(count)")
    .order("created_at", { ascending: false });

  return data || [];
}

export default async function AdminClientesPage() {
  const clientes = await getClientes();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Clientes</h1>

      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {clientes.length === 0 ? (
            <p className="text-muted-foreground p-6">Nenhum cliente cadastrado.</p>
          ) : (
            <div className="divide-y">
              {clientes.map((cliente) => (
                <div key={cliente.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{cliente.nome}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {cliente.email}
                      </span>
                      {cliente.telefone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {cliente.telefone}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cliente desde {formatDate(cliente.created_at)}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {cliente.pedidos?.[0]?.count || 0} pedidos
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
