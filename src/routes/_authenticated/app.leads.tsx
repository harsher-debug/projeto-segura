import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, UserRound } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/leads")({
  component: LeadsPage,
});

const leads = [
  { name: "Fernanda Lopes", contact: "(51) 99821-4432", interest: "Casa para comprar no Centro", status: "Proposta" },
  { name: "Rafael Souza", contact: "rafael@email.com", interest: "Apartamento ate R$ 320 mil", status: "Contato" },
  { name: "Camila Martins", contact: "(51) 98120-9921", interest: "Casa para locacao com garagem", status: "Visita" },
  { name: "Bruno Pereira", contact: "bruno@email.com", interest: "Sala comercial em Canoas", status: "Novo" },
];

function LeadsPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c7a45a]">Atendimento comercial</p>
        <h1 className="font-display text-3xl font-extrabold">Leads</h1>
        <p className="text-sm text-neutral-500">Contatos recebidos pelo site e canais digitais.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-4">
        {leads.map((lead) => (
          <article key={lead.name} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#a50f1b] text-white">
              <UserRound className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-lg font-extrabold">{lead.name}</h2>
            <p className="mt-1 text-sm text-neutral-500">{lead.interest}</p>
            <div className="mt-5 space-y-2">
              <p className="flex items-center gap-2 text-sm text-neutral-600">
                {lead.contact.includes("@") ? <Mail className="h-4 w-4 text-[#a50f1b]" /> : <Phone className="h-4 w-4 text-[#a50f1b]" />}
                {lead.contact}
              </p>
              <span className="inline-flex rounded-full bg-[#fff5dc] px-3 py-1 text-xs font-bold text-[#8e641a]">{lead.status}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
