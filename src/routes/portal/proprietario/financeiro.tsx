import { createFileRoute } from "@tanstack/react-router";
import { Download, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal/proprietario/financeiro")({
  component: FinanceiroPage,
});

const repasses = [
  { data: "05/08/2026", imovel: "Ap. Centro", aluguel: 1200, taxa: 120, liquido: 1080, status: "Previsto" },
  { data: "05/07/2026", imovel: "Casa Mathias Velho", aluguel: 1800, taxa: 180, liquido: 1620, status: "Pago" },
  { data: "05/06/2026", imovel: "Ap. Centro", aluguel: 1200, taxa: 120, liquido: 1080, status: "Pago" },
];

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function FinanceiroPage() {
  const total = repasses.reduce((sum, item) => sum + item.liquido, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Financeiro</h1>
        <p className="text-sm text-muted-foreground">Extratos, repasses e previsao de recebimentos.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <DollarSign className="h-5 w-5 text-primary" />
          <p className="mt-3 text-xs uppercase text-muted-foreground">Liquido listado</p>
          <p className="font-display text-2xl font-extrabold">{brl(total)}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <TrendingUp className="h-5 w-5 text-primary" />
          <p className="mt-3 text-xs uppercase text-muted-foreground">Proximo repasse</p>
          <p className="font-display text-2xl font-extrabold">05/08</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <Download className="h-5 w-5 text-primary" />
          <p className="mt-3 text-xs uppercase text-muted-foreground">Informe</p>
          <Button className="mt-2 w-full" variant="outline">Baixar extrato</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Imovel</th>
              <th className="p-3">Aluguel</th>
              <th className="p-3">Taxa</th>
              <th className="p-3">Liquido</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {repasses.map((repasse) => (
              <tr key={`${repasse.data}-${repasse.imovel}`} className="border-b last:border-0">
                <td className="p-3">{repasse.data}</td>
                <td className="p-3 text-muted-foreground">{repasse.imovel}</td>
                <td className="p-3">{brl(repasse.aluguel)}</td>
                <td className="p-3">{brl(repasse.taxa)}</td>
                <td className="p-3 font-medium">{brl(repasse.liquido)}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${repasse.status === "Pago" ?"bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                    {repasse.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
