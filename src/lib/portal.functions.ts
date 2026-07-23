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

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
}

// ─── Perfil do usuário ────────────────────────────────────────────────────────

export const getUserProfile = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ userId: z.string() }).parse(d))
  .handler(async ({ data }) => {
    if (!hasSupabaseEnv()) return { profile: null, roles: [] };

    const supabase = publicClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.userId)
      .maybeSingle();
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.userId);
    return {
      profile,
      roles: roles?.map((r) => r.role) ?? [],
    };
  });

// ─── Portal do Proprietário ──────────────────────────────────────────────────

export const getProprietarioDashboard = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ userId: z.string() }).parse(d))
  .handler(async ({ data }) => {
    if (!hasSupabaseEnv()) {
      return {
        imoveis: [],
        stats: { total: 2, ativos: 2, vagos: 0, receitaEstimada: 3000 },
        proximosRepasses: [
          { data: "05/08/2026", imovel: "Ap. Centro", valor: 1200 },
          { data: "05/09/2026", imovel: "Casa Mathias Velho", valor: 1800 },
        ],
      };
    }

    const supabase = publicClient();

    // Busca imóveis vinculados ao proprietário via corretor_id (userId) ou campo proprietario_id
    // Como o schema atual não tem tabela de proprietários separada, usamos imoveis com corretor_id
    // Na prática isso seria substituído por uma tabela proprietarios com FK para imoveis
    const { data: imoveis } = await supabase
      .from("imoveis")
      .select("id, referencia, titulo, tipo, finalidade, preco, bairro, cidade, ativo, imagem_principal")
      .eq("ativo", true)
      .limit(20);

    const total = imoveis?.length ?? 0;
    const ativos = imoveis?.filter((i) => i.ativo).length ?? 0;
    const vagos = total - ativos;

    // Receita estimada (soma dos aluguéis)
    const receitaEstimada = imoveis
      ?.filter((i) => i.finalidade === "locacao")
      .reduce((acc, i) => acc + (i.preco ?? 0), 0) ?? 0;

    return {
      imoveis: imoveis ?? [],
      stats: {
        total,
        ativos,
        vagos,
        receitaEstimada,
      },
      // Dados de repasse enquanto as tabelas financeiras finais nao existem.
      proximosRepasses: [
        { data: "05/08/2026", imovel: "Ap. Centro", valor: 1200 },
        { data: "05/09/2026", imovel: "Casa Mathias Velho", valor: 1800 },
      ],
    };
  });

// ─── Portal do Locatário ─────────────────────────────────────────────────────

export const getLocatarioDashboard = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ userId: z.string() }).parse(d))
  .handler(async ({ data }) => {
    if (!hasSupabaseEnv()) {
      return {
        contrato: {
          imovel: "Apartamento - Centro, Canoas",
          referencia: "1041",
          inicio: "01/01/2026",
          fim: "31/12/2026",
          valor: 4800,
          status: "ativo",
        },
        boletos: [
          { mes: "Novembro/2026", vencimento: "10/11/2026", valor: 4800, status: "pendente" },
          { mes: "Outubro/2026", vencimento: "10/10/2026", valor: 4800, status: "pago" },
          { mes: "Setembro/2026", vencimento: "10/09/2026", valor: 4800, status: "pago" },
        ],
        chamados: [
          { titulo: "Chamado #4523 respondido pela equipe tecnica", status: "respondido", data: "Ontem" },
          { titulo: "Revisao hidraulica em andamento", status: "aberto", data: "15/07/2026" },
        ],
        proximoVencimento: { data: "10/11/2026", valor: 4800 },
      };
    }


    // Dados estruturados enquanto contratos/boletos/documentos nao existem
    // como tabelas dedicadas no schema atual.
    return {
      contrato: {
        imovel: "Apartamento - Centro, Canoas",
        referencia: "1041",
        inicio: "01/01/2026",
        fim: "31/12/2026",
        valor: 1200,
        status: "ativo",
      },
      boletos: [
        { mes: "Agosto/2026", vencimento: "10/08/2026", valor: 1200, status: "pendente" },
        { mes: "Julho/2026", vencimento: "10/07/2026", valor: 1200, status: "pago" },
        { mes: "Junho/2026", vencimento: "10/06/2026", valor: 1200, status: "pago" },
      ],
      chamados: [] as Array<{ titulo: string; status: string; data: string }>,
      proximoVencimento: { data: "10/08/2026", valor: 1200 },
    };
  });
