import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Bell, Building2, ClipboardList, Receipt, Wrench } from "lucide-react";
import { condoBills, condoNotices, condoRequests, formatCurrency } from "@/lib/portal-demo";

export const Route = createFileRoute("/portal/sindico/")({
  component: SindicoDashboard,
});

function SindicoDashboard() {
  const openBills = condoBills.filter((bill) => bill.status === "Aberto");

  const cards = [
    { label: "Boletos em aberto", value: openBills.length, icon: Receipt },
    { label: "Solicitacoes abertas", value: condoRequests.filter((item) => item.status === "Em andamento").length, icon: Wrench },
    { label: "Comunicados novos", value: condoNotices.length, icon: Bell },
    { label: "Condominio", value: "Centro", icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#e40016_0%,#8e1221_52%,#1c0f13_100%)] p-8 text-white shadow-2xl shadow-black/15">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f2d78a]">Portal do condomino</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight">
          Condominio, boletos e atendimentos em um so lugar.
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-white/80">
          Simule a area do condomino com comunicados, solicitacoes, boletos e acompanhamento da administracao.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-neutral-500">{card.label}</p>
                <p className="mt-2 font-display text-3xl font-extrabold">{card.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-primary">
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-extrabold">Boletos do condominio</h2>
              <p className="text-sm text-neutral-500">Taxas e fundo de reserva.</p>
            </div>
            <Link to="/portal/sindico/boletos" className="inline-flex items-center gap-1 text-sm font-bold text-primary">
              Ver todos <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y">
            {condoBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-bold">{bill.title}</p>
                  <p className="text-xs text-neutral-500">Vence em {bill.due}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-extrabold">{formatCurrency(bill.value)}</p>
                  <span className={`text-xs font-bold ${bill.status === "Pago" ? "text-emerald-600" : "text-primary"}`}>{bill.status}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-extrabold">Comunicados e avisos</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {condoNotices.map((notice) => (
              <div key={notice.title} className="rounded-xl bg-[#fbfaf8] p-4">
                <span className="rounded-full bg-[#fff5dc] px-3 py-1 text-xs font-bold text-[#8e641a]">{notice.tag}</span>
                <h3 className="mt-4 font-display text-lg font-extrabold">{notice.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{notice.text}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-extrabold">Solicitacoes recentes</h2>
          </div>
          <Link to="/portal/sindico/solicitacoes" className="inline-flex items-center gap-1 text-sm font-bold text-primary">
            Acompanhar <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {condoRequests.map((request) => (
            <div key={request.id} className="rounded-xl border bg-[#fbfaf8] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">{request.id}</p>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600">{request.status}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-extrabold">{request.subject}</h3>
              <p className="mt-1 text-sm text-neutral-500">{request.category} - {request.date}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
