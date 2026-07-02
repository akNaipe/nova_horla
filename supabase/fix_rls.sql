-- ================================================================
-- FIX RLS POLICIES
-- ================================================================
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- or via: psql -f supabase/fix_rls.sql
-- ================================================================

BEGIN;

-- ================================================================
-- 1. ENABLE ROW LEVEL SECURITY on tables that need it
-- ================================================================
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 2. DROP ALL EXISTING POLICIES (categorias, produtos, clientes, pedidos, itens_pedido)
-- ================================================================

-- categorias
DROP POLICY IF EXISTS "Categorias public SELECT" ON public.categorias;
DROP POLICY IF EXISTS "Categorias admin DELETE"   ON public.categorias;
DROP POLICY IF EXISTS "Categorias admin INSERT"   ON public.categorias;
DROP POLICY IF EXISTS "Categorias admin UPDATE"   ON public.categorias;

-- produtos
DROP POLICY IF EXISTS "Produtos admin ALL"      ON public.produtos;
DROP POLICY IF EXISTS "Produtos ativos SELECT"  ON public.produtos;

-- clientes
DROP POLICY IF EXISTS "Clientes admin ALL"     ON public.clientes;
DROP POLICY IF EXISTS "Clientes proprio SELECT" ON public.clientes;

-- pedidos
DROP POLICY IF EXISTS "Pedidos admin ALL"     ON public.pedidos;
DROP POLICY IF EXISTS "Pedidos proprio SELECT" ON public.pedidos;

-- itens_pedido
DROP POLICY IF EXISTS "Itens admin ALL"     ON public.itens_pedido;
DROP POLICY IF EXISTS "Itens proprio SELECT" ON public.itens_pedido;

-- ================================================================
-- 3. CREATE NEW POLICIES
-- ================================================================

-- -------------------------------------------------------
-- CATEGORIAS
--   - public SELECT (anyone can browse)
--   - authenticated SELECT (logged-in users can also see)
--   - admin ALL (full CRUD)
-- -------------------------------------------------------
CREATE POLICY "categorias_public_select" ON public.categorias
  FOR SELECT
  USING (true);

CREATE POLICY "categorias_auth_select" ON public.categorias
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "categorias_admin_all" ON public.categorias
  FOR ALL
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean,
      false
    ) = true
  );

-- -------------------------------------------------------
-- PRODUTOS
--   - public SELECT only active products
--   - admin ALL (full CRUD – sees all, including inactive)
-- -------------------------------------------------------
CREATE POLICY "produtos_public_select" ON public.produtos
  FOR SELECT
  USING (ativo = true);

CREATE POLICY "produtos_admin_all" ON public.produtos
  FOR ALL
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean,
      false
    ) = true
  );

-- -------------------------------------------------------
-- CLIENTES
--   - SELECT own record (auth.uid() = user_id)
--   - admin ALL (full CRUD)
-- -------------------------------------------------------
CREATE POLICY "clientes_select_own" ON public.clientes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "clientes_admin_all" ON public.clientes
  FOR ALL
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean,
      false
    ) = true
  );

-- -------------------------------------------------------
-- PEDIDOS
--   - SELECT own (via clientes join)
--   - INSERT own (place a new order)
--   - UPDATE own (e.g. cancel/update order)
--   - admin ALL (full CRUD)
-- -------------------------------------------------------
CREATE POLICY "pedidos_select_own" ON public.pedidos
  FOR SELECT
  USING (
    cliente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
  );

CREATE POLICY "pedidos_insert_own" ON public.pedidos
  FOR INSERT
  WITH CHECK (
    cliente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
  );

CREATE POLICY "pedidos_update_own" ON public.pedidos
  FOR UPDATE
  USING (
    cliente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
  )
  WITH CHECK (
    cliente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
  );

CREATE POLICY "pedidos_admin_all" ON public.pedidos
  FOR ALL
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean,
      false
    ) = true
  );

-- -------------------------------------------------------
-- ITENS_PEDIDO
--   - SELECT own (via pedidos -> clientes -> user_id)
--   - INSERT own (add items while placing order)
--   - admin ALL (full CRUD)
-- -------------------------------------------------------
CREATE POLICY "itens_pedido_select_own" ON public.itens_pedido
  FOR SELECT
  USING (
    pedido_id IN (
      SELECT p.id FROM public.pedidos p
      JOIN public.clientes c ON c.id = p.cliente_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "itens_pedido_insert_own" ON public.itens_pedido
  FOR INSERT
  WITH CHECK (
    pedido_id IN (
      SELECT p.id FROM public.pedidos p
      JOIN public.clientes c ON c.id = p.cliente_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "itens_pedido_admin_all" ON public.itens_pedido
  FOR ALL
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean,
      false
    ) = true
  );

COMMIT;
