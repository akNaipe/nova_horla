"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { duplicarProduto } from "@/lib/supabase/actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function DuplicarProdutoButton({ id }: { id: number }) {
  const { toast } = useToast();
  const router = useRouter();

  const handleDuplicar = async () => {
    const { error } = await duplicarProduto(id);
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      toast({ title: "Produto duplicado!" });
    }
    router.refresh();
  };

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDuplicar} title="Duplicar produto">
      <Copy className="h-4 w-4" />
    </Button>
  );
}
