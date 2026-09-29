import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2, FileCheck2, KeyRound, Receipt, TrendingUp, Users } from "lucide-react";
import { adminAccesses, adminBills, adminContracts, adminProperties, adminProposals, brl } from "@/lib/admin-demo";

export const Route = createFileRoute("/_authenticated/app/dashboard")({
  component: Dashboard,
});

const stats = [
  { label: "Imóveis publicados", value: adminProperties.length, icon: Building2, detail: "3 bairros com maior procura" },
  { label: "Contratos ativos", value: adminContracts.filter((item) => item.status === "Ativo").length, icon: FileCheck2, detail: "1 renovação pendente" },
  { label: "Boletos em aberto", value: adminBills.filter((item) => item.status === "Aberto").length, icon: Receipt, detail: "R$ 3.980 previstos" },
  { label: "Acessos liberados", value: adminAccesses.length, icon: KeyRound, detail: "Locatários, proprietários e síndicos" },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#e40016_0%,#8e1221_48%,#211014_100%)] p-7 text-white shadow-2xl shadow-[#8e1221]/20">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#f2d78a]">Painel administrativo</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight">
              Operação do site, clientes e carteira em tempo real.
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-white/78">
              Simulação completa para acompanhar imóveis publicados, propostas, boletos, contratos e acessos dos clientes.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-[#f2d78a]" />
              <p className="font-display text-lg font-extrabold">Resumo de hoje</p>
            </div>
            <div className="mt-5 space-y-3">
              {[
                "2 propostas aguardando retorno",
                "3 visitas confirmadas para esta semana",
                "2 boletos em aberto para acompanhamento",
              ].map((item) => (
                <div key={item} className="rounded-xl bg-white/12 px-4 py-3 text-sm font-bold text-white/88">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-neutral-500">{stat.label}</p>
                <p className="mt-2 font-display text-4xl font-extrabold">{stat.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-[#a50f1b]">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-sm text-neutral-500">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-extrabold">Imóveis em destaque</h3>
              <p className="text-sm text-neutral-500">Carteira simulada para gestao do site.</p>
            </div>
            <Link to="/app/imoveis" className="inline-flex items-center gap-1 text-sm font-bold text-[#a50f1b]">
              Ver todos <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {adminProperties.slice(0, 4).map((property) => (
              <Link key={property.id} to="/app/imoveis" className="group overflow-hidden rounded-xl border bg-[#fbfaf8] transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="aspect-[16/8] overflow-hidden bg-neutral-100">
                  <img src={property.image} alt={property.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#a50f1b] px-2.5 py-1 text-xs font-bold text-white">{property.purpose}</span>
                    <span className="text-xs font-bold text-neutral-500">Código {property.code}</span>
                  </div>
                  <h4 className="mt-3 line-clamp-1 font-display text-lg font-extrabold">{property.title}</h4>
                  <p className="text-sm text-neutral-500">{property.neighborhood}, {property.city}</p>
                  <p className="mt-3 text-xl font-extrabold text-[#d71920]">{brl(property.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-display text-xl font-extrabold">Propostas recentes</h3>
            <div className="mt-4 space-y-3">
              {adminProposals.map((proposal) => (
                <div key={proposal.id} className="rounded-xl bg-[#fbfaf8] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{proposal.client}</p>
                    <span className="rounded-full bg-[#fff5dc] px-2.5 py-1 text-xs font-bold text-[#8e641a]">{proposal.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">Cod. {proposal.code} - {proposal.property}</p>
                  <p className="mt-2 font-display text-lg font-extrabold">{brl(proposal.value)}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-display text-xl font-extrabold">Acessos recentes</h3>
            <div className="mt-4 space-y-3">
              {adminAccesses.slice(0, 3).map((access) => (
                <div key={access.name} className="flex items-center gap-3 rounded-xl bg-[#fbfaf8] p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a50f1b] text-sm font-extrabold text-white">
                    {access.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{access.name}</p>
                    <p className="text-xs text-neutral-500">{access.profile} - {access.lastAccess}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-extrabold">Contratos ativos</h3>
            <Users className="h-5 w-5 text-[#a50f1b]" />
          </div>
          <div className="divide-y">
            {adminContracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-bold">{contract.id}</p>
                  <p className="text-sm text-neutral-500">{contract.client} - Código {contract.code}</p>
                </div>
                <p className="font-bold">{brl(contract.value)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-extrabold">Boletos do mês</h3>
            <Receipt className="h-5 w-5 text-[#a50f1b]" />
          </div>
          <div className="divide-y">
            {adminBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-bold">{bill.client}</p>
                  <p className="text-sm text-neutral-500">{bill.property} - vence {bill.due}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${bill.status === "Pago" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-[#a50f1b]"}`}>
                  {bill.status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
