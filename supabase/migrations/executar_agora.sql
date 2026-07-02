-- =============================================
-- MIGRAÇÃO E-COMMERCE NOVA LOJA
-- Adaptada para a estrutura existente
-- =============================================
-- PASSO 1: Verifique se precisa dropar tabelas antigas (opcional)
-- DROP TABLE IF EXISTS caixas, cargo_historico, estoque_movimentacoes, funcionarios, itens_venda, pontos, usuarios, vendas CASCADE;

-- =============================================
-- ADAPTAR PRODUTOS (já existe com id BIGINT)
-- =============================================
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS preco_promocional DECIMAL(10,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT false;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS categoria_id UUID;

-- Atualizar slug para produtos existentes (sem unaccent)
UPDATE produtos SET slug = LOWER(REGEXP_REPLACE(nome, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;

-- Tornar slug NOT NULL após preencher
ALTER TABLE produtos ALTER COLUMN slug SET NOT NULL;
ALTER TABLE produtos ADD CONSTRAINT produtos_slug_unique UNIQUE (slug);

-- =============================================
-- CATEGORIAS
-- =============================================
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- CLIENTES
-- =============================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  endereco JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PEDIDOS
-- =============================================
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

-- =============================================
-- ITENS PEDIDO (produto_id como BIGINT para compatibilidade)
-- =============================================
CREATE TABLE IF NOT EXISTS itens_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id BIGINT REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_produtos_slug ON produtos(slug);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_created ON pedidos(created_at);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido ON itens_pedido(pedido_id);

-- =============================================
-- TRIGGER: ATUALIZAR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_categorias_updated_at ON categorias;
CREATE TRIGGER set_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_produtos_updated_at ON produtos;
CREATE TRIGGER set_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_pedidos_updated_at ON pedidos;
CREATE TRIGGER set_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================
-- TRIGGER: CRIAR CLIENTE AO CADASTRAR
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.clientes (user_id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- FUNCTION: DECREMENTAR ESTOQUE
-- =============================================
CREATE OR REPLACE FUNCTION decrementar_estoque(produto_id BIGINT, quantidade INT)
RETURNS VOID AS $$
BEGIN
  UPDATE produtos SET quantidade_estoque = GREATEST(quantidade_estoque - quantidade, 0) WHERE id = produto_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS DE SEGURANÇA
-- =============================================

-- CATEGORIAS
DROP POLICY IF EXISTS "Categorias public SELECT" ON categorias;
CREATE POLICY "Categorias public SELECT" ON categorias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Categorias admin INSERT" ON categorias;
CREATE POLICY "Categorias admin INSERT" ON categorias FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));

DROP POLICY IF EXISTS "Categorias admin UPDATE" ON categorias;
CREATE POLICY "Categorias admin UPDATE" ON categorias FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));

DROP POLICY IF EXISTS "Categorias admin DELETE" ON categorias;
CREATE POLICY "Categorias admin DELETE" ON categorias FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));

-- PRODUTOS (público vê ativos, admin gerencia)
DROP POLICY IF EXISTS "Produtos ativos SELECT" ON produtos;
CREATE POLICY "Produtos ativos SELECT" ON produtos FOR SELECT USING (ativo = true);

DROP POLICY IF EXISTS "Produtos admin ALL" ON produtos;
CREATE POLICY "Produtos admin ALL" ON produtos FOR ALL USING (auth.role() = 'authenticated' AND auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));

-- CLIENTES
DROP POLICY IF EXISTS "Clientes proprio SELECT" ON clientes;
CREATE POLICY "Clientes proprio SELECT" ON clientes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Clientes admin ALL" ON clientes;
CREATE POLICY "Clientes admin ALL" ON clientes FOR ALL USING (auth.role() = 'authenticated' AND auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));

-- PEDIDOS
DROP POLICY IF EXISTS "Pedidos proprio SELECT" ON pedidos;
CREATE POLICY "Pedidos proprio SELECT" ON pedidos FOR SELECT USING (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Pedidos admin ALL" ON pedidos;
CREATE POLICY "Pedidos admin ALL" ON pedidos FOR ALL USING (auth.role() = 'authenticated' AND auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));

-- ITENS PEDIDO
DROP POLICY IF EXISTS "Itens proprio SELECT" ON itens_pedido;
CREATE POLICY "Itens proprio SELECT" ON itens_pedido FOR SELECT USING (pedido_id IN (SELECT p.id FROM pedidos p JOIN clientes c ON c.id = p.cliente_id WHERE c.user_id = auth.uid()));

DROP POLICY IF EXISTS "Itens admin ALL" ON itens_pedido;
CREATE POLICY "Itens admin ALL" ON itens_pedido FOR ALL USING (auth.role() = 'authenticated' AND auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));
