import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, FileText } from "lucide-react";
import { adminContracts, brl } from "@/lib/admin-demo";

export const Route = createFileRoute("/_authenticated/app/contratos")({
  component: ContratosPage,
});

function ContratosPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c7a45a]">Administração</p>
        <h1 className="font-display text-3xl font-extrabold">Contratos</h1>
        <p className="text-sm text-neutral-500">Contratos de locação e administração simulados para validação do portal.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {adminContracts.map((contract) => (
          <article key={contract.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-[#a50f1b]">
                <FileText className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-[#f7f5f2] px-3 py-1 text-xs font-bold text-neutral-600">{contract.status}</span>
            </div>
            <h2 className="mt-5 font-display text-xl font-extrabold">{contract.id}</h2>
            <p className="mt-1 text-sm text-neutral-500">Código {contract.code} - {contract.property}</p>
            <div className="mt-5 space-y-3 text-sm">
              <p><strong>Cliente:</strong> {contract.client}</p>
              <p><strong>Proprietário:</strong> {contract.owner}</p>
              <p><strong>Tipo:</strong> {contract.type}</p>
              <p className="flex items-center gap-2 text-neutral-600">
                <CalendarDays className="h-4 w-4 text-[#a50f1b]" />
                {contract.start} até {contract.end}
              </p>
            </div>
            <p className="mt-5 font-display text-2xl font-extrabold text-[#d71920]">{brl(contract.value)}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
