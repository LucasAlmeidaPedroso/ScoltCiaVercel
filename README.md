# Scolt&Cia - Vercel + Supabase

Projeto convertido para Next.js, pronto para deploy na Vercel.

## Rodar local

```powershell
npm install
npm run dev
```

Abra:

```txt
http://localhost:3000
```

## Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Rode o arquivo `supabase/schema.sql`.
4. Copie as chaves em **Project Settings > API**.
5. Configure no Vercel:

```txt
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_SESSION_SECRET=...
TUTOR_SESSION_SECRET=...
```

Sem Supabase configurado, o projeto usa dados demo apenas em desenvolvimento local.

## Deploy na Vercel

1. Suba este diretorio para o GitHub.
2. Na Vercel, importe o repositorio.
3. Se o repositorio tambem tiver a pasta ASP.NET, configure:

```txt
Root Directory: ScoltCiaVercel
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
```

4. Adicione as variaveis de ambiente do Supabase e os secrets de sessao.
5. Deploy.

## Criar primeiro admin

Depois de rodar o SQL do Supabase e configurar as variaveis localmente, crie o primeiro usuario admin sem gravar senha no repositorio:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="..."
$env:SUPABASE_SERVICE_ROLE_KEY="..."
$env:ADMIN_NAME="Seu Nome"
$env:ADMIN_EMAIL="seu@email.com"
$env:ADMIN_PASSWORD="senha-forte-temporaria"
npm run create-admin
```

## Admin

Acesse:

```txt
/admin
```

Depois do primeiro acesso, use o painel para cadastrar outros usuarios da equipe e trocar senhas temporarias.

## Login com Google

O codigo do login com Google ja esta preparado, mas o botao esta desativado no componente `AdminPanel`.

Para reativar, altere:

```ts
const googleLoginEnabled = true;
```

Depois configure no Supabase:

1. No Supabase, abra **Authentication > Providers**.
2. Ative o provider **Google**.
3. Configure o Client ID e Client Secret criados no Google Cloud.
4. Em **Authentication > URL Configuration**, adicione as URLs de redirect:

```txt
http://localhost:3000/admin
https://seu-dominio-vercel.vercel.app/admin
```

O Google so libera o painel se o e-mail autenticado tambem existir em `app_users` com role `admin`.
