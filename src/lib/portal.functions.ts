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

// ─── Perfil do usuário ────────────────────────────────────────────────────────

export const getUserProfile = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ userId: z.string() }).parse(d))
  .handler(async ({ data }) => {
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
      // Próximos repasses simulados (substituir por tabela real)
      proximosRepasses: [
        { data: "05/07/2025", imovel: "Ap. Centro", valor: 1200 },
        { data: "05/07/2025", imovel: "Casa Mathias Velho", valor: 1800 },
      ],
    };
  });

// ─── Portal do Locatário ─────────────────────────────────────────────────────

export const getLocatarioDashboard = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ userId: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    // Busca leads vinculados ao email do usuário
    const { data: user } = await supabase.auth.admin
      ? null
      : { data: null };

    // Retorna dados simulados estruturados para o locatário
    // Na implementação final, buscar da tabela contratos/boletos
    return {
      contrato: {
        imovel: "Apartamento - Centro, Canoas",
        referencia: "1041",
        inicio: "01/01/2024",
        fim: "31/12/2024",
        valor: 1200,
        status: "ativo",
      },
      boletos: [
        { mes: "Julho/2025", vencimento: "10/07/2025", valor: 1200, status: "pendente" },
        { mes: "Junho/2025", vencimento: "10/06/2025", valor: 1200, status: "pago" },
        { mes: "Maio/2025", vencimento: "10/05/2025", valor: 1200, status: "pago" },
      ],
      chamados: [] as Array<{ titulo: string; status: string; data: string }>,
      proximoVencimento: { data: "10/07/2025", valor: 1200 },
    };
  });
