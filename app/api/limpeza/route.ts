import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    const supabase = createAdminClient();

    let result;

    switch (action) {
      case "carrinhos": {
        const seteDias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from("pedidos")
          .delete()
          .eq("status", "pendente")
          .lt("created_at", seteDias)
          .select("id");
        if (error) throw error;
        result = data?.length || 0;
        break;
      }
      case "cancelados": {
        const trintaDias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from("pedidos")
          .delete()
          .eq("status", "cancelado")
          .lt("created_at", trintaDias)
          .select("id");
        if (error) throw error;
        result = data?.length || 0;
        break;
      }
      case "inativos": {
        const { data, error } = await supabase
          .from("produtos")
          .delete()
          .eq("ativo", false)
          .select("id");
        if (error) throw error;
        result = data?.length || 0;
        break;
      }
      case "reset": {
        await supabase.from("itens_pedido").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("pedidos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("clientes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        result = "ok";
        break;
      }
      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    return NextResponse.json({ success: true, removidos: result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro" },
      { status: 500 }
    );
  }
}
