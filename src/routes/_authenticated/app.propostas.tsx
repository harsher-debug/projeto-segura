import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPropostas } from "@/lib/crm.functions";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/propostas")({
  component: PropostasPage,
});

function PropostasPage() {
  const listFn = useServerFn(listPropostas);
  const { data } = useQuery({ queryKey: ["propostas"], queryFn: () => listFn() });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Propostas</h1>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Imóvel</th><th className="p-3">Cliente</th><th className="p-3">Valor</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {(data ?? []).map((p: any) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3 text-muted-foreground">{p.imoveis?.referencia  ? `Cód. ${p.imoveis.referencia}` : "—"}</td>
                <td className="p-3 text-muted-foreground">{p.leads?.nome || "—"}</td>
                <td className="p-3 font-medium">{formatBRL(p.valor)}</td>
                <td className="p-3">{p.status}</td>
              </tr>
            ))}
            {data && data.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Nenhuma proposta registrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}