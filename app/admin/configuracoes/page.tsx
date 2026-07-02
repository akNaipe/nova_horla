import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConfigLoja } from "@/lib/supabase/actions";
import { FormConfig } from "@/components/admin/form-config";

export default async function ConfigPage() {
  const { data: config } = await getConfigLoja();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Personalize sua loja</p>
      </div>
      <FormConfig config={config || {}} />
    </div>
  );
}
