import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ codigo: string }> }
) {
  const { codigo } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cupons")
    .select("codigo, tipo, valor, valor_minimo, usos_maximos, usos_atuais, expira_em, ativo")
    .eq("codigo", codigo.toUpperCase())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
  }

  if (!data.ativo) {
    return NextResponse.json({ error: "Cupom inativo" }, { status: 400 });
  }

  if (data.expira_em && new Date(data.expira_em) < new Date()) {
    return NextResponse.json({ error: "Cupom expirado" }, { status: 400 });
  }

  if (data.usos_maximos > 0 && data.usos_atuais >= data.usos_maximos) {
    return NextResponse.json({ error: "Cupom esgotado" }, { status: 400 });
  }

  return NextResponse.json({
    codigo: data.codigo,
    tipo: data.tipo,
    valor: Number(data.valor),
  });
}
