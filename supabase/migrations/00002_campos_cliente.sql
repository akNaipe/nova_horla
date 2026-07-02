-- Adicionar campos de CPF na tabela clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Atualizar trigger para salvar telefone e cpf
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.clientes (user_id, nome, email, telefone, cpf)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'telefone',
    NEW.raw_user_meta_data->>'cpf'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nome = EXCLUDED.nome,
    telefone = EXCLUDED.telefone,
    cpf = EXCLUDED.cpf;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
