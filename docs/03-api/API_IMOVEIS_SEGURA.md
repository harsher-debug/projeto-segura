# API de Imóveis — Imobiliária Segura

Documentação da API pública de catálogo de imóveis da Imobiliária Segura, fornecida pela plataforma BXP.

---

## Visão geral

A API fornece o catálogo completo de imóveis da Segura, separado por tipo de negociação:

| Negociação | Fonte | Qtd. atual | Fotos |
|---|---|---|---|
| `venda` | Sistema Vista | ~1.079 imóveis | ✅ CDN direto |
| `locacao` | Sistema Imobiliar | ~550 imóveis | ⏳ Em breve |

Não é necessária autenticação. Os endpoints são públicos e só retornam imóveis marcados como aptos para exibição no site.

---

## Base URL

```
http://<IP-EXTERNO>:8010/api/v1/publico/imobiliaria/cli_segura
```

> Substituir `<IP-EXTERNO>` pelo IP externo fornecido pela Segura.
> A API é acessível por IP de origem autorizado (filtro de NAT configurado pelo cliente).

---

## Documentação interativa (Swagger)

Acesse a interface Swagger diretamente no browser — sem instalar nada, com botão **"Try it out"** para testar cada endpoint:

```
http://<IP-EXTERNO>:8010/docs
```

Ou a versão ReDoc (só leitura, layout mais limpo):

```
http://<IP-EXTERNO>:8010/redoc
```

> **Dica:** No Swagger, usar o filtro de tag **`integracoes-publicas`** para ver apenas os endpoints públicos do catálogo. Os demais requerem autenticação e não são relevantes para o site.

---

## Endpoints

### 1. Listar imóveis

```
GET /imoveis
```

#### Parâmetros de query

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `negociacao` | `venda` \| `locacao` | Não | Filtra por tipo de negociação. Sem filtro retorna todos. |
| `cidade` | string | Não | Filtra por cidade (comparação exata). |
| `bairro` | string | Não | Filtra por bairro (comparação exata). |
| `busca` | string | Não | Busca livre em título, bairro e cidade (case-insensitive). |
| `pagina` | integer | Não | Número da página (default: `1`). |
| `por_pagina` | integer | Não | Itens por página (default: `20`, max recomendado: `50`). |

#### Exemplos de request

```bash
# Todos os imóveis de venda (paginado)
GET /imoveis?negociacao=venda&pagina=1&por_pagina=24

# Imóveis de locação em Canoas
GET /imoveis?negociacao=locacao&cidade=Canoas

# Busca livre
GET /imoveis?negociacao=venda&busca=apartamento+centro

# Todos os imóveis (venda + locação juntos)
GET /imoveis?pagina=1&por_pagina=20
```

#### Resposta

```json
{
  "pagina": 1,
  "por_pagina": 24,
  "total": 1079,
  "total_paginas": 45,
  "itens": [
    {
      "codigo": "8144",
      "negociacao": "venda",
      "tipo_imovel": "Apartamento",
      "titulo": "Apartamento duplex na Nossa Senhora das Graças em Canoas",
      "subtitulo": null,
      "descricao": "Excelente localização, próximo ao comércio...",
      "cidade": "Canoas",
      "bairro": "Nossa Senhora das Graças",
      "estado": null,
      "localidade": null,
      "valor": 1400000.00,
      "valor_texto": "R$ 1.400.000,00",
      "valor_iptu": null,
      "valor_condominio": null,
      "dormitorios": 3,
      "suites": 1,
      "banheiros": null,
      "vagas": 2,
      "area_util": 245.00,
      "area_total": null,
      "imagem_principal": "https://cdn.vistahost.com.br/segura17/vista.imobi/fotos/8144/thumb.jpg",
      "modelo_integracao": "vista"
    }
  ]
}
```

---

### 2. Detalhe de um imóvel

```
GET /imoveis/{codigo}
```

#### Parâmetros de query

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `negociacao` | `venda` \| `locacao` | Não | Necessário quando o mesmo código existe nos dois sistemas. |

#### Exemplo de request

```bash
GET /imoveis/8144?negociacao=venda
```

#### Resposta

Mesmo schema de um item da listagem (objeto único, não array).

---

## Schema completo de um imóvel

| Campo | Tipo | Descrição |
|---|---|---|
| `codigo` | string | Código único do imóvel no sistema de origem. |
| `negociacao` | `"venda"` \| `"locacao"` | Tipo de negociação. |
| `tipo_imovel` | string \| null | Ex: `"Apartamento"`, `"Casa"`, `"Terreno"`, `"Loja"`. |
| `titulo` | string \| null | Título descritivo para exibição no site. |
| `subtitulo` | string \| null | Subtítulo complementar (raramente preenchido). |
| `descricao` | string \| null | Texto completo do imóvel. |
| `cidade` | string \| null | Cidade. Ex: `"Canoas"`, `"Porto Alegre"`. |
| `bairro` | string \| null | Bairro. |
| `estado` | string \| null | Estado (nem sempre preenchido). |
| `valor` | number \| null | Valor numérico em reais. |
| `valor_texto` | string \| null | Valor formatado. Ex: `"R$ 1.400.000,00"`. |
| `valor_iptu` | number \| null | Valor do IPTU anual. |
| `valor_condominio` | number \| null | Valor mensal do condomínio. |
| `dormitorios` | integer \| null | Quantidade de dormitórios. |
| `suites` | integer \| null | Quantidade de suítes. |
| `banheiros` | integer \| null | Quantidade de banheiros. |
| `vagas` | integer \| null | Vagas de garagem. |
| `area_util` | number \| null | Área útil/privativa em m². |
| `area_total` | number \| null | Área total em m². |
| `imagem_principal` | string \| null | URL da foto de destaque (ver seção Fotos). |
| `modelo_integracao` | string \| null | Sistema de origem: `"vista"` ou `"imobiliar"`. |

---

## Fotos

### Imóveis de venda (`modelo_integracao: "vista"`)

O campo `imagem_principal` retorna uma URL direta do CDN da Vista:

```
https://cdn.vistahost.com.br/segura17/vista.imobi/fotos/{codigo}/arquivo.jpg
```

Use diretamente em `<img src="...">` — sem necessidade de proxy ou autenticação.

### Imóveis de locação (`modelo_integracao: "imobiliar"`)

`imagem_principal` retorna `null` por enquanto. A integração de fotos para o sistema Imobiliar está planejada para uma próxima etapa. Exibir um placeholder enquanto não estiver disponível.

---

## Cidades e bairros disponíveis

Com base no catálogo atual, as principais localidades:

**Cidades:** Canoas, Porto Alegre, Nova Santa Rita, Esteio, Sapucaia do Sul, Niterói (RS), Harmonia, Mato Grande

**Para obter a lista atual de cidades e bairros** (sem dados sensíveis), basta chamar o endpoint de listagem e agrupar os valores únicos dos campos `cidade` e `bairro` no frontend — ou pedir para a equipe BXP exportar a lista quando necessário.

---

## CORS

Por enquanto o acesso é via IP filtrado (sem browser), então CORS não é uma preocupação imediata.

Quando o site for ao ar em um domínio, informar o domínio exato para a equipe BXP adicionar à whitelist de origens permitidas. Formato esperado: `https://www.seusite.com.br`.

---

## Paginação — boas práticas

```js
// Exemplo em JavaScript/React
const BASE_URL = "http://<IP-EXTERNO>:8010/api/v1/publico/imobiliaria/cli_segura";

async function buscarImoveis({ negociacao, cidade, busca, pagina = 1, porPagina = 24 }) {
  const params = new URLSearchParams({ pagina, por_pagina: porPagina });
  if (negociacao) params.set("negociacao", negociacao);
  if (cidade)     params.set("cidade", cidade);
  if (busca)      params.set("busca", busca);

  const resp = await fetch(`${BASE_URL}/imoveis?${params}`);
  if (!resp.ok) throw new Error(`API error ${resp.status}`);
  return resp.json();
  // { pagina, por_pagina, total, total_paginas, itens: [...] }
}
```

---

## Erros esperados

| Status | Descrição |
|---|---|
| `200` | Sucesso. |
| `404` | Imóvel não encontrado (no endpoint de detalhe). |
| `422` | Parâmetro inválido. |
| `503` | API temporariamente indisponível. |

---

## Notas para o desenvolvimento

- **Atualização:** o catálogo é atualizado automaticamente a cada 60 minutos pelo agente BXP.
- **Campos nulos:** tratar todos os campos opcionais como possivelmente `null`. Especialmente `imagem_principal`, `descricao` e características numéricas.
- **Placeholder de foto:** para locação (sem foto), usar um placeholder de 16:9 ou 4:3 com o nome do tipo de imóvel/bairro.
- **Valor:** preferir `valor_texto` para exibição (já formatado em pt-BR). Usar `valor` numérico apenas para ordenação ou cálculos.
- **Código único:** o campo `codigo` é único dentro da mesma `negociacao`. Para evitar colisão entre sistemas, usar `${codigo}-${negociacao}` como chave de componente React/Vue.

---

## Contato técnico

Dúvidas sobre a API: equipe BXP — Caio Lima.
