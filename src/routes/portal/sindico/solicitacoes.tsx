import { createFileRoute } from "@tanstack/react-router";
import { Clock, Wrench } from "lucide-react";

export const Route = createFileRoute("/portal/sindico/solicitacoes")({
  component: SindicoSolicitacoesPage,
});

const solicitacoes = [
  { codigo: "#S1201", assunto: "Manutencao elevador social", prioridade: "Alta", data: "Hoje" },
  { codigo: "#S1198", assunto: "Limpeza garagem subsolo", prioridade: "Media", data: "Ontem" },
  { codigo: "#S1187", assunto: "Orcamento pintura fachada", prioridade: "Baixa", data: "22/07/2026" },
];

function SindicoSolicitacoesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Solicitacoes</h1>
        <p className="text-sm text-muted-foreground">Chamados condominiais acompanhados pela administracao.</p>
      </div>

      <section className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b p-5">
          <Wrench className="h-5 w-5 text-primary" />
          <h2 className="font-display text-base font-bold">Fila atual</h2>
        </div>
        <div className="divide-y">
          {solicitacoes.map((item) => (
            <div key={item.codigo} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-sm font-bold">{item.codigo} - {item.assunto}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {item.data}
                </p>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                {item.prioridade}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
