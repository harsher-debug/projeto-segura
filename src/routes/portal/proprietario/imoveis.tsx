import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2, FileCheck2, Receipt, UserRound } from "lucide-react";
import { formatCurrency, ownerProperties, ownerProposals, ownerTransfers } from "@/lib/portal-demo";

export const Route = createFileRoute("/portal/proprietario/imoveis")({
  component: ImoveisPage,
});

function ImoveisPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c7a45a]">Carteira administrada</p>
          <h1 className="font-display text-3xl font-extrabold">Meus imoveis</h1>
          <p className="text-sm text-muted-foreground">Status comercial, ocupacao e desempenho dos seus imoveis.</p>
        </div>
        <Link
          to="/portal/proprietario/financeiro"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/20"
        >
          Ver repasses <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <Building2 className="h-5 w-5 text-primary" />
          <p className="mt-4 text-xs font-bold uppercase text-neutral-500">Imoveis vinculados</p>
          <p className="font-display text-3xl font-extrabold">{ownerProperties.length}</p>
        </article>
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <FileCheck2 className="h-5 w-5 text-primary" />
          <p className="mt-4 text-xs font-bold uppercase text-neutral-500">Propostas abertas</p>
          <p className="font-display text-3xl font-extrabold">{ownerProposals.length}</p>
        </article>
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <Receipt className="h-5 w-5 text-primary" />
          <p className="mt-4 text-xs font-bold uppercase text-neutral-500">Ultimo repasse</p>
          <p className="font-display text-3xl font-extrabold">{formatCurrency(ownerTransfers[1]?.net ?? 0)}</p>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {ownerProperties.map((property) => {
          const proposal = ownerProposals.find((item) => item.property === property.title);

          return (
            <article key={property.code} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="aspect-[16/7] overflow-hidden bg-neutral-100">
                <img src={property.image} alt={property.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">{property.status}</span>
                  <span className="rounded-full bg-[#fff5dc] px-3 py-1 text-xs font-bold text-[#8e641a]">Cod. {property.code}</span>
                </div>

                <h2 className="mt-4 font-display text-2xl font-extrabold">{property.title}</h2>
                <p className="text-sm text-neutral-500">{property.location}</p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-[#fbfaf8] p-4">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-500">
                      <UserRound className="h-4 w-4 text-primary" />
                      Ocupacao
                    </p>
                    <p className="mt-2 font-bold">{property.tenant}</p>
                  </div>
                  <div className="rounded-xl bg-[#fbfaf8] p-4">
                    <p className="text-xs font-bold uppercase text-neutral-500">Valor administrado</p>
                    <p className="mt-2 font-display text-xl font-extrabold text-primary">
                      {property.rent > 0 ? formatCurrency(property.rent) : "Venda"}
                    </p>
                  </div>
                </div>

                {proposal && (
                  <div className="mt-4 rounded-xl border border-[#f1dfb2] bg-[#fffaf0] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">Proposta em andamento</p>
                      <span className="text-sm font-extrabold text-primary">{formatCurrency(proposal.value)}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">
                      {proposal.client} - {proposal.status}
                    </p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
