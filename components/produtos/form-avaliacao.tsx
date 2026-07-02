"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Star } from "lucide-react";

interface FormAvaliacaoProps {
  produtoId: number;
  onSuccess?: () => void;
}

export function FormAvaliacao({ produtoId, onSuccess = () => {} }: FormAvaliacaoProps) {
  const [nota, setNota] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nota === 0) return;
    setLoading(true);

    const res = await fetch("/api/avaliacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produto_id: produtoId, nota, comentario }),
    });

    if (res.ok) {
      toast({ title: "Avaliação enviada!" });
      setNota(0);
      setComentario("");
      onSuccess();
    } else {
      const err = await res.json();
      toast({ title: "Erro", description: err.error || "Erro ao enviar", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg border space-y-3">
      <p className="text-sm font-medium">Avaliar produto</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setNota(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}>
            <Star className={`h-6 w-6 cursor-pointer transition-colors ${n <= (hover || nota) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>
      <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Seu comentário (opcional)" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      <Button type="submit" size="sm" disabled={loading || nota === 0}>
        {loading ? "Enviando..." : "Enviar Avaliação"}
      </Button>
    </form>
  );
}
