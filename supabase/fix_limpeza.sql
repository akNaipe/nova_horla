-- Permitir que admins façam DELETE nas tabelas usando JWT
-- Já deve estar funcionando com as políticas atuais de admin ALL

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND policyname LIKE '%admin%'
AND cmd = 'DELETE';
