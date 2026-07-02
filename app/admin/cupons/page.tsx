import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listarCupons } from "@/lib/supabase/actions";
import { formatCurrency } from "@/lib/utils";
import { FormCupom } from "@/components/admin/form-cupom";
import { AlternarCupomButton } from "@/components/admin/alternar-cupom";

export default async function CuponsPage() {
  const { data: cupons } = await listarCupons();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cupons de Desconto</h1>
        <p className="text-sm text-muted-foreground">Gerencie cupons promocionais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Novo Cupom</CardTitle></CardHeader>
          <CardContent><FormCupom /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Cupons Cadastrados</CardTitle></CardHeader>
          <CardContent className="p-0">
            {!cupons?.length ? (
              <p className="text-sm text-muted-foreground p-4">Nenhum cupom.</p>
            ) : (
              <div className="divide-y">
                {cupons.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm">{c.codigo}</span>
                        <Badge className={c.ativo ? "bg-green-500/20 text-green-400 border-0" : "bg-red-500/20 text-red-400 border-0"}>
                          {c.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {c.tipo === "percentual" ? `${c.valor}% off` : formatCurrency(c.valor)}
                        {c.valor_minimo > 0 && ` | Mín: ${formatCurrency(c.valor_minimo)}`}
                        {c.usos_maximos > 0 && ` | ${c.usos_atuais}/${c.usos_maximos} usos`}
                        {c.expira_em && ` | Exp: ${new Date(c.expira_em).toLocaleDateString("pt-BR")}`}
                      </p>
                    </div>
                    <AlternarCupomButton id={c.id} ativo={c.ativo} />
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
