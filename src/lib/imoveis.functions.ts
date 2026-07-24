import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { normalizeText, titleCase, formatBRL, formatArea } from "@/lib/format";
import rawImoveis from "../../segura-imoveis.json";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

type LocalImovel = Database["public"]["Tables"]["imoveis"]["Row"];

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
}

function bxpBaseUrl() {
  const value =
    process.env.BXP_API_BASE_URL ||
    process.env.VITE_BXP_API_BASE_URL ||
    "";
  return value.trim().replace(/\/$/, "");
}

function hasBxpEnv() {
  return bxpBaseUrl().length > 0 && !bxpBaseUrl().includes("<IP-EXTERNO>");
}

type BxpImovel = {
  codigo: string;
  negociacao: "venda" | "locacao";
  tipo_imovel: string | null;
  titulo: string | null;
  subtitulo?: string | null;
  descricao: string | null;
  endereco?: string | null;
  logradouro?: string | null;
  rua?: string | null;
  cidade: string | null;
  bairro: string | null;
  estado: string | null;
  valor: number | null;
  valor_texto?: string | null;
  valor_iptu: number | null;
  valor_condominio: number | null;
  dormitorios: number | null;
  suites: number | null;
  banheiros: number | null;
  vagas: number | null;
  area_util: number | null;
  area_total: number | null;
  imagem_principal: string | null;
  modelo_integracao: string | null;
};

type BxpListResponse = {
  pagina: number;
  por_pagina: number;
  total: number;
  total_paginas: number;
  itens: BxpImovel[];
};

function buildDescricaoImovel(item: {
  titulo?: string | null;
  tipo?: string | null;
  finalidade?: string | null;
  cidade?: string | null;
  bairro?: string | null;
  dormitorios?: number | null;
  suites?: number | null;
  banheiros?: number | null;
  vagas?: number | null;
  area?: number | null;
  preco?: number | null;
  descricao?: string | null;
}) {
  const descricao = normalizeText(item.descricao);
  if (descricao && descricao.toLocaleLowerCase("pt-BR") !== normalizeText(item.titulo).toLocaleLowerCase("pt-BR")) {
    return descricao;
  }

  const tipo = titleCase(item.tipo || "imóvel");
  const finalidade = item.finalidade === "venda" ?"venda" : "locação";
  const local = [item.bairro, item.cidade].filter(Boolean).map((value) => titleCase(value)).join(", ");
  const detalhes = [
    item.dormitorios  ? `${item.dormitorios} dormitório${item.dormitorios > 1 ?"s" : ""}` : null,
    item.suites  ? `${item.suites} suíte${item.suites > 1 ?"s" : ""}` : null,
    item.banheiros  ? `${item.banheiros} banheiro${item.banheiros > 1 ?"s" : ""}` : null,
    item.vagas  ? `${item.vagas} vaga${item.vagas > 1 ?"s" : ""}` : null,
    item.area ?formatArea(item.area) : null,
  ].filter(Boolean);

  return [
    `${tipo} disponível para ${finalidade}${local  ? ` em ${local}` : ""}.`,
    detalhes.length  ? `O imóvel conta com ${detalhes.join(", ")}.` : null,
    item.preco  ? `Valor anunciado: ${formatBRL(item.preco)}.` : null,
    "Entre em contato com a Segura Imobiliária para confirmar disponibilidade, condições e agendar uma visita.",
  ].filter(Boolean).join(" ");
}

function mapBxpImovel(item: BxpImovel): LocalImovel {
  const referencia = String(item.codigo);
  const finalidade = item.negociacao === "venda" ?"venda" : "locacao";
  const row = {
    id: `${referencia}-${finalidade}`,
    referencia,
    titulo: normalizeText(item.titulo || item.subtitulo || `${item.tipo_imovel ?? "Imóvel"} ${referencia}`),
    tipo: normalizeText(item.tipo_imovel),
    finalidade,
    preco: Number(item.valor ?? 0),
    preco_condominio: item.valor_condominio == null ? null : Number(item.valor_condominio),
    preco_iptu: item.valor_iptu == null ? null : Number(item.valor_iptu),
    cidade: normalizeText(item.cidade),
    bairro: normalizeText(item.bairro),
    estado: normalizeText(item.estado) || "RS",
    dormitorios: item.dormitorios == null ? 0 : Number(item.dormitorios),
    suites: item.suites == null ? 0 : Number(item.suites),
    banheiros: item.banheiros == null ? 0 : Number(item.banheiros),
    vagas: item.vagas == null ? 0 : Number(item.vagas),
    area: item.area_util ?? item.area_total,
    mobiliado: false,
    destaque: false,
    imagem_principal: item.imagem_principal,
    fotos: item.imagem_principal ?[item.imagem_principal] : [],
    descricao: normalizeText([item.descricao, item.subtitulo, item.endereco, item.logradouro, item.rua].filter(Boolean).join(" ")),
    corretor_nome: null,
    corretor_telefone: null,
    external_id: item.modelo_integracao,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return { ...row, descricao: buildDescricaoImovel(row) };
}

function applyClientFilters(rows: LocalImovel[], data: ImovelFiltro) {
  let filtered = rows;
  if (data.tipo) filtered = filtered.filter((i) => i.tipo === data.tipo);
  if (data.dormitorios) filtered = filtered.filter((i) => (i.dormitorios ?? 0) >= data.dormitorios!);
  if (data.vagas) filtered = filtered.filter((i) => (i.vagas ?? 0) >= data.vagas!);
  if (data.precoMin) filtered = filtered.filter((i) => i.preco >= data.precoMin!);
  if (data.precoMax) filtered = filtered.filter((i) => i.preco <= data.precoMax!);
  if (data.mobiliado) filtered = filtered.filter((i) => i.mobiliado);
  if (data.ordem === "menor_preco") filtered = [...filtered].sort((a, b) => a.preco - b.preco);
  else if (data.ordem === "maior_preco") filtered = [...filtered].sort((a, b) => b.preco - a.preco);
  return filtered;
}

async function fetchBxpList(data: ImovelFiltro): Promise<{
  items: LocalImovel[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const params = new URLSearchParams({
    pagina: String(data.page),
    por_pagina: String(data.pageSize),
  });
  if (data.finalidade) params.set("negociacao", data.finalidade);
  if (data.cidade) params.set("cidade", data.cidade);
  if (data.bairro) params.set("bairro", data.bairro);
  if (data.busca) params.set("busca", data.busca);

  const response = await fetch(`${bxpBaseUrl()}/imoveis?${params.toString()}`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error(`BXP API error ${response.status}`);
  const json = (await response.json()) as BxpListResponse;
  const rows = applyClientFilters((json.itens ?? []).map(mapBxpImovel), data);
  return {
    items: rows,
    total: data.tipo || data.dormitorios || data.vagas || data.precoMin || data.precoMax
      ? rows.length
      : json.total,
    page: json.pagina ?? data.page,
    pageSize: json.por_pagina ?? data.pageSize,
  };
}

function splitBxpId(id: string) {
  const match = id.match(/^(.*)-(venda|locacao)$/);
  return match ?{ codigo: match[1], negociacao: match[2] as "venda" | "locacao" } : { codigo: id };
}

async function fetchBxpDetail(id: string) {
  const { codigo, negociacao } = splitBxpId(id);
  const params = new URLSearchParams();
  if (negociacao) params.set("negociacao", negociacao);
  const qs = params.toString();
  const response = await fetch(`${bxpBaseUrl()}/imoveis/${encodeURIComponent(codigo)}${qs  ? `?${qs}` : ""}`, {
    headers: { accept: "application/json" },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`BXP API error ${response.status}`);
  return mapBxpImovel((await response.json()) as BxpImovel);
}

async function fetchBxpFacets(finalidade?: "locacao" | "venda") {
  const params = new URLSearchParams({ pagina: "1", por_pagina: "50" });
  if (finalidade) params.set("negociacao", finalidade);
  const response = await fetch(`${bxpBaseUrl()}/imoveis?${params.toString()}`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error(`BXP API error ${response.status}`);
  const json = (await response.json()) as BxpListResponse;
  const rows = (json.itens ?? []).map(mapBxpImovel);
  return {
    cidades: [...new Set(rows.map((r) => r.cidade).filter(Boolean) as string[])].sort(),
    bairros: [...new Set(rows.map((r) => r.bairro).filter(Boolean) as string[])].sort(),
    tipos: [...new Set(rows.map((r) => r.tipo).filter(Boolean) as string[])].sort(),
  };
}

function localRows(): LocalImovel[] {
  return (rawImoveis as Array<Record<string, unknown>>).map((item, index) => {
    const referencia = String(item.referencia ?? index + 1);
    const row = {
      id: referencia,
      referencia,
      titulo: normalizeText(String(item.titulo ?? "Imóvel")),
      tipo: item.tipo == null ? null : normalizeText(String(item.tipo)),
      finalidade: item.finalidade === "venda" ?"venda" : "locacao",
      preco: Number(item.preco ?? 0),
      preco_condominio: item.preco_condominio == null ? null : Number(item.preco_condominio),
      preco_iptu: item.preco_iptu == null ? null : Number(item.preco_iptu),
      cidade: item.cidade == null ? null : normalizeText(String(item.cidade)),
      bairro: item.bairro == null ? null : normalizeText(String(item.bairro)),
      estado: item.estado == null ?"RS" : normalizeText(String(item.estado)),
      dormitorios: item.dormitorios == null ? 0 : Number(item.dormitorios),
      suites: item.suites == null ? 0 : Number(item.suites),
      banheiros: item.banheiros == null ? 0 : Number(item.banheiros),
      vagas: item.vagas == null ? 0 : Number(item.vagas),
      area: item.area == null ? null : Number(item.area),
      mobiliado: Boolean(item.mobiliado),
      destaque: Boolean(item.destaque),
      imagem_principal: item.imagem_principal == null ? null : String(item.imagem_principal),
      fotos: item.imagem_principal ? [String(item.imagem_principal)] : [],
      descricao: normalizeText(String(item.descricao ?? item.endereco ?? item.logradouro ?? item.rua ?? item.titulo ?? "")),
      corretor_nome: item.corretor_nome == null ? null : normalizeText(String(item.corretor_nome)),
      corretor_telefone: item.corretor_telefone == null ? null : String(item.corretor_telefone),
      external_id: item.external_id == null ? null : String(item.external_id),
      ativo: true,
      created_at: new Date(2026, 6, 1 + (index % 20)).toISOString(),
      updated_at: new Date(2026, 6, 1 + (index % 20)).toISOString(),
    };
    return { ...row, descricao: buildDescricaoImovel(row) };
  });
}

const vendaFallback = [
  { preco: 495000, titulo: "Casa à venda em Canoas" },
  { preco: 690000, titulo: "Apartamento à venda no Centro" },
  { preco: 890000, titulo: "Casa com pátio em bairro residencial" },
  { preco: 350000, titulo: "Apartamento pronto para morar" },
  { preco: 1250000, titulo: "Residência ampla em Canoas" },
  { preco: 430000, titulo: "Sobrado à venda próximo ao comércio" },
  { preco: 760000, titulo: "Casa térrea com garagem" },
  { preco: 315000, titulo: "Apartamento à venda com ótima localização" },
];

function localVendaFallbackRows() {
  return localRows().slice(0, vendaFallback.length).map((row, index) => ({
    ...row,
    id: `${row.referencia ?? row.id}-venda`,
    finalidade: "venda",
    preco: vendaFallback[index].preco,
    preco_condominio: row.tipo?.toLowerCase().includes("apartamento") ? row.preco_condominio : null,
    titulo: vendaFallback[index].titulo,
    destaque: true,
  })) as LocalImovel[];
}

function filterLocalRows(data: ImovelFiltro) {
  let rows = localRows();
  if (data.finalidade === "venda" && !rows.some((i) => i.finalidade === "venda")) {
    rows = localVendaFallbackRows();
  }
  if (data.finalidade) rows = rows.filter((i) => i.finalidade === data.finalidade);
  if (data.cidade) rows = rows.filter((i) => i.cidade === data.cidade);
  if (data.bairro) rows = rows.filter((i) => i.bairro === data.bairro);
  if (data.tipo) rows = rows.filter((i) => i.tipo === data.tipo);
  if (data.dormitorios) rows = rows.filter((i) => (i.dormitorios ?? 0) >= data.dormitorios!);
  if (data.vagas) rows = rows.filter((i) => (i.vagas ?? 0) >= data.vagas!);
  if (data.precoMin) rows = rows.filter((i) => i.preco >= data.precoMin!);
  if (data.precoMax) rows = rows.filter((i) => i.preco <= data.precoMax!);
  if (data.mobiliado) rows = rows.filter((i) => i.mobiliado);
  if (data.busca) {
    const term = data.busca.toLowerCase();
    rows = rows.filter((i) =>
      [i.titulo, i.bairro, i.cidade, i.referencia, i.descricao]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }
  if (data.ordem === "menor_preco") rows.sort((a, b) => a.preco - b.preco);
  else if (data.ordem === "maior_preco") rows.sort((a, b) => b.preco - a.preco);
  else rows.sort((a, b) => Number(b.destaque) - Number(a.destaque) || b.created_at.localeCompare(a.created_at));
  return rows;
}

const filterSchema = z.object({
  finalidade: z.enum(["locacao", "venda"]).optional(),
  cidade: z.string().optional(),
  bairro: z.string().optional(),
  tipo: z.string().optional(),
  dormitorios: z.number().int().min(0).optional(),
  vagas: z.number().int().min(0).optional(),
  precoMin: z.number().min(0).optional(),
  precoMax: z.number().min(0).optional(),
  mobiliado: z.boolean().optional(),
  busca: z.string().optional(),
  ordem: z.enum(["recentes", "menor_preco", "maior_preco"]).optional(),
  apenasRecentes: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(500).default(12),
});

export type ImovelFiltro = z.infer<typeof filterSchema>;

export const listImoveis = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => filterSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    if (hasBxpEnv()) {
      try {
        return await fetchBxpList(data);
      } catch (error) {
        console.error("[BXP] Falha ao listar imoveis, usando fallback local.", error);
      }
    }

    if (!hasSupabaseEnv()) {
      const rows = filterLocalRows(data);
      const from = (data.page - 1) * data.pageSize;
      return {
        items: rows.slice(from, from + data.pageSize),
        total: rows.length,
        page: data.page,
        pageSize: data.pageSize,
      };
    }

    const supabase = publicClient();
    let q = supabase
      .from("imoveis")
      .select(
        "id, referencia, titulo, tipo, finalidade, preco, preco_condominio, preco_iptu, cidade, bairro, dormitorios, suites, banheiros, vagas, area, mobiliado, destaque, imagem_principal",
        { count: "exact" },
      )
      .eq("ativo", true);

    if (data.finalidade) q = q.eq("finalidade", data.finalidade);
    if (data.cidade) q = q.eq("cidade", data.cidade);
    if (data.bairro) q = q.eq("bairro", data.bairro);
    if (data.tipo) q = q.eq("tipo", data.tipo);
    if (data.dormitorios) q = q.gte("dormitorios", data.dormitorios);
    if (data.vagas) q = q.gte("vagas", data.vagas);
    if (typeof data.mobiliado === "boolean" && data.mobiliado)
      q = q.eq("mobiliado", true);
    if (data.precoMin) q = q.gte("preco", data.precoMin);
    if (data.precoMax) q = q.lte("preco", data.precoMax);
    if (data.apenasRecentes) {
      const limite = new Date();
      limite.setDate(limite.getDate() - 30);
      q = q.gte("created_at", limite.toISOString());
    }
    if (data.busca) {
      const term = `%${data.busca}%`;
      q = q.or(
        `titulo.ilike.${term},bairro.ilike.${term},referencia.ilike.${term},descricao.ilike.${term}`,
      );
    }

    if (data.ordem === "menor_preco") q = q.order("preco", { ascending: true });
    else if (data.ordem === "maior_preco")
      q = q.order("preco", { ascending: false });
    else q = q.order("destaque", { ascending: false }).order("created_at", { ascending: false });

    const from = (data.page - 1) * data.pageSize;
    q = q.range(from, from + data.pageSize - 1);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return { items: rows ?? [], total: count ?? 0, page: data.page, pageSize: data.pageSize };
  });

export const getImovel = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    if (hasBxpEnv()) {
      try {
        return await fetchBxpDetail(data.id);
      } catch (error) {
        console.error("[BXP] Falha ao carregar detalhe, usando fallback local.", error);
      }
    }

    if (!hasSupabaseEnv()) {
      return [...localRows(), ...localVendaFallbackRows()].find((row) => row.id === data.id || row.referencia === data.id) ?? null;
    }

    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("imoveis")
      .select("*")
      .eq("id", data.id)
      .eq("ativo", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const getDestaques = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({ finalidade: z.enum(["locacao", "venda"]).optional(), limit: z.number().default(8) })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    if (hasBxpEnv()) {
      try {
        const result = await fetchBxpList({
          finalidade: data.finalidade,
          page: 1,
          pageSize: data.limit,
        });
        return result.items;
      } catch (error) {
        console.error("[BXP] Falha ao carregar destaques, usando fallback local.", error);
      }
    }

    if (!hasSupabaseEnv()) {
      return filterLocalRows({ finalidade: data.finalidade, page: 1, pageSize: data.limit }).slice(0, data.limit);
    }

    const supabase = publicClient();
    let q = supabase
      .from("imoveis")
      .select(
        "id, referencia, titulo, tipo, finalidade, preco, preco_condominio, cidade, bairro, dormitorios, banheiros, vagas, area, imagem_principal",
      )
      .eq("ativo", true);
    if (data.finalidade) q = q.eq("finalidade", data.finalidade);
    const { data: rows, error } = await q
      .order("destaque", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
      return rows ?? [];
  });

const suggestionSchema = z.object({
  finalidade: z.enum(["locacao", "venda"]).optional(),
  termo: z.string().default(""),
  limit: z.number().int().min(1).max(12).default(8),
});

type SearchSuggestion = {
  value: string;
  label: string;
  detail: string;
  imovelId: string;
  image: string | null;
  price: string;
  finalidade: string;
  referencia: string | null;
};

function buildSearchSuggestions(rows: LocalImovel[], termo: string, limit: number): SearchSuggestion[] {
  const normalizedTerm = normalizeText(termo).toLocaleLowerCase("pt-BR").trim();
  if (normalizedTerm.length < 2) return [];

  return rows
    .map((row) => {
      const fields = {
        referencia: normalizeText(row.referencia),
        titulo: normalizeText(row.titulo),
        bairro: normalizeText(row.bairro),
        cidade: normalizeText(row.cidade),
        tipo: normalizeText(row.tipo),
        descricao: normalizeText(row.descricao),
      };

      const haystack = Object.values(fields).join(" ").toLocaleLowerCase("pt-BR");
      if (!haystack.includes(normalizedTerm)) return null;

      const referencia = fields.referencia.toLocaleLowerCase("pt-BR");
      const bairro = fields.bairro.toLocaleLowerCase("pt-BR");
      const cidade = fields.cidade.toLocaleLowerCase("pt-BR");
      const titulo = fields.titulo.toLocaleLowerCase("pt-BR");
      const descricao = fields.descricao.toLocaleLowerCase("pt-BR");
      const score =
        referencia === normalizedTerm
          ? 0
          : referencia.startsWith(normalizedTerm)
            ? 1
            : bairro.includes(normalizedTerm)
              ? 2
              : cidade.includes(normalizedTerm)
                ? 3
                : titulo.includes(normalizedTerm)
                  ? 4
                  : descricao.includes(normalizedTerm)
                    ? 5
                    : 6;

      return {
        score,
        suggestion: {
          value: fields.referencia || fields.titulo,
          label: titleCase(fields.titulo || `${fields.tipo || "Imóvel"} ${fields.referencia}`),
          detail: [
            fields.referencia ? `Cód. ${fields.referencia}` : null,
            [titleCase(fields.bairro), titleCase(fields.cidade)].filter(Boolean).join(", "),
          ].filter(Boolean).join(" · "),
          imovelId: row.id,
          image: row.imagem_principal ?? null,
          price: formatBRL(row.preco),
          finalidade: row.finalidade,
          referencia: row.referencia,
        },
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.score - b!.score)
    .map((item) => item!.suggestion)
    .slice(0, limit);
}

export const getSearchSuggestions = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => suggestionSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    const termo = normalizeText(data.termo).trim();
    if (termo.length < 2) return [];

    if (hasBxpEnv()) {
      try {
        const result = await fetchBxpList({
          finalidade: data.finalidade,
          busca: termo,
          page: 1,
          pageSize: Math.max(data.limit, 12),
        });
        return buildSearchSuggestions(result.items, termo, data.limit);
      } catch (error) {
        console.error("[BXP] Falha ao carregar sugestões, usando fallback local.", error);
      }
    }

    if (!hasSupabaseEnv()) {
      return buildSearchSuggestions(
        filterLocalRows({ finalidade: data.finalidade, busca: termo, page: 1, pageSize: 48 }),
        termo,
        data.limit,
      );
    }

    const supabase = publicClient();
    const term = `%${termo}%`;
    let q = supabase
      .from("imoveis")
      .select("id, referencia, titulo, tipo, finalidade, preco, cidade, bairro, descricao, imagem_principal")
      .eq("ativo", true)
      .or(`referencia.ilike.${term},titulo.ilike.${term},bairro.ilike.${term},cidade.ilike.${term},descricao.ilike.${term}`)
      .limit(data.limit * 2);

    if (data.finalidade) q = q.eq("finalidade", data.finalidade);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    return buildSearchSuggestions(rows as LocalImovel[], termo, data.limit);
  });

export const getFacets = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ finalidade: z.enum(["locacao", "venda"]).optional() }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    if (hasBxpEnv()) {
      try {
        return await fetchBxpFacets(data.finalidade);
      } catch (error) {
        console.error("[BXP] Falha ao carregar filtros, usando fallback local.", error);
      }
    }

    if (!hasSupabaseEnv()) {
      const rows = filterLocalRows({ finalidade: data.finalidade, page: 1, pageSize: 48 });
      return {
        cidades: [...new Set(rows.map((r) => r.cidade).filter(Boolean) as string[])].sort(),
        bairros: [...new Set(rows.map((r) => r.bairro).filter(Boolean) as string[])].sort(),
        tipos: [...new Set(rows.map((r) => r.tipo).filter(Boolean) as string[])].sort(),
      };
    }

    const supabase = publicClient();
    let q = supabase.from("imoveis").select("cidade, bairro, tipo").eq("ativo", true);
    if (data.finalidade) q = q.eq("finalidade", data.finalidade);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const cidades = new Set<string>();
    const bairros = new Set<string>();
    const tipos = new Set<string>();
    for (const r of rows ?? []) {
      if (r.cidade) cidades.add(r.cidade);
      if (r.bairro) bairros.add(r.bairro);
      if (r.tipo) tipos.add(r.tipo);
    }
    return {
      cidades: [...cidades].sort(),
      bairros: [...bairros].sort(),
      tipos: [...tipos].sort(),
    };
  });

export const createLeadPublic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        nome: z.string().min(2).max(120),
        email: z.string().email().optional().or(z.literal("")),
        telefone: z.string().max(40).optional(),
        imovel_id: z.string().optional(),
        observacoes: z.string().max(2000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!hasSupabaseEnv()) return { ok: true };

    const supabase = publicClient();
    const imovelId = data.imovel_id && z.string().uuid().safeParse(data.imovel_id).success
      ?data.imovel_id
      : null;
    const { error } = await supabase.from("leads").insert({
      nome: data.nome,
      email: data.email || null,
      telefone: data.telefone || null,
      imovel_id: imovelId,
      observacoes: data.observacoes || null,
      origem: "site",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
