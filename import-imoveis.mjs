/**
 * Script de importação de imóveis — Imobiliária Segura
 *
 * Lê o arquivo segura-imoveis.json e insere/atualiza os imóveis no Supabase,
 * usando "referencia" como chave de upsert (evita duplicados em reimportações).
 *
 * ⚠️ PRÉ-REQUISITO: a coluna "referencia" precisa ter uma constraint UNIQUE
 * para o upsert funcionar. Rode isso uma vez no SQL Editor do Supabase
 * antes de importar (é seguro rodar mesmo se já existir):
 *
 *   alter table public.imoveis
 *     add constraint imoveis_referencia_key unique (referencia);
 *
 * COMO RODAR O SCRIPT:
 *   1. Coloque este arquivo na raiz do projeto (ao lado do package.json)
 *   2. Coloque o segura-imoveis.json na raiz também
 *   3. No .env, garanta que existem:
 *        SUPABASE_URL=...
 *        SUPABASE_SERVICE_ROLE_KEY=...   (chave service_role, NÃO a anon key — necessária para bypass de RLS na importação em massa)
 *   4. Rode:
 *        node import-imoveis.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

// Carrega variáveis do .env manualmente (sem depender do pacote dotenv)
if (existsSync("./.env")) {
  const envContent = readFileSync("./.env", "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "❌ Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env antes de rodar este script.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const RAW = JSON.parse(readFileSync("./segura-imoveis.json", "utf-8"));

console.log(`📦 ${RAW.length} imóveis encontrados no JSON.`);

// Normaliza os campos para o formato exato da tabela "imoveis"
function normalizar(item) {
  return {
    referencia: item.referencia ?? null,
    titulo: item.titulo ?? "Imóvel sem título",
    tipo: item.tipo ?? null,
    finalidade: item.finalidade === "venda" ? "venda" : "locacao",
    preco: Number(item.preco ?? 0),
    preco_condominio: item.preco_condominio != null ? Number(item.preco_condominio) : null,
    preco_iptu: item.preco_iptu != null ? Number(item.preco_iptu) : null,
    cidade: item.cidade ?? null,
    bairro: item.bairro ?? null,
    estado: item.estado ?? "RS",
    dormitorios: item.dormitorios != null ? Number(item.dormitorios) : 0,
    suites: item.suites != null ? Number(item.suites) : 0,
    banheiros: item.banheiros != null ? Number(item.banheiros) : 0,
    vagas: item.vagas != null ? Number(item.vagas) : 0,
    area: item.area != null ? Number(item.area) : null,
    mobiliado: Boolean(item.mobiliado),
    destaque: Boolean(item.destaque),
    imagem_principal: item.imagem_principal || null,
    corretor_nome: item.corretor_nome || null,
    corretor_telefone: item.corretor_telefone || null,
    external_id: item.external_id ? String(item.external_id) : null,
    ativo: true,
  };
}

const registros = RAW.map(normalizar).filter((r) => r.referencia); // exige referência única

console.log(`✅ ${registros.length} registros válidos após normalização.`);

// Importa em lotes de 100 para evitar payloads gigantes
const LOTE = 100;
let inseridos = 0;
let erros = 0;

for (let i = 0; i < registros.length; i += LOTE) {
  const lote = registros.slice(i, i + LOTE);
  const { data, error } = await supabase
    .from("imoveis")
    .upsert(lote, { onConflict: "referencia", ignoreDuplicates: false })
    .select("id");

  if (error) {
    console.error(`❌ Erro no lote ${i / LOTE + 1}:`, error.message);
    erros += lote.length;
  } else {
    inseridos += data?.length ?? 0;
    console.log(`  ↳ Lote ${i / LOTE + 1}: ${data?.length ?? 0} imóveis importados`);
  }
}

console.log("\n──────────────────────────────");
console.log(`✅ Importação concluída: ${inseridos} imóveis`);
if (erros) console.log(`⚠️  ${erros} registros com erro`);
console.log("──────────────────────────────");
