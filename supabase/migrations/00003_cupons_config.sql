-- Cupons de desconto
CREATE TABLE IF NOT EXISTS cupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('percentual', 'fixo')),
  valor DECIMAL(10,2) NOT NULL,
  valor_minimo DECIMAL(10,2) DEFAULT 0,
  usos_maximos INTEGER DEFAULT 0,
  usos_atuais INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  expira_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Configurações da loja
CREATE TABLE IF NOT EXISTS config_loja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO config_loja (chave, valor) VALUES
  ('nome_loja', 'Nova Loja'),
  ('descricao', 'Sua loja virtual de confiança'),
  ('email_contato', 'contato@novaloja.com.br'),
  ('telefone', '(11) 99999-9999'),
  ('frete_gratis_valor', '99'),
  ('taxa_frete', '15'),
  ('redes_instagram', ''),
  ('redes_facebook', ''),
  ('banners', '[]')
ON CONFLICT (chave) DO NOTHING;

-- RLS
ALTER TABLE cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_loja ENABLE ROW LEVEL SECURITY;

-- Políticas: público vê cupons ativos, admin vê tudo
DROP POLICY IF EXISTS "cupons_public_select" ON cupons;
CREATE POLICY "cupons_public_select" ON cupons FOR SELECT
  USING (ativo = true AND (expira_em IS NULL OR expira_em > now()));

DROP POLICY IF EXISTS "cupons_admin_all" ON cupons;
CREATE POLICY "cupons_admin_all" ON cupons FOR ALL
  USING (COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true);

DROP POLICY IF EXISTS "config_admin_all" ON config_loja;
CREATE POLICY "config_admin_all" ON config_loja FOR ALL
  USING (COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true);
