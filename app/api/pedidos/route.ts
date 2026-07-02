import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cliente_id, itens, total, endereco_entrega, metodo_pagamento } = body;

    if (!cliente_id || !itens || !total) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Criar pedido
    const { data: pedido, error: errorPedido } = await supabase
      .from("pedidos")
      .insert({
        cliente_id,
        total,
        endereco_entrega,
        metodo_pagamento: metodo_pagamento || "simulado",
        status: "pendente",
      })
      .select()
      .single();

    if (errorPedido) {
      return NextResponse.json({ error: errorPedido.message }, { status: 500 });
    }

    // Inserir itens
    const itensPedido = itens.map(
      (item: {
        produto_id: number;
        quantidade: number;
        preco_unitario: number;
        subtotal: number;
      }) => ({
        pedido_id: pedido.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.subtotal,
      })
    );

    const { error: errorItens } = await supabase
      .from("itens_pedido")
      .insert(itensPedido);

    if (errorItens) {
      // Rollback: remover pedido se itens falharem
      await supabase.from("pedidos").delete().eq("id", pedido.id);
      return NextResponse.json({ error: errorItens.message }, { status: 500 });
    }

    // Atualizar estoque
    for (const item of itens) {
      await supabase.rpc("decrementar_estoque", {
        produto_id: item.produto_id,
        quantidade: item.quantidade,
      });
    }

    return NextResponse.json(pedido, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
