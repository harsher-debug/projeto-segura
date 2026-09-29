import { createFileRoute } from "@tanstack/react-router";
import { Building2, ClipboardList, Receipt, Users } from "lucide-react";

export const Route = createFileRoute("/portal/sindico/condominios")({
  component: SindicoCondominiosPage,
});

function SindicoCondominiosPage() {
  const cards = [
    { label: "Unidades", value: "48", icon: Building2 },
    { label: "Moradores ativos", value: "112", icon: Users },
    { label: "Boletos do mês", value: "46", icon: Receipt },
    { label: "Comunicados", value: "3", icon: ClipboardList },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Condomínio Residencial Centro</h1>
        <p className="text-sm text-muted-foreground">Resumo de unidades, moradores e operação condominial.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-primary">
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-5 text-xs font-bold uppercase text-neutral-500">{card.label}</p>
            <p className="font-display text-3xl font-extrabold">{card.value}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-extrabold">Dados do condomínio</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ["Endereço", "Rua Tiradentes, 421 - Centro, Canoas"],
            ["Administradora", "Segura Imobiliária"],
            ["Síndico", "João Henrique"],
            ["Próxima assembleia", "05/08/2026 às 19h"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-[#fbfaf8] p-4">
              <p className="text-xs font-bold uppercase text-neutral-500">{label}</p>
              <p className="mt-1 font-bold">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
