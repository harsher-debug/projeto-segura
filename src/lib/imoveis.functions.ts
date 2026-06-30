import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
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
  pageSize: z.number().int().min(1).max(48).default(12),
});

export type ImovelFiltro = z.infer<typeof filterSchema>;

export const listImoveis = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => filterSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
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

export const getFacets = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ finalidade: z.enum(["locacao", "venda"]).optional() }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
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
        imovel_id: z.string().uuid().optional(),
        observacoes: z.string().max(2000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { error } = await supabase.from("leads").insert({
      nome: data.nome,
      email: data.email || null,
      telefone: data.telefone || null,
      imovel_id: data.imovel_id || null,
      observacoes: data.observacoes || null,
      origem: "site",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });