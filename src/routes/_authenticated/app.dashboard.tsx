import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDashboardStats } from "@/lib/crm.functions";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/dashboard")({
  component: Dashboard,
});

const funilLabels: Record<string, { label: string; color: string }> = {
  novo: { label: "Novos Leads", color: "bg-blue-500" },
  contato: { label: "Em Contato", color: "bg-indigo-500" },
  visita: { label: "Visita Agendada", color: "bg-violet-500" },
  proposta: { label: "Proposta Enviada", color: "bg-amber-500" },
  fechado: { label: "Fechados", color: "bg-emerald-500" },
  perdido: { label: "Perdidos", color: "bg-red-400" },
};

// Dados de receita simulados para o gráfico (substituir por dados reais).
const receitaMensal = [
  { mes: "Jan", valor: 18400 },
  { mes: "Fev", valor: 21200 },
  { mes: "Mar", valor: 19800 },
  { mes: "Abr", valor: 24600 },
  { mes: "Mai", valor: 22100 },
  { mes: "Jun", valor: 26800 },
];

function Dashboard() {
  const statsFn = useServerFn(getDashboardStats);
  const { data, isLoading } = useQuery({
    queryKey: ["dash-stats"],
    queryFn: () => statsFn(),
    refetchInterval: 30_000,
  });

  const cards = [
    {
      label: "Imóveis Ativos",
      value: data?.totalImoveis,
      icon: Building2,
      color: "bg-blue-50 text-blue-600",
      trend: "+3 este mês",
    },
    {
      label: "Total de Leads",
      value: data?.totalLeads,
      icon: Users,
      color: "bg-violet-50 text-violet-600",
      trend: "Funil ativo",
    },
    {
      label: "Visitas Agendadas",
      value: data?.visitasAgendadas,
      icon: CalendarDays,
      color: "bg-amber-50 text-amber-600",
      trend: "Próximos 7 dias",
    },
    {
      label: "Propostas Abertas",
      value: data?.totalPropostas,
      icon: FileText,
      color: "bg-emerald-50 text-emerald-600",
      trend: "Em negociação",
    },
  ];

  const maxFunil = Math.max(1, ...Object.values(data?.funil ?? { x: 1 }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Visão geral da imobiliária · atualizado automaticamente
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/portal/proprietario"
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-medium shadow-sm hover:bg-muted"
          >
            <Building2 className="h-3.5 w-3.5" /> Portal Proprietário
          </Link>
          <Link
            to="/portal/locatario"
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-medium shadow-sm hover:bg-muted"
          >
            <Users className="h-3.5 w-3.5" /> Portal Locatário
          </Link>
        </div>
      </div>

      {(data?.visitasAgendadas ?? 0) > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Bell className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            Você tem <strong>{data?.visitasAgendadas}</strong> visitas agendadas nos próximos dias.{" "}
            <Link to="/app/visitas" className="font-semibold underline">
              Ver agenda
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {card.label}
              </span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold text-foreground">
              {isLoading ? (
                <span className="animate-pulse text-xl text-muted-foreground">...</span>
              ) : (
                card.value ?? "—"
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{card.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-bold">Funil de Conversão</h2>
            </div>
            <Link
              to="/app/leads"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver leads <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {Object.entries(funilLabels).map(([key, { label, color }]) => {
              const value = data?.funil?.[key] ?? 0;
              const pct = Math.round((value / maxFunil) * 100);

              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{value}</span>
                      <span className="text-xs text-muted-foreground">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="font-display text-base font-bold">Receita Mensal</h2>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={receitaMensal} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `R$${(Number(value) / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatBRL(value), "Receita"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--color-primary)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="font-display text-base font-bold">Imóveis por Tipo</h2>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.porTipo ?? []}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="tipo"
                  width={100}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [value, "Imóveis"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {(data?.porTipo ?? []).map((_, index) => (
                    <Cell key={index} fill="var(--color-primary)" opacity={1 - index * 0.1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-bold">Resumo de Leads</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Novos", key: "novo", icon: Clock, color: "bg-blue-50 text-blue-600" },
              { label: "Fechados", key: "fechado", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
              { label: "Em Contato", key: "contato", icon: Users, color: "bg-violet-50 text-violet-600" },
              { label: "Perdidos", key: "perdido", icon: XCircle, color: "bg-red-50 text-red-500" },
            ].map((status) => (
              <div key={status.key} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${status.color}`}>
                  <status.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{status.label}</p>
                  <p className="font-display text-xl font-bold">
                    {data?.funil?.[status.key] ?? 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
