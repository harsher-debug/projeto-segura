import { createFileRoute } from "@tanstack/react-router";
import { Download, Receipt } from "lucide-react";
import { adminBills, brl } from "@/lib/admin-demo";

export const Route = createFileRoute("/_authenticated/app/boletos")({
  component: BoletosPage,
});

function BoletosPage() {
  const openTotal = adminBills
    .filter((bill) => bill.status === "Aberto")
    .reduce((total, bill) => total + bill.value, 0);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c7a45a]">Financeiro</p>
        <h1 className="font-display text-3xl font-extrabold">Boletos</h1>
        <p className="text-sm text-neutral-500">Acompanhamento de pagamentos, vencimentos e segunda via.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-neutral-500">Em aberto</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-[#d71920]">{brl(openTotal)}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-neutral-500">Boletos pagos</p>
          <p className="mt-2 font-display text-3xl font-extrabold">{adminBills.filter((bill) => bill.status === "Pago").length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-neutral-500">Próximo vencimento</p>
          <p className="mt-2 font-display text-3xl font-extrabold">10/08</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f5f2] text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="p-4">Boleto</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Imóvel</th>
              <th className="p-4">Vencimento</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {adminBills.map((bill) => (
              <tr key={bill.id}>
                <td className="p-4 font-bold">{bill.id}</td>
                <td className="p-4 text-neutral-600">{bill.client}</td>
                <td className="p-4 text-neutral-600">{bill.property}</td>
                <td className="p-4">{bill.due}</td>
                <td className="p-4 font-bold">{brl(bill.value)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${bill.status === "Pago" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-[#a50f1b]"}`}>
                    {bill.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold hover:bg-[#f7f5f2]">
                    <Download className="h-4 w-4" />
                    Segunda via
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
