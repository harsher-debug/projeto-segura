import { createFileRoute } from "@tanstack/react-router";
import { Download, CreditCard, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal/locatario/boletos")({
  component: BoletosPage,
});

const boletos = [
  { mes: "Agosto/2026", vencimento: "10/08/2026", valor: 1200, status: "Pendente" },
  { mes: "Julho/2026", vencimento: "10/07/2026", valor: 1200, status: "Pago" },
  { mes: "Junho/2026", vencimento: "10/06/2026", valor: 1200, status: "Pago" },
  { mes: "Maio/2026", vencimento: "10/05/2026", valor: 1200, status: "Pago" },
];

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function BoletosPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Boletos</h1>
        <p className="text-sm text-muted-foreground">Acompanhe pagamentos e baixe segundas vias.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm md:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="font-display text-base font-bold">Histórico</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-3">Mês</th>
                  <th className="py-3">Vencimento</th>
                  <th className="py-3">Valor</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {boletos.map((boleto) => (
                  <tr key={boleto.mes} className="border-b last:border-0">
                    <td className="py-3 font-medium">{boleto.mes}</td>
                    <td className="py-3 text-muted-foreground">{boleto.vencimento}</td>
                    <td className="py-3">{formatBRL(boleto.valor)}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${boleto.status === "Pago" ?"bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {boleto.status === "Pago"  ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {boleto.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant={boleto.status === "Pago" ?"outline" : "default"}>
                        <Download className="mr-1 h-4 w-4" /> Baixar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-muted-foreground">Próximo vencimento</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-primary">10/08</p>
          <p className="mt-1 text-sm text-muted-foreground">Agosto/2026 - {formatBRL(1200)}</p>
          <Button className="mt-5 w-full">Gerar 2ª via</Button>
        </aside>
      </div>
    </div>
  );
}
