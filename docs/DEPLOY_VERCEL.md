# Deploy na Vercel

O projeto esta preparado para a Vercel com Nitro no preset `vercel`.

## Configuracao do projeto

No painel da Vercel:

| Campo | Valor |
|---|---|
| Framework Preset | Other |
| Install Command | `npm ci` |
| Build Command | `npm run build` |

O arquivo `vercel.json` ja define esses comandos.

## Variaveis de ambiente

Configure na Vercel:

```bash
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
BXP_API_BASE_URL=
```

Tambem funciona com os nomes que o painel do Supabase sugere para Next.js:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
BXP_API_BASE_URL=
```

Opcional, apenas para scripts administrativos fora do frontend publico:

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

## Build local

```bash
npm ci
npm run build
```

## Observacao sobre cliente-online

A pasta `cliente-online` registra acessos localmente durante o desenvolvimento.
Em ambiente serverless da Vercel, arquivos gravados em disco nao sao persistentes
entre execucoes. Para producao, salve esses registros em banco, por exemplo no
Supabase.
