import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal/proprietario/contratos")({
  component: ContratosPage,
});

const contratos = [
  { imovel: "Ap. Centro", locatario: "Maria S.", periodo: "01/01/2026 a 31/12/2026", status: "Ativo" },
  { imovel: "Casa Mathias Velho", locatario: "João P.", periodo: "01/03/2026 a 28/02/2027", status: "Ativo" },
];

function ContratosPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Contratos</h1>
        <p className="text-sm text-muted-foreground">Contratos vinculados aos seus imóveis.</p>
      </div>
      <div className="grid gap-4">
        {contratos.map((contrato) => (
          <div key={contrato.imovel} className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{contrato.imovel}</p>
              <p className="text-sm text-muted-foreground">{contrato.locatario} - {contrato.periodo}</p>
            </div>
            <span className="w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">{contrato.status}</span>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Baixar</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
