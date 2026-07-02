"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { excluirProduto } from "@/lib/supabase/actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function ExcluirProdutoButton({ id }: { id: number }) {
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const { error } = await excluirProduto(id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error, variant: "destructive" });
    } else {
      toast({ title: "Produto excluído" });
    }
    router.refresh();
  };

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
