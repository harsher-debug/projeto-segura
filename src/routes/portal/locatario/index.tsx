import { createFileRoute } from "@tanstack/react-router";
import { Bell, FileText, Receipt, Wrench } from "lucide-react";

export const Route = createFileRoute("/portal/locatario/")({
  component: ClienteDashboard,
});

function ClienteDashboard() {
  const atividades = [
    { texto: "Boleto de novembro disponível", data: "Hoje" },
    { texto: "Chamado #4523 respondido pela equipe técnica", data: "Ontem" },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl bg-gradient-to-br from-primary via-red-500 to-slate-950 p-8 text-white shadow-2xl shadow-black/15">
        <p className="text-xs font-bold uppercase tracking-widest text-white/75">Bem-vindo(a)</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">Olá, Cliente 👋</h1>
        <p className="mt-3 text-lg font-semibold text-white/85">
          Aqui está o resumo da sua conta hoje.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <p className="mt-6 text-sm text-neutral-500">Contratos ativos</p>
          <p className="font-display text-3xl font-extrabold">1</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-300">
            <Receipt className="h-5 w-5" />
          </div>
          <p className="mt-6 text-sm text-neutral-500">Próximo boleto</p>
          <p className="font-display text-3xl font-extrabold">R$ 4.800</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wrench className="h-5 w-5" />
          </div>
          <p className="mt-6 text-sm text-neutral-500">Chamados abertos</p>
          <p className="font-display text-3xl font-extrabold">2</p>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-extrabold">Últimas atividades</h2>
        </div>
        <div className="space-y-3">
          {atividades.map((atividade) => (
            <div
              key={atividade.texto}
              className="flex items-center justify-between rounded-md bg-neutral-50 px-4 py-3 text-sm"
            >
              <span>{atividade.texto}</span>
              <span className="text-neutral-500">{atividade.data}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
