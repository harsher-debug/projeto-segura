import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Building2, DollarSign, Home, AlertCircle,
  TrendingUp, ChevronRight, ArrowUpRight, Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getProprietarioDashboard } from "@/lib/portal.functions";

export const Route = createFileRoute("/portal/proprietario/")({
  component: ProprietarioDashboard,
});

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ativo: "bg-emerald-100 text-emerald-700",
    vago: "bg-amber-100 text-amber-700",
    pendente: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ProprietarioDashboard() {
  const dashFn = useServerFn(getProprietarioDashboard);
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: () => supabase.auth.getUser().then((r) => r.data.user),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["proprietario-dashboard", session?.id],
    queryFn: () => dashFn({ data: { userId: session?.id ?? "" } }),
    enabled: !!session?.id,
  });

  const cards = [
    {
      label: "Imóveis Administrados",
      value: data?.stats.total ?? "—",
      icon: Building2,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Imóveis Ativos",
      value: data?.stats.ativos ?? "—",
      icon: Home,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Imóveis Vagos",
      value: data?.stats.vagos ?? "—",
      icon: AlertCircle,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Receita Estimada",
      value: data?.stats.receitaEstimada != null ? formatBRL(data.stats.receitaEstimada) : "—",
      icon: DollarSign,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-foreground">
          Portal do Proprietário
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe seus imóveis e recebimentos
        </p>
      </div>

      {/* Cards de Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {c.label}
              </span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.color}`}>
                <c.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold text-foreground">
              {isLoading ? <span className="animate-pulse text-muted-foreground">...</span> : c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos Repasses */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-bold">Próximos Repasses</h2>
            </div>
            <Link
              to="/portal/proprietario/financeiro"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y">
            {(data?.proximosRepasses ?? []).map((r, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.imovel}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {r.data}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-emerald-600">{formatBRL(r.valor)}</span>
              </div>
            ))}
            {(!data?.proximosRepasses?.length) && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhum repasse previsto
              </div>
            )}
          </div>
        </div>

        {/* Meus Imóveis */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-bold">Meus Imóveis</h2>
            </div>
            <Link
              to="/portal/proprietario/imoveis"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y">
            {(data?.imoveis ?? []).slice(0, 4).map((im) => (
              <div key={im.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {im.imagem_principal ? (
                    <img src={im.imagem_principal} alt={im.titulo} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium capitalize">{im.titulo.toLowerCase()}</p>
                  <p className="text-xs text-muted-foreground">
                    {im.bairro} · Cód. {im.referencia}
                  </p>
                </div>
                <StatusBadge status={im.ativo ? "ativo" : "vago"} />
              </div>
            ))}
            {isLoading && (
              <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
                Carregando...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-display text-base font-bold">Ações Rápidas</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { to: "/portal/proprietario/financeiro", label: "Ver Extratos", icon: DollarSign, color: "bg-purple-50 text-purple-600" },
            { to: "/portal/proprietario/contratos", label: "Meus Contratos", icon: Building2, color: "bg-blue-50 text-blue-600" },
            { to: "/portal/proprietario/documentos", label: "Documentos", icon: AlertCircle, color: "bg-amber-50 text-amber-600" },
          ].map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="flex items-center gap-3 rounded-lg border p-4 transition hover:bg-muted/50"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${a.color}`}>
                <a.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">{a.label}</span>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
