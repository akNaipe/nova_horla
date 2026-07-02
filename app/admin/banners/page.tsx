import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConfigLoja } from "@/lib/supabase/actions";
import { FormBanners } from "@/components/admin/form-banners";

export default async function BannersPage() {
  const { data: config } = await getConfigLoja();
  let banners: Array<{ imagem: string; link: string; ativo: boolean }> = [];
  try { banners = JSON.parse(config?.banners || "[]"); } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Banners</h1>
        <p className="text-sm text-muted-foreground">Gerencie os banners da página inicial</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">Banners da Home</CardTitle></CardHeader>
        <CardContent>
          <FormBanners banners={banners} />
        </CardContent>
      </Card>
    </div>
  );
}
