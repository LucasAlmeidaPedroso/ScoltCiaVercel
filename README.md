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
```

Sem Supabase configurado, o projeto usa dados demo para visualizacao.

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

4. Adicione as variaveis de ambiente do Supabase.
5. Deploy.

## Admin

Acesse:

```txt
/admin
```

Usuario inicial criado pelo SQL:

```txt
lucasalmeidapedroso@gmail.com
!Levi@2023
```

Depois do primeiro acesso, use o painel para cadastrar outros usuarios da equipe.

## Login com Google

Para habilitar o botao **Entrar com Google**:

1. No Supabase, abra **Authentication > Providers**.
2. Ative o provider **Google**.
3. Configure o Client ID e Client Secret criados no Google Cloud.
4. Em **Authentication > URL Configuration**, adicione as URLs de redirect:

```txt
http://localhost:3000/admin
https://seu-dominio-vercel.vercel.app/admin
```

O Google so libera o painel se o e-mail autenticado tambem existir em `app_users` com role `admin`.
