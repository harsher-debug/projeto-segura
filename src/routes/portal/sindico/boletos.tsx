import { createFileRoute } from "@tanstack/react-router";
import { Download, Receipt } from "lucide-react";
import { condoBills, formatCurrency } from "@/lib/portal-demo";

export const Route = createFileRoute("/portal/sindico/boletos")({
  component: SindicoBoletosPage,
});

function SindicoBoletosPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Boletos do condomínio</h1>
        <p className="text-sm text-muted-foreground">Taxas condominiais, fundo de reserva e histórico de pagamento.</p>
      </div>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f5f2] text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="p-4">Referência</th>
              <th className="p-4">Vencimento</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {condoBills.map((bill) => (
              <tr key={bill.id}>
                <td className="p-4">
                  <p className="font-bold">{bill.title}</p>
                  <p className="text-xs text-neutral-500">{bill.id}</p>
                </td>
                <td className="p-4">{bill.due}</td>
                <td className="p-4 font-bold">{formatCurrency(bill.value)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${bill.status === "Pago" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-primary"}`}>
                    {bill.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold hover:bg-[#f7f5f2]">
                    <Download className="h-4 w-4" />
                    Baixar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-primary">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-extrabold">Segunda via e comprovantes</p>
            <p className="text-sm text-neutral-500">Esta área simula o download de boletos e comprovantes para o condômino.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
