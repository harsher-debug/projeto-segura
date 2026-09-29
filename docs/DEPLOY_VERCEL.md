# Deploy na Vercel

O projeto está preparado para a Vercel com Nitro no preset `vercel`.

## Configuração do projeto

No painel da Vercel:

| Campo | Valor |
|---|---|
| Framework Preset | Other |
| Install Command | `npm ci` |
| Build Command | `npm run build` |

O arquivo `vercel.json` já define esses comandos.

## Variáveis de ambiente

Configure na Vercel:

```bash
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
BXP_API_BASE_URL=
```

Também funciona com os nomes que o painel do Supabase sugere para Next.js:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
BXP_API_BASE_URL=
```

Opcional, apenas para scripts administrativos fora do frontend público:

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

## Build local

```bash
npm ci
npm run build
```

## Observação sobre cliente-online

A pasta `cliente-online` registra acessos localmente durante o desenvolvimento.
Em ambiente serverless da Vercel, arquivos gravados em disco não são persistentes
entre execuções. Para produção, salve esses registros em banco, por exemplo no
Supabase.
