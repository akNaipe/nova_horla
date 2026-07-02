"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { criarCategoria, atualizarCategoria, excluirCategoria } from "@/lib/supabase/actions";
import type { Categoria } from "@/types";

interface FormCategoriaProps {
  categoria?: Categoria | null;
}

export function FormCategoria({ categoria }: FormCategoriaProps) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(categoria?.nome || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSalvar = async () => {
    if (!nome.trim()) return;
    setLoading(true);
    if (categoria) {
      const { error } = await atualizarCategoria(categoria.id, { nome });
      if (error) {
        toast({ title: "Erro ao atualizar", description: error, variant: "destructive" });
      } else {
        toast({ title: "Categoria atualizada!" });
        setEditando(false);
      }
    } else {
      const { error } = await criarCategoria({ nome });
      if (error) {
        toast({ title: "Erro ao criar", description: error, variant: "destructive" });
      } else {
        toast({ title: "Categoria criada!" });
        setNome("");
      }
    }
    router.refresh();
    setLoading(false);
  };

  const handleExcluir = async () => {
    if (!categoria || !confirm(`Excluir categoria "${categoria.nome}"?`)) return;
    setLoading(true);
    const { error } = await excluirCategoria(categoria.id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error, variant: "destructive" });
    } else {
      toast({ title: "Categoria excluída!" });
    }
    router.refresh();
    setLoading(false);
  };

  if (categoria && !editando) {
    return (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditando(true); setNome(categoria.nome); }}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleExcluir} disabled={loading}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da categoria"
        disabled={loading}
      />
      <Button size="sm" onClick={handleSalvar} disabled={loading || !nome.trim()}>
        {loading ? "..." : categoria ? "Salvar" : "Adicionar"}
      </Button>
      {categoria && editando && (
        <Button size="sm" variant="ghost" onClick={() => setEditando(false)}>
          Cancelar
        </Button>
      )}
    </div>
  );
}
