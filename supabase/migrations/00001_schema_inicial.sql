-- Migration: Schema inicial do e-commerce
-- Descrição: Criação de todas as tabelas, índices, RLS e triggers

-- ========== EXTENSIONS ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== TABELAS ==========

-- Categorias
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  preco_promocional DECIMAL(10,2),
  estoque INTEGER NOT NULL DEFAULT 0,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  imagens TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clientes (vinculado ao auth.users)
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  endereco JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente','confirmado','preparando','enviado','entregue','cancelado')),
  total DECIMAL(10,2) NOT NULL,
  endereco_entrega JSONB,
  metodo_pagamento TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Itens do Pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- ========== ÍNDICES ==========
CREATE INDEX IF NOT EXISTS idx_produtos_slug ON produtos(slug);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_created ON pedidos(created_at);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido ON itens_pedido(pedido_id);

-- ========== TRIGGER: atualizar updated_at ==========
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_categorias_updated_at
  BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_produtos_updated_at
  BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ========== TRIGGER: criar cliente automaticamente ==========
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.clientes (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========== FUNCTION: decrementar estoque ==========
CREATE OR REPLACE FUNCTION decrementar_estoque(produto_id UUID, quantidade INT)
RETURNS VOID AS $$
BEGIN
  UPDATE produtos
  SET estoque = GREATEST(estoque - quantidade, 0)
  WHERE id = produto_id;
END;
$$ LANGUAGE plpgsql;

-- ========== ROW LEVEL SECURITY ==========

-- Habilitar RLS em todas as tabelas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;

-- Políticas para CATEGORIAS
CREATE POLICY "Categorias públicas - SELECT"
  ON categorias FOR SELECT
  USING (true);

CREATE POLICY "Categorias admin - INSERT"
  ON categorias FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Categorias admin - UPDATE"
  ON categorias FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Categorias admin - DELETE"
  ON categorias FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Políticas para PRODUTOS
CREATE POLICY "Produtos ativos - SELECT"
  ON produtos FOR SELECT
  USING (ativo = true);

CREATE POLICY "Produtos admin tudo"
  ON produtos FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Políticas para CLIENTES
CREATE POLICY "Clientes próprio - SELECT"
  ON clientes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Clientes admin - tudo"
  ON clientes FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Políticas para PEDIDOS
CREATE POLICY "Pedidos próprio - SELECT"
  ON pedidos FOR SELECT
  USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Pedidos admin - tudo"
  ON pedidos FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Políticas para ITENS_PEDIDO
CREATE POLICY "Itens pedido próprio - SELECT"
  ON itens_pedido FOR SELECT
  USING (
    pedido_id IN (
      SELECT p.id FROM pedidos p
      JOIN clientes c ON c.id = p.cliente_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Itens pedido admin - tudo"
  ON itens_pedido FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );
