import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { produto_id, nota, comentario } = body;

    if (!produto_id || !nota || nota < 1 || nota > 5) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Faça login para avaliar" }, { status: 401 });
    }

    const { data: cliente } = await supabase
      .from("clientes")
      .select("id, nome")
      .eq("user_id", user.id)
      .single();

    const { error } = await supabase.from("avaliacoes").insert({
      produto_id: Number(produto_id),
      cliente_id: cliente?.id || null,
      nome_cliente: cliente?.nome || user.email || "Anônimo",
      nota,
      comentario: comentario || null,
    });

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro" },
      { status: 500 }
    );
  }
}
