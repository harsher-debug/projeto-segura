import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [imoveis, leads, visitas, propostas, leadsPorStatus, imoveisPorTipo] =
      await Promise.all([
        supabase.from("imoveis").select("id", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("visitas").select("id", { count: "exact", head: true }).eq("status", "agendada"),
        supabase.from("propostas").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("status"),
        supabase.from("imoveis").select("tipo").eq("ativo", true),
      ]);

    const funil: Record<string, number> = {
      novo: 0, contato: 0, visita: 0, proposta: 0, fechado: 0, perdido: 0,
    };
    for (const l of leadsPorStatus.data ?? []) {
      if (l.status && l.status in funil) funil[l.status as string]++;
    }
    const tipos: Record<string, number> = {};
    for (const i of imoveisPorTipo.data ?? []) {
      const t = i.tipo || "Outros";
      tipos[t] = (tipos[t] ?? 0) + 1;
    }

    return {
      totalImoveis: imoveis.count ?? 0,
      totalLeads: leads.count ?? 0,
      visitasAgendadas: visitas.count ?? 0,
      totalPropostas: propostas.count ?? 0,
      funil,
      porTipo: Object.entries(tipos)
        .map(([tipo, total]) => ({ tipo, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 8),
    };
  });

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("leads")
      .select("*, imoveis(titulo, referencia)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        nome: z.string().min(2),
        email: z.string().email().optional().or(z.literal("")),
        telefone: z.string().optional(),
        origem: z.string().optional(),
        status: z.enum(["novo", "contato", "visita", "proposta", "fechado", "perdido"]),
        valor_estimado: z.number().optional().nullable(),
        observacoes: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      nome: data.nome,
      email: data.email || null,
      telefone: data.telefone || null,
      origem: data.origem || "manual",
      status: data.status,
      valor_estimado: data.valor_estimado ?? null,
      observacoes: data.observacoes || null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("leads").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("leads").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["novo", "contato", "visita", "proposta", "fechado", "perdido"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("leads")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("leads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listVisitas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("visitas")
      .select("*, imoveis(titulo, referencia), leads(nome, telefone)")
      .order("data_visita", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertVisita = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        imovel_id: z.string().uuid().optional().nullable(),
        lead_id: z.string().uuid().optional().nullable(),
        data_visita: z.string(),
        status: z.string().default("agendada"),
        observacoes: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      imovel_id: data.imovel_id || null,
      lead_id: data.lead_id || null,
      data_visita: data.data_visita,
      status: data.status,
      observacoes: data.observacoes || null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("visitas").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("visitas").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteVisita = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("visitas").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listPropostas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("propostas")
      .select("*, imoveis(titulo, referencia), leads(nome, telefone)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        imovel_id: z.string().uuid().optional().nullable(),
        lead_id: z.string().uuid().optional().nullable(),
        valor: z.number().min(0),
        status: z.string().default("em_analise"),
        observacoes: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      imovel_id: data.imovel_id || null,
      lead_id: data.lead_id || null,
      valor: data.valor,
      status: data.status,
      observacoes: data.observacoes || null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("propostas").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("propostas").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("propostas").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listImoveisAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ busca: z.string().optional() }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("imoveis")
      .select("id, referencia, titulo, tipo, finalidade, preco, cidade, bairro, dormitorios, vagas, area, ativo, imagem_principal")
      .order("created_at", { ascending: false })
      .limit(300);
    if (data.busca) {
      const t = `%${data.busca}%`;
      q = q.or(`titulo.ilike.${t},bairro.ilike.${t},referencia.ilike.${t}`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertImovel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        titulo: z.string().min(3),
        referencia: z.string().optional(),
        descricao: z.string().optional(),
        tipo: z.string().optional(),
        finalidade: z.enum(["locacao", "venda"]),
        preco: z.number().min(0),
        preco_condominio: z.number().min(0).optional(),
        preco_iptu: z.number().min(0).optional(),
        cidade: z.string().optional(),
        bairro: z.string().optional(),
        dormitorios: z.number().int().min(0).optional(),
        suites: z.number().int().min(0).optional(),
        banheiros: z.number().int().min(0).optional(),
        vagas: z.number().int().min(0).optional(),
        area: z.number().min(0).optional(),
        mobiliado: z.boolean().optional(),
        destaque: z.boolean().optional(),
        ativo: z.boolean().optional(),
        imagem_principal: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const payload = {
      ...rest,
      fotos: rest.imagem_principal ?[rest.imagem_principal] : [],
    };
    if (id) {
      const { error } = await context.supabase.from("imoveis").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("imoveis").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const toggleImovelAtivo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), ativo: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("imoveis")
      .update({ ativo: data.ativo })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteImovel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("imoveis").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    return { profile, roles: (roles ?? []).map((r) => r.role) };
  });
