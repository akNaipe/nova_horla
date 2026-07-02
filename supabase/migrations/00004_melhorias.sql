-- Avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id BIGINT REFERENCES produtos(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  nome_cliente TEXT NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Variações de produto
CREATE TABLE IF NOT EXISTS variacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id BIGINT REFERENCES produtos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  valor TEXT NOT NULL,
  preco_adicional DECIMAL(10,2) DEFAULT 0,
  estoque INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Histórico de preços
CREATE TABLE IF NOT EXISTS historico_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id BIGINT REFERENCES produtos(id) ON DELETE CASCADE,
  preco_antigo DECIMAL(10,2) NOT NULL,
  preco_novo DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nota fiscal nos pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS nota_fiscal TEXT;

-- Trigger para histórico de preços
CREATE OR REPLACE FUNCTION trigger_historico_preco()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.preco_venda IS DISTINCT FROM NEW.preco_venda THEN
    INSERT INTO historico_precos (produto_id, preco_antigo, preco_novo)
    VALUES (NEW.id, OLD.preco_venda, NEW.preco_venda);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS historico_preco_trigger ON produtos;
CREATE TRIGGER historico_preco_trigger
  AFTER UPDATE ON produtos
  FOR EACH ROW
  WHEN (OLD.preco_venda IS DISTINCT FROM NEW.preco_venda)
  EXECUTE FUNCTION trigger_historico_preco();

-- RLS
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE variacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_precos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "avaliacoes_public_select" ON avaliacoes;
CREATE POLICY "avaliacoes_public_select" ON avaliacoes FOR SELECT USING (true);

DROP POLICY IF EXISTS "avaliacoes_insert" ON avaliacoes;
CREATE POLICY "avaliacoes_insert" ON avaliacoes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "variacoes_public_select" ON variacoes;
CREATE POLICY "variacoes_public_select" ON variacoes FOR SELECT USING (true);

DROP POLICY IF EXISTS "variacoes_admin_all" ON variacoes;
CREATE POLICY "variacoes_admin_all" ON variacoes FOR ALL USING (
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
);

DROP POLICY IF EXISTS "historico_admin_all" ON historico_precos;
CREATE POLICY "historico_admin_all" ON historico_precos FOR ALL USING (
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
);
