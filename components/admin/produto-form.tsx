"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { criarProduto, atualizarProduto } from "@/lib/supabase/actions";
import { createClient } from "@/lib/supabase/client";
import type { Produto, Categoria } from "@/types";

interface ProdutoFormProps {
  categorias: Categoria[];
  produto?: Produto | null;
}

export function ProdutoForm({ categorias, produto }: ProdutoFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const editando = !!produto;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: produto?.nome || "",
    descricao: produto?.descricao || "",
    preco_venda: produto?.preco_venda?.toString() || "",
    preco_promocional: produto?.preco_promocional?.toString() || "",
    quantidade_estoque: produto?.quantidade_estoque?.toString() || "0",
    categoria_id: produto?.categoria_id || "",
    destaque: produto?.destaque || false,
    ativo: produto?.ativo ?? true,
  });
  const [imagemUrl, setImagemUrl] = useState(produto?.imagem_url || "");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("produtos")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("produtos").getPublicUrl(fileName);
      setImagemUrl(urlData.publicUrl);
      toast({ title: "Imagem enviada com sucesso!" });
    } catch (err) {
      toast({
        title: "Erro ao enviar imagem",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      nome: formData.nome,
      descricao: formData.descricao || null,
      preco_venda: parseFloat(formData.preco_venda),
      preco_promocional: formData.preco_promocional ? parseFloat(formData.preco_promocional) : null,
      quantidade_estoque: parseInt(formData.quantidade_estoque),
      categoria_id: formData.categoria_id || null,
      imagem_url: imagemUrl || null,
      destaque: formData.destaque,
    };

    let result;
    if (editando) {
      result = await atualizarProduto(produto!.id, { ...data, ativo: formData.ativo });
    } else {
      result = await criarProduto(data);
    }

    if (result.error) {
      toast({ title: "Erro ao salvar", description: result.error, variant: "destructive" });
    } else {
      toast({ title: editando ? "Produto atualizado!" : "Produto criado!" });
      router.push("/admin/produtos");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto</Label>
                <Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <textarea
                  id="descricao"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco_venda">Preço (R$)</Label>
                  <Input id="preco_venda" type="number" step="0.01" min="0" value={formData.preco_venda} onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco_promocional">Preço Promocional (R$)</Label>
                  <Input id="preco_promocional" type="number" step="0.01" min="0" value={formData.preco_promocional} onChange={(e) => setFormData({ ...formData, preco_promocional: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade_estoque">Estoque</Label>
                  <Input id="quantidade_estoque" type="number" min="0" value={formData.quantidade_estoque} onChange={(e) => setFormData({ ...formData, quantidade_estoque: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <select
                    id="categoria"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                  >
                    <option value="">Sem categoria</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Imagem */}
          <Card>
            <CardHeader>
              <CardTitle>Imagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagemUrl && (
                <div className="aspect-square rounded-md overflow-hidden bg-muted mb-4">
                  <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="imagem">Upload de imagem</Label>
                <Input id="imagem" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                {uploading && <p className="text-xs text-muted-foreground">Enviando...</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Ou URL da imagem</Label>
                <Input id="url" type="url" value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.destaque} onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })} className="rounded" />
                <span className="text-sm">Produto em destaque</span>
              </label>
              {editando && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} className="rounded" />
                  <span className="text-sm">Produto ativo</span>
                </label>
              )}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : editando ? "Atualizar Produto" : "Criar Produto"}
          </Button>
        </div>
      </div>
    </form>
  );
}
