# Segura Next V2 — Imobiliária Segura

Plataforma completa: site institucional, CRM, Dashboard Administrativo, Portal do Proprietário e Portal do Locatário.

## Stack

- React 19 + TanStack Start (SSR) + TanStack Router
- Tailwind CSS v4
- Supabase (banco de dados + autenticação)
- Recharts (gráficos do dashboard)

---

## 1. Pré-requisitos

- [Node.js](https://nodejs.org) versão 20 ou superior
- Uma conta no [Supabase](https://supabase.com) com um projeto criado

---

## 2. Instalação

```bash
npm install
```

---

## 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com os dados do seu projeto Supabase
(em **Project Settings → API**):

```bash
cp .env.example .env
```

Edite o `.env`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_PUBLISHABLE_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

A `SERVICE_ROLE_KEY` só é usada pelo script de importação de imóveis — **nunca
a coloque no frontend nem suba para repositórios públicos**.

---

## 4. Rodar o projeto localmente

```bash
npm run dev
```

Acesse **http://localhost:3000**

---

## 5. Importar os 574 imóveis do site antigo

1. No SQL Editor do Supabase, garanta que a coluna `referencia` é única:
   ```sql
   alter table public.imoveis
     add constraint imoveis_referencia_key unique (referencia);
   ```
   (seguro rodar mesmo se já existir — vai dar erro silencioso que pode ignorar)

2. Rode o script de importação:
   ```bash
   node import-imoveis.mjs
   ```

Isso importa todos os imóveis do `segura-imoveis.json` para o banco.

---

## 6. Virar Administrador

1. Acesse `/entrar` no site e crie sua conta (qualquer perfil serve)
2. No SQL Editor do Supabase, abra `promover-admin.sql`, troque o e-mail
   pelo que você cadastrou, e rode o script
3. Faça logout e login novamente — agora você tem acesso total ao
   `/app/dashboard`, CRM, e a ambos os portais

---

## 7. Estrutura de rotas

| Rota | Descrição |
|---|---|
| `/` | Home institucional |
| `/alugar`, `/comprar` | Listagens com filtros |
| `/imoveis/recentes` | Imóveis adicionados nos últimos 30 dias |
| `/imovel/$id` | Detalhe do imóvel |
| `/entrar` | Login / cadastro (seleção de perfil) |
| `/app/dashboard` | Painel administrativo (admin/corretor) |
| `/app/leads`, `/app/imoveis` etc. | CRM |
| `/portal/proprietario` | Portal do Proprietário |
| `/portal/locatario` | Portal do Locatário |

---

## 8. Deploy em produção

Recomendado: subir o código para o GitHub e conectar com **Vercel** ou
**Netlify**, configurando as mesmas variáveis de ambiente do `.env` no
painel deles.

```bash
npm run build
```

gera o build de produção em `.output/`.

---

## 9. Scripts úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Roda em desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Pré-visualiza o build de produção |
| `node import-imoveis.mjs` | Importa os imóveis do JSON para o Supabase |
