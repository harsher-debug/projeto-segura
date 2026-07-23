import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Download, FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal/locatario/contrato")({
  component: ContratoPage,
});

function ContratoPage() {
  const rows = [
    ["Imovel", "Apartamento - Centro, Canoas"],
    ["Codigo", "1041"],
    ["Locacao", "01/01/2026 a 31/12/2026"],
    ["Aluguel", "R$ 1.200,00"],
    ["Reajuste", "Anual pelo indice contratual"],
    ["Status", "Ativo"],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Contrato</h1>
          <p className="text-sm text-muted-foreground">Resumo do seu contrato de locacao.</p>
        </div>
        <Button><Download className="mr-2 h-4 w-4" /> Baixar PDF</Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b p-5">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-display text-base font-bold">Dados principais</h2>
          </div>
          <div className="divide-y">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-5 py-4">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-right text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <Home className="h-5 w-5 text-primary" />
            <p className="mt-3 font-semibold">Apartamento - Centro</p>
            <p className="text-sm text-muted-foreground">Canoas, RS</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <CalendarDays className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Proxima renovacao</p>
            <p className="font-display text-2xl font-extrabold">31/12/2026</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
