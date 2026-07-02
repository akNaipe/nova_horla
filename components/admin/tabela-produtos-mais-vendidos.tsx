import { formatCurrency } from "@/lib/utils";

interface TabelaProdutosMaisVendidosProps {
  data: Array<{ nome: string; quantidade: number; total: number }>;
}

export function TabelaProdutosMaisVendidos({ data }: TabelaProdutosMaisVendidosProps) {
  if (data.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        Nenhum dado disponível.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">#</th>
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Produto</th>
            <th className="text-right p-3 text-sm font-medium text-muted-foreground">Quantidade</th>
            <th className="text-right p-3 text-sm font-medium text-muted-foreground">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.nome} className="border-b hover:bg-muted/50">
              <td className="p-3 text-sm text-muted-foreground">{index + 1}</td>
              <td className="p-3 font-medium">{item.nome}</td>
              <td className="p-3 text-right">{item.quantidade}</td>
              <td className="p-3 text-right font-medium">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
