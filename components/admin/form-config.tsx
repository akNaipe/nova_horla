"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { salvarConfigLoja } from "@/lib/supabase/actions";
import { Save } from "lucide-react";

interface FormConfigProps {
  config: Record<string, string>;
}

export function FormConfig({ config }: FormConfigProps) {
  const [form, setForm] = useState({
    nome_loja: config.nome_loja || "",
    descricao: config.descricao || "",
    email_contato: config.email_contato || "",
    telefone: config.telefone || "",
    frete_gratis_valor: config.frete_gratis_valor || "99",
    taxa_frete: config.taxa_frete || "15",
    redes_instagram: config.redes_instagram || "",
    redes_facebook: config.redes_facebook || "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    const { error } = await salvarConfigLoja(form);
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      toast({ title: "Configurações salvas!" });
      router.refresh();
    }
    setLoading(false);
  };

  const fields = [
    { key: "nome_loja", label: "Nome da Loja", type: "text" },
    { key: "descricao", label: "Descrição", type: "text" },
    { key: "email_contato", label: "Email de Contato", type: "email" },
    { key: "telefone", label: "Telefone", type: "text" },
  ];

  const fretes = [
    { key: "frete_gratis_valor", label: "Frete Grátis Acima de (R$)", type: "number" },
    { key: "taxa_frete", label: "Taxa de Frete Padrão (R$)", type: "number" },
  ];

  const redes = [
    { key: "redes_instagram", label: "Instagram (URL)", type: "url" },
    { key: "redes_facebook", label: "Facebook (URL)", type: "url" },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader><CardTitle className="text-sm">Informações da Loja</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key} className="text-xs">{f.label}</Label>
              <Input id={f.key} type={f.type} value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="h-9 text-sm" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Frete</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {fretes.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key} className="text-xs">{f.label}</Label>
              <Input id={f.key} type={f.type} value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="h-9 text-sm" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Redes Sociais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {redes.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key} className="text-xs">{f.label}</Label>
              <Input id={f.key} type={f.type} value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="h-9 text-sm" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="gap-2">
        <Save className="h-4 w-4" /> {loading ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  );
}
