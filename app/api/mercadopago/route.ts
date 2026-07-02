import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, cliente_id, endereco_entrega } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    const preference: Record<string, unknown> = {
      items: items.map((item: { title: string; quantity: number; price: number }) => ({
        title: item.title,
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
        currency_id: "BRL",
      })),
      payer: {
        email: body.email || "comprador@email.com",
      },
      back_urls: {
        success: "http://localhost:3000/pedidos",
        failure: "http://localhost:3000/carrinho",
        pending: "http://localhost:3000/checkout",
      },
      external_reference: cliente_id,
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("MP error:", data);
      return NextResponse.json(
        { error: data.message || "Erro no Mercado Pago" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
