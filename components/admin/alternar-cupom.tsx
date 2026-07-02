"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { alternarCupom } from "@/lib/supabase/actions";

export function AlternarCupomButton({ id, ativo }: { id: string; ativo: boolean }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleToggle = async () => {
    const { error } = await alternarCupom(id, !ativo);
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      toast({ title: ativo ? "Cupom desativado" : "Cupom ativado" });
    }
    router.refresh();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleToggle} className="h-7 text-xs">
      {ativo ? "Desativar" : "Ativar"}
    </Button>
  );
}
