import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, FileCheck2, MessageCircle } from "lucide-react";
import { adminProposals, brl } from "@/lib/admin-demo";

export const Route = createFileRoute("/_authenticated/app/propostas")({
  component: PropostasPage,
});

function PropostasPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c7a45a]">Negociacao</p>
        <h1 className="font-display text-3xl font-extrabold">Propostas</h1>
        <p className="text-sm text-neutral-500">Simule propostas recebidas pelo site, WhatsApp e portal.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {adminProposals.map((proposal) => (
          <article key={proposal.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-[#a50f1b]">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-[#f7f5f2] px-3 py-1 text-xs font-bold text-neutral-600">{proposal.channel}</span>
            </div>
            <h2 className="mt-5 font-display text-xl font-extrabold">{proposal.client}</h2>
            <p className="text-sm text-neutral-500">Cod. {proposal.code} - {proposal.property}</p>
            <p className="mt-4 font-display text-3xl font-extrabold text-[#d71920]">{brl(proposal.value)}</p>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#f7f5f2] p-3 text-sm font-bold">
              {proposal.status === "Enviada" ? <Clock className="h-4 w-4 text-[#c7a45a]" /> : proposal.status === "Em negociacao" ? <MessageCircle className="h-4 w-4 text-[#a50f1b]" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              {proposal.status}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
