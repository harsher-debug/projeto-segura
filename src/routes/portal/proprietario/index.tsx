import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2, FileCheck2, FileText, Receipt, TrendingUp } from "lucide-react";
import {
  formatCurrency,
  ownerContracts,
  ownerProperties,
  ownerProposals,
  ownerTransfers,
} from "@/lib/portal-demo";

export const Route = createFileRoute("/portal/proprietario/")({
  component: ProprietarioDashboard,
});

function ProprietarioDashboard() {
  const projectedIncome = ownerTransfers
    .filter((transfer) => transfer.status === "Previsto")
    .reduce((total, transfer) => total + transfer.net, 0);

  const cards = [
    { label: "Imoveis administrados", value: ownerProperties.length, icon: Building2 },
    { label: "Contratos ativos", value: ownerContracts.filter((contract) => contract.status === "Ativo").length, icon: FileText },
    { label: "Propostas abertas", value: ownerProposals.length, icon: FileCheck2 },
    { label: "Proximo repasse", value: formatCurrency(projectedIncome), icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#e40016_0%,#8e1221_52%,#1c0f13_100%)] p-8 text-white shadow-2xl shadow-black/15">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f2d78a]">Portal do proprietario</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight">
          Sua carteira administrada pela Segura.
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-white/80">
          Acompanhe propostas recebidas, contratos, repasses e status dos seus imoveis em Canoas.
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

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-extrabold">Meus imoveis</h2>
              <p className="text-sm text-neutral-500">Status comercial e ocupacao.</p>
            </div>
            <Link to="/portal/proprietario/imoveis" className="inline-flex items-center gap-1 text-sm font-bold text-primary">
              Ver detalhes <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {ownerProperties.map((property) => (
              <div key={property.code} className="overflow-hidden rounded-xl border bg-[#fbfaf8]">
                <div className="aspect-[16/8] overflow-hidden">
                  <img src={property.image} alt={property.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">{property.status}</span>
                    <span className="text-xs font-bold text-neutral-500">Cod. {property.code}</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-extrabold">{property.title}</h3>
                  <p className="text-sm text-neutral-500">{property.location}</p>
                  <p className="mt-3 text-sm">
                    <strong>Ocupacao:</strong> {property.tenant}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-extrabold">Propostas recebidas</h2>
          </div>
          <div className="space-y-3">
            {ownerProposals.map((proposal) => (
              <div key={proposal.id} className="rounded-xl bg-[#fbfaf8] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{proposal.client}</p>
                  <span className="rounded-full bg-[#fff5dc] px-3 py-1 text-xs font-bold text-[#8e641a]">{proposal.status}</span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">{proposal.property}</p>
                <p className="mt-2 font-display text-xl font-extrabold text-primary">{formatCurrency(proposal.value)}</p>
                <p className="mt-1 text-xs text-neutral-500">{proposal.date}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-extrabold">Repasses</h2>
          </div>
          <div className="divide-y">
            {ownerTransfers.map((transfer) => (
              <div key={`${transfer.month}-${transfer.property}`} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-bold">{transfer.month}</p>
                  <p className="text-sm text-neutral-500">{transfer.property} - taxa {formatCurrency(transfer.fee)}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-extrabold">{formatCurrency(transfer.net)}</p>
                  <p className="text-xs text-neutral-500">{transfer.status}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-extrabold">Contratos</h2>
          </div>
          <div className="divide-y">
            {ownerContracts.map((contract) => (
              <div key={contract.id} className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-bold">{contract.id}</p>
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600">{contract.status}</span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">{contract.property} - {contract.tenant}</p>
                <p className="mt-1 text-xs text-neutral-500">{contract.period}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
