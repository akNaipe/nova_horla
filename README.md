# 🛒 Nova Loja - E-commerce com Next.js + Supabase

Sistema de gerenciamento de loja virtual (e-commerce) completo.

## 🚀 Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth (email/senha)
- **Storage**: Supabase Storage (imagens)
- **Gráficos**: Recharts

## 📋 Funcionalidades

### Público
- Vitrine com produtos em destaque
- Listagem de produtos com busca, filtro por categoria e ordenação
- Detalhe do produto com imagens e preço
- Carrinho de compras (localStorage)
- Checkout com endereço de entrega
- Acompanhamento de pedidos

### Admin
- Dashboard com resumo de vendas
- CRUD de produtos com upload de imagens
- CRUD de categorias
- Gerenciamento de pedidos (atualizar status)
- Lista de clientes
- Relatórios com gráfico de vendas e produtos mais vendidos

## 🏗️ Estrutura

```
├── app/
│   ├── page.tsx           # Home
│   ├── loja/              # Páginas públicas
│   ├── carrinho/          # Carrinho
│   ├── checkout/          # Checkout
│   ├── pedidos/           # Acompanhamento
│   ├── auth/              # Login/Cadastro
│   ├── admin/             # Painel admin
│   └── api/               # API Routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, Footer
│   ├── produtos/          # Cards, carrinho actions
│   └── admin/             # Admin components
├── lib/
│   └── supabase/          # Client, Server, Admin, Actions
├── types/                 # TypeScript types
└── supabase/
    └── migrations/        # SQL migrations
```

## 🔧 Configuração

### 1. Clone e instale dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

### 3. Execute as migrations

No SQL Editor do Supabase, execute o conteúdo de `supabase/migrations/00001_schema_inicial.sql`

### 4. Crie um usuário admin

No SQL Editor:

```sql
-- Primeiro, crie o usuário via Auth UI ou API
-- Depois, torne-o admin:
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'
WHERE email = 'admin@email.com';
```

### 5. Crie um bucket de storage

No Supabase Storage, crie um bucket público chamado `produtos`.

### 6. Execute

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🧪 Testando

1. Crie uma conta de usuário normal para fazer compras
2. Crie um admin (via SQL) para acessar `/admin`
3. Adicione categorias e produtos no admin
4. Faça compras na loja e acompanhe os pedidos
