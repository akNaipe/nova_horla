"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type {
  Categoria,
  Produto,
  Cliente,
  Pedido,
  ProdutoMaisVendido,
  StatusPedido,
} from "@/types";

// ========== TIPOS AUXILIARES ==========

type ActionResult<T> = { data: T | null; error: string | null };

type RelatorioVendasResult = {
  total: number;
  quantidade: number;
  pedidos: Array<{ total: number; status: string; created_at: string }>;
};

// ========== CATEGORIAS ==========

export async function listarCategorias(): Promise<ActionResult<Categoria[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nome, slug, descricao, created_at")
    .order("nome");

  if (error) return { data: null, error: error.message };
  return { data: data as Categoria[], error: null };
}

export async function criarCategoria(data: {
  nome: string;
  descricao?: string;
}): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const slug = data.nome
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { error } = await supabase.from("categorias").insert({
    nome: data.nome,
    slug,
    descricao: data.descricao || null,
  });

  if (error) return { data: null, error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/loja");
  return { data: null, error: null };
}

export async function atualizarCategoria(
  id: string,
  data: { nome: string; descricao?: string }
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const slug = data.nome
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { error } = await supabase
    .from("categorias")
    .update({ nome: data.nome, slug, descricao: data.descricao || null })
    .eq("id", id);

  if (error) return { data: null, error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/loja");
  return { data: null, error: null };
}

export async function excluirCategoria(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("categorias").delete().eq("id", id);
  if (error) return { data: null, error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/loja");
  return { data: null, error: null };
}

// ========== PRODUTOS ==========

export async function listarProdutos(params?: {
  categoria?: string;
  busca?: string;
  apenasAtivos?: boolean;
}): Promise<ActionResult<Produto[]>> {
  const supabase = await createClient();
  let query = supabase
    .from("produtos")
    .select(
      "id, nome, slug, descricao, preco_venda, preco_promocional, quantidade_estoque, imagem_url, ativo, destaque, sku, data_cadastro, categoria_id, updated_at, categoria:categorias(id, nome)"
    );

  if (params?.apenasAtivos) {
    query = query.eq("ativo", true);
  }

  if (params?.categoria) {
    query = query.eq("categoria_id", params.categoria);
  }

  if (params?.busca) {
    query = query.ilike("nome", `%${params.busca}%`);
  }

  const { data, error } = await query.order("data_cadastro", {
    ascending: false,
  });

  if (error) return { data: null, error: error.message };
  return { data: (data as unknown as Produto[]) || [], error: null };
}

export async function listarProdutosEmDestaque(): Promise<ActionResult<Produto[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtos")
    .select(
      "id, nome, slug, descricao, preco_venda, preco_promocional, quantidade_estoque, imagem_url, ativo, destaque, sku, data_cadastro, categoria_id, updated_at, categoria:categorias(id, nome)"
    )
    .eq("ativo", true)
    .eq("destaque", true)
    .order("data_cadastro", { ascending: false })
    .limit(8);

  if (error) return { data: null, error: error.message };
  return { data: (data as unknown as Produto[]) || [], error: null };
}

export async function obterProduto(slug: string): Promise<ActionResult<Produto>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtos")
    .select(
      "id, nome, slug, descricao, preco_venda, preco_promocional, quantidade_estoque, imagem_url, ativo, destaque, sku, data_cadastro, categoria_id, updated_at, categoria:categorias(id, nome, slug)"
    )
    .eq("slug", slug)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: (data as unknown as Produto) || null, error: null };
}

export async function criarProduto(data: {
  nome: string;
  descricao?: string | null;
  preco_venda: number;
  preco_promocional?: number | null;
  quantidade_estoque: number;
  categoria_id?: string | null;
  imagem_url?: string | null;
  destaque?: boolean;
}): Promise<ActionResult<null>> {
  const supabase = await createClient();
  let slug = data.nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Verificar se o slug já existe e adicionar sufixo numérico
  const { count } = await supabase
    .from("produtos")
    .select("id", { count: "exact", head: true })
    .ilike("slug", `${slug}%`);

  if (count && count > 0) {
    slug = `${slug}-${count + 1}`;
  }

  const { error } = await supabase.from("produtos").insert({
    nome: data.nome,
    slug,
    descricao: data.descricao || null,
    preco_venda: data.preco_venda,
    preco_custo: data.preco_venda,
    preco_promocional: data.preco_promocional || null,
    quantidade_estoque: data.quantidade_estoque,
    categoria_id: data.categoria_id || null,
    imagem_url: data.imagem_url || null,
    destaque: data.destaque || false,
    ativo: true,
    sku: `SKU-${Date.now()}`,
  });

  if (error) return { data: null, error: error.message };
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  return { data: null, error: null };
}

export async function atualizarProduto(
  id: number,
  data: {
    nome?: string;
    descricao?: string | null;
    preco_venda?: number;
    preco_promocional?: number | null;
    quantidade_estoque?: number;
    categoria_id?: string | null;
    imagem_url?: string | null;
    ativo?: boolean;
    destaque?: boolean;
  }
): Promise<ActionResult<null>> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = { ...data };
  if (data.nome) {
    updateData.slug = data.nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // Remove undefined values to avoid overwriting with null
  for (const key of Object.keys(updateData)) {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  }

  const { error } = await supabase
    .from("produtos")
    .update(updateData)
    .eq("id", id);
  if (error) return { data: null, error: error.message };
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  return { data: null, error: null };
}

export async function duplicarProduto(id: number): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const { data: original } = await supabase.from("produtos").select("*").eq("id", id).single();
  if (!original) return { data: null, error: "Produto não encontrado" };

  const slug = `${original.slug}-copia`;
  const { error } = await supabase.from("produtos").insert({
    nome: `${original.nome} (Cópia)`, slug, descricao: original.descricao,
    preco_venda: original.preco_venda, preco_promocional: original.preco_promocional,
    quantidade_estoque: original.quantidade_estoque, categoria_id: original.categoria_id,
    imagem_url: original.imagem_url, ativo: false, destaque: false,
    sku: `COPIA-${Date.now()}`, preco_custo: original.preco_venda,
  });
  if (error) return { data: null, error: error.message };
  revalidatePath("/admin/produtos");
  return { data: null, error: null };
}

export async function excluirProduto(id: number): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("produtos").delete().eq("id", id);
  if (error) return { data: null, error: error.message };
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  return { data: null, error: null };
}

// ========== PEDIDOS ==========

export async function criarPedido(data: {
  cliente_id: string;
  itens: Array<{
    produto_id: number;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
  }>;
  total: number;
  endereco_entrega: Record<string, unknown>;
  metodo_pagamento: string;
}): Promise<ActionResult<Pick<Pedido, "id" | "total" | "status">>> {
  const supabase = await createClient();

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert({
      cliente_id: data.cliente_id,
      total: data.total,
      endereco_entrega: data.endereco_entrega,
      metodo_pagamento: data.metodo_pagamento,
      status: "pendente",
    })
    .select("id, total, status")
    .single();

  if (error) return { data: null, error: error.message };

  // Inserir itens do pedido
  const itens = data.itens.map((item) => ({
    pedido_id: pedido.id,
    produto_id: item.produto_id,
    quantidade: item.quantidade,
    preco_unitario: item.preco_unitario,
    subtotal: item.subtotal,
  }));

  const { error: errorItens } = await supabase
    .from("itens_pedido")
    .insert(itens);
  if (errorItens) return { data: null, error: errorItens.message };

  // Atualizar estoque via RPC - produto_id é BIGINT no banco, forçar Number()
  for (const item of data.itens) {
    const { error: rpcError } = await supabase.rpc("decrementar_estoque", {
      produto_id: Number(item.produto_id),
      quantidade: item.quantidade,
    });
    if (rpcError) return { data: null, error: rpcError.message };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  return { data: pedido, error: null };
}

export async function listarPedidos(): Promise<ActionResult<Pedido[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "id, cliente_id, status, total, created_at, cliente:clientes(nome), itens:itens_pedido(id, produto_id, quantidade, preco_unitario, subtotal, produto:produtos(id, nome))"
    )
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data as unknown as Pedido[]) || [], error: null };
}

export async function listarMeusPedidos(
  clienteId: string
): Promise<ActionResult<Pedido[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "id, status, total, created_at, itens:itens_pedido(id, produto_id, quantidade, preco_unitario, subtotal, produto:produtos(id, nome))"
    )
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data as unknown as Pedido[]) || [], error: null };
}

export async function obterPedido(id: string): Promise<ActionResult<Pedido>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "id, cliente_id, status, total, endereco_entrega, metodo_pagamento, created_at, updated_at, cliente:clientes(nome, email), itens:itens_pedido(id, produto_id, quantidade, preco_unitario, subtotal, produto:produtos(id, nome))"
    )
    .eq("id", id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: (data as unknown as Pedido) || null, error: null };
}

export async function atualizarStatusPedido(
  id: string,
  status: StatusPedido
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pedidos")
    .update({ status })
    .eq("id", id);

  if (error) return { data: null, error: error.message };
  revalidatePath("/admin/pedidos");
  revalidatePath("/loja");
  return { data: null, error: null };
}

// ========== CLIENTES ==========

export async function listarClientes(): Promise<ActionResult<Cliente[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, user_id, nome, email, telefone, created_at")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as Cliente[], error: null };
}

export async function obterCliente(
  userId: string
): Promise<ActionResult<Cliente>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, user_id, nome, email, telefone, endereco, created_at")
    .eq("user_id", userId)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Cliente, error: null };
}

export async function atualizarCliente(
  id: string,
  data: { nome?: string; telefone?: string; endereco?: Record<string, unknown> }
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("clientes").update(data).eq("id", id);
  if (error) return { data: null, error: error.message };
  revalidatePath("/checkout");
  return { data: null, error: null };
}

// ========== RELATÓRIOS ==========

export async function relatorioVendas(
  periodo: "hoje" | "mes" | "ano"
): Promise<ActionResult<RelatorioVendasResult>> {
  const supabase = await createClient();
  const agora = new Date();
  let inicio: Date;

  switch (periodo) {
    case "hoje":
      inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
      break;
    case "mes":
      inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
      break;
    case "ano":
      inicio = new Date(agora.getFullYear(), 0, 1);
      break;
  }

  const { data, error } = await supabase
    .from("pedidos")
    .select("total, status, created_at")
    .gte("created_at", inicio.toISOString())
    .not("status", "eq", "cancelado");

  if (error) return { data: null, error: error.message };

  const total = data.reduce((acc, p) => acc + Number(p.total), 0);
  return {
    data: { total, quantidade: data.length, pedidos: data },
    error: null,
  };
}

export async function produtosMaisVendidos(): Promise<
  ActionResult<ProdutoMaisVendido[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("itens_pedido")
    .select(
      "produto_id, quantidade, subtotal, produto:produtos(nome), pedido:pedidos!inner(status)"
    )
    .not("pedido.status", "eq", "cancelado");

  if (error) return { data: null, error: error.message };

  const agg: Record<
    string,
    { nome: string; quantidade: number; total: number }
  > = {};
  for (const item of data) {
    const nome = (item.produto as unknown as Array<{ nome: string }>)?.[0]?.nome || "Produto removido";
    const key = String(item.produto_id);
    if (!agg[key]) {
      agg[key] = { nome, quantidade: 0, total: 0 };
    }
    agg[key].quantidade += item.quantidade;
    agg[key].total += Number(item.subtotal);
  }

  return {
    data: Object.values(agg)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10),
    error: null,
  };
}

// ========== CONFIGURAÇÕES ==========

export async function getConfigLoja(): Promise<ActionResult<Record<string, string>>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("config_loja").select("chave, valor");
  if (error) return { data: null, error: error.message };
  const config: Record<string, string> = {};
  for (const item of data || []) config[item.chave] = item.valor;
  return { data: config, error: null };
}

export async function salvarConfigLoja(configs: Record<string, string>): Promise<ActionResult<null>> {
  const adminSupabase = createAdminClient();
  for (const [chave, valor] of Object.entries(configs)) {
    const { data: existing } = await adminSupabase
      .from("config_loja")
      .select("chave")
      .eq("chave", chave)
      .maybeSingle();

    if (existing) {
      const { error } = await adminSupabase
        .from("config_loja")
        .update({ valor })
        .eq("chave", chave);
      if (error) return { data: null, error: error.message };
    } else {
      const { error } = await adminSupabase
        .from("config_loja")
        .insert({ chave, valor });
      if (error) return { data: null, error: error.message };
    }
  }
  revalidatePath("/admin/configuracoes");
  return { data: null, error: null };
}

// ========== CUPONS ==========

export async function listarCupons(): Promise<ActionResult<Array<{
  id: string; codigo: string; tipo: string; valor: number;
  valor_minimo: number; usos_maximos: number; usos_atuais: number;
  ativo: boolean; expira_em: string | null; created_at: string;
}>>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("cupons").select("*").order("created_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data: data as any, error: null };
}

export async function criarCupom(data: {
  codigo: string; tipo: string; valor: number; valor_minimo?: number;
  usos_maximos?: number; expira_em?: string;
}): Promise<ActionResult<null>> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("cupons").insert({
    codigo: data.codigo.toUpperCase(),
    tipo: data.tipo,
    valor: data.valor,
    valor_minimo: data.valor_minimo || 0,
    usos_maximos: data.usos_maximos || 0,
    expira_em: data.expira_em || null,
  });
  if (error) return { data: null, error: error.message };
  revalidatePath("/admin/cupons");
  return { data: null, error: null };
}

export async function alternarCupom(id: string, ativo: boolean): Promise<ActionResult<null>> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("cupons").update({ ativo }).eq("id", id);
  if (error) return { data: null, error: error.message };
  revalidatePath("/admin/cupons");
  return { data: null, error: null };
}

// ========== HISTÓRICO DE PREÇOS ==========

export async function getHistoricoPrecos(produtoId: number): Promise<ActionResult<Array<{
  preco_antigo: number; preco_novo: number; created_at: string;
}>>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("historico_precos")
    .select("preco_antigo, preco_novo, created_at")
    .eq("produto_id", produtoId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return { data: null, error: error.message };
  return { data: data as any, error: null };
}

// ========== NOTA FISCAL ==========

export async function salvarNotaFiscal(pedidoId: string, notaFiscal: string): Promise<ActionResult<null>> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("pedidos").update({ nota_fiscal: notaFiscal }).eq("id", pedidoId);
  if (error) return { data: null, error: error.message };
  revalidatePath("/admin/pedidos");
  return { data: null, error: null };
}

// ========== LIMPEZA ==========

export async function limparCarrinhosAbandonados(): Promise<ActionResult<{ removidos: number }>> {
  const supabase = createAdminClient();
  const seteDias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("pedidos")
    .delete()
    .eq("status", "pendente")
    .lt("created_at", seteDias)
    .select("id");

  if (error) return { data: null, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  return { data: { removidos: data?.length || 0 }, error: null };
}

export async function limparPedidosCancelados(): Promise<ActionResult<{ removidos: number }>> {
  const supabase = createAdminClient();
  const trintaDias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("pedidos")
    .delete()
    .eq("status", "cancelado")
    .lt("created_at", trintaDias)
    .select("id");

  if (error) return { data: null, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  return { data: { removidos: data?.length || 0 }, error: null };
}

export async function limparProdutosInativos(): Promise<ActionResult<{ removidos: number }>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("produtos")
    .delete()
    .eq("ativo", false)
    .select("id");

  if (error) return { data: null, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  return { data: { removidos: data?.length || 0 }, error: null };
}

export async function resetarDadosSistema(): Promise<ActionResult<null>> {
  const supabase = createAdminClient();
  await supabase.from("itens_pedido").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("pedidos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("clientes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  revalidatePath("/admin");
  return { data: null, error: null };
}
