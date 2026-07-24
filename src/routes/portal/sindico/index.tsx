import { createFileRoute } from "@tanstack/react-router";
import { Building2, ClipboardList, Users, Wrench } from "lucide-react";

export const Route = createFileRoute("/portal/sindico/")({
  component: SindicoDashboard,
});

function SindicoDashboard() {
  const cards = [
    { label: "Condominios acompanhados", value: "3", icon: Building2 },
    { label: "Solicitacoes abertas", value: "8", icon: Wrench },
    { label: "Comunicados enviados", value: "12", icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-gradient-to-br from-primary via-red-700 to-neutral-950 p-8 text-white shadow-2xl shadow-black/15">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">Painel do sindico</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">Gestao condominial Segura</h1>
        <p className="mt-3 max-w-2xl text-base font-medium text-white/80">
          Acompanhe condominios, solicitacoes e comunicados em uma area controlada por permissao.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-6 text-sm text-neutral-500">{card.label}</p>
            <p className="font-display text-3xl font-extrabold">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-extrabold">Resumo de atendimento</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            "Assembleia do Condominio Centro marcada para 05/08/2026.",
            "Chamado de manutencao do bloco B em andamento.",
            "Prestacao de contas de julho aguardando revisao.",
            "Comunicado de limpeza enviado aos moradores.",
          ].map((item) => (
            <div key={item} className="rounded-md bg-neutral-50 px-4 py-3 text-sm">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
