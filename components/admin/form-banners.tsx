"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { salvarConfigLoja } from "@/lib/supabase/actions";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";

interface Banner {
  imagem: string;
  link: string;
  ativo: boolean;
}

export function FormBanners({ banners: initial }: { banners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(
    initial.length ? initial : [{ imagem: "", link: "", ativo: true }]
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const addBanner = () => setBanners([...banners, { imagem: "", link: "", ativo: true }]);

  const removeBanner = (i: number) => {
    if (banners.length <= 1) return;
    setBanners(banners.filter((_, idx) => idx !== i));
  };

  const updateBanner = (i: number, field: keyof Banner, value: string | boolean) => {
    const novo = [...banners];
    novo[i] = { ...novo[i], [field]: value };
    setBanners(novo);
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await salvarConfigLoja({ banners: JSON.stringify(banners) });
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      toast({ title: "Banners salvos!" });
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {banners.map((banner, i) => (
        <div key={i} className="p-4 rounded-lg border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Banner #{i + 1}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeBanner(i)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">URL da Imagem</Label>
            <Input value={banner.imagem} onChange={(e) => updateBanner(i, "imagem", e.target.value)}
              placeholder="https://..." className="h-9 text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Link do Banner</Label>
            <Input value={banner.link} onChange={(e) => updateBanner(i, "link", e.target.value)}
              placeholder="/loja ou https://" className="h-9 text-sm" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={banner.ativo}
              onChange={(e) => updateBanner(i, "ativo", e.target.checked)} className="rounded" />
            <span className="text-xs">Ativo</span>
          </label>
        </div>
      ))}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addBanner} className="gap-1">
          <Plus className="h-4 w-4" /> Adicionar Banner
        </Button>
        <Button size="sm" onClick={handleSave} disabled={loading} className="gap-1">
          <Save className="h-4 w-4" /> {loading ? "Salvando..." : "Salvar Banners"}
        </Button>
      </div>
    </div>
  );
}
