// Database types para o e-commerce
// Adaptado para estrutura existente do banco

export interface Categoria {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  created_at: string;
  updated_at: string;
}

export interface Produto {
  id: number; // BIGINT no banco
  nome: string;
  slug: string;
  descricao: string | null;
  preco_venda: number;
  preco_promocional: number | null;
  quantidade_estoque: number;
  categoria_id: string | null;
  imagem_url: string | null;
  ativo: boolean;
  destaque: boolean;
  sku: string;
  data_cadastro: string;
  updated_at: string | null;
  // Joins
  categoria?: Categoria | null;
}

export interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone: string | null;
  endereco: Endereco | null;
  created_at: string;
}

export interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  status: StatusPedido;
  total: number;
  endereco_entrega: Endereco | null;
  metodo_pagamento: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  cliente?: Cliente | null;
  itens?: ItemPedido[];
}

export type StatusPedido =
  | "pendente"
  | "confirmado"
  | "preparando"
  | "enviado"
  | "entregue"
  | "cancelado";

export interface ItemPedido {
  id: string;
  pedido_id: string;
  produto_id: number; // BIGINT (referencia produtos.id)
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  // Join
  produto?: Produto | null;
}

export interface CarrinhoItem {
  produto_id: number;
  nome: string;
  slug?: string;
  preco: number;
  imagem: string;
  quantidade: number;
}

export interface RelatorioVendas {
  data: string;
  total: number;
  quantidade: number;
}

export interface ProdutoMaisVendido {
  nome: string;
  quantidade: number;
  total: number;
}

export interface Avaliacao {
  id: string;
  produto_id: number;
  cliente_id: string | null;
  nome_cliente: string;
  nota: number;
  comentario: string | null;
  created_at: string;
}

export interface Variacao {
  id: string;
  produto_id: number;
  tipo: string;
  valor: string;
  preco_adicional: number;
  estoque: number;
}
