import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  CreditCard, FileText, Wrench, Calendar,
  CheckCircle2, Clock, AlertTriangle, ChevronRight, ArrowUpRight,
  Home,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getLocatarioDashboard } from "@/lib/portal.functions";

export const Route = createFileRoute("/portal/locatario/")({
  component: LocatarioDashboard,
});

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type BoletoStatus = "pago" | "pendente" | "vencido";

function BoletoStatusBadge({ status }: { status: BoletoStatus }) {
  const map: Record<BoletoStatus, { cls: string; icon: React.ElementType; label: string }> = {
    pago: { cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, label: "Pago" },
    pendente: { cls: "bg-amber-100 text-amber-700", icon: Clock, label: "Pendente" },
    vencido: { cls: "bg-red-100 text-red-700", icon: AlertTriangle, label: "Vencido" },
  };
  const s = map[status] ?? map.pendente;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>
      <s.icon className="h-3 w-3" /> {s.label}
    </span>
  );
}

function LocatarioDashboard() {
  const dashFn = useServerFn(getLocatarioDashboard);
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: () => supabase.auth.getUser().then((r) => r.data.user),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["locatario-dashboard", session?.id],
    queryFn: () => dashFn({ data: { userId: session?.id ?? "" } }),
    enabled: !!session?.id,
  });

  const boletoPendente = data?.boletos?.find((b) => b.status === "pendente");

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-foreground">
          Portal do Locatário
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seu aluguel, boletos e chamados
        </p>
      </div>

      {/* Banner Próximo Vencimento */}
      {boletoPendente && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-900">Boleto pendente</p>
              <p className="text-sm text-amber-700">
                Vence em <strong>{boletoPendente.vencimento}</strong> · {formatBRL(boletoPendente.valor)}
              </p>
            </div>
          </div>
          <Link
            to="/portal/locatario/boletos"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            <CreditCard className="h-4 w-4" /> Pagar agora
          </Link>
        </div>
      )}

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Contrato",
            value: data?.contrato?.status === "ativo" ? "Ativo" : "—",
            sub: data?.contrato?.fim ? `Até ${data.contrato.fim}` : "",
            icon: FileText,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Próximo Boleto",
            value: data?.proximoVencimento ? formatBRL(data.proximoVencimento.valor) : "—",
            sub: data?.proximoVencimento?.data ?? "",
            icon: Calendar,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Boletos Pagos",
            value: String(data?.boletos?.filter((b) => b.status === "pago").length ?? "—"),
            sub: "Este ano",
            icon: CheckCircle2,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Chamados Abertos",
            value: String(data?.chamados?.length ?? 0),
            sub: "Em andamento",
            icon: Wrench,
            color: "text-purple-600 bg-purple-50",
          },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {c.label}
              </span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.color}`}>
                <c.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold text-foreground">
              {isLoading ? <span className="animate-pulse text-muted-foreground text-base">...</span> : c.value}
            </p>
            {c.sub && <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Histórico de Boletos */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-bold">Boletos Recentes</h2>
            </div>
            <Link
              to="/portal/locatario/boletos"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y">
            {(data?.boletos ?? []).map((b, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium">{b.mes}</p>
                  <p className="text-xs text-muted-foreground">Vence {b.vencimento}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatBRL(b.valor)}</span>
                  <BoletoStatusBadge status={b.status as BoletoStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dados do Contrato */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b p-5">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-bold">Meu Imóvel</h2>
            </div>
          </div>
          {data?.contrato ? (
            <div className="divide-y">
              {[
                { label: "Imóvel", value: data.contrato.imovel },
                { label: "Código", value: data.contrato.referencia },
                { label: "Início do Contrato", value: data.contrato.inicio },
                { label: "Fim do Contrato", value: data.contrato.fim },
                { label: "Valor do Aluguel", value: formatBRL(data.contrato.valor) },
                { label: "Status", value: data.contrato.status === "ativo" ? "✓ Ativo" : data.contrato.status },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhum contrato ativo encontrado
            </div>
          )}
          <div className="border-t p-4">
            <Link
              to="/portal/locatario/contrato"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <FileText className="h-4 w-4" /> Ver Contrato Completo
            </Link>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-display text-base font-bold">Ações Rápidas</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { to: "/portal/locatario/boletos", label: "2ª Via de Boleto", icon: CreditCard, color: "bg-amber-50 text-amber-600" },
            { to: "/portal/locatario/chamados", label: "Abrir Chamado", icon: Wrench, color: "bg-purple-50 text-purple-600" },
            { to: "/portal/locatario/documentos", label: "Meus Documentos", icon: FileText, color: "bg-blue-50 text-blue-600" },
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
