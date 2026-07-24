import { createFileRoute } from "@tanstack/react-router";
import { Clock, MessageSquare, Wrench } from "lucide-react";
import { condoRequests } from "@/lib/portal-demo";

export const Route = createFileRoute("/portal/sindico/solicitacoes")({
  component: SindicoSolicitacoesPage,
});

function SindicoSolicitacoesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Solicitacoes</h1>
        <p className="text-sm text-muted-foreground">Chamados condominiais acompanhados pela administracao.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {condoRequests.map((item) => (
          <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-primary">
                <Wrench className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600">
                {item.status}
              </span>
            </div>
            <p className="mt-5 text-sm font-bold text-primary">{item.id}</p>
            <h2 className="mt-1 font-display text-xl font-extrabold">{item.subject}</h2>
            <p className="mt-2 text-sm text-neutral-500">{item.category}</p>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-[#fbfaf8] p-3 text-sm">
              <span className="flex items-center gap-2 text-neutral-600">
                <Clock className="h-4 w-4 text-primary" />
                {item.date}
              </span>
              <button className="inline-flex items-center gap-2 font-bold text-primary">
                <MessageSquare className="h-4 w-4" />
                Ver conversa
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
