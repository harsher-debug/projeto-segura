import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listVisitas } from "@/lib/crm.functions";

export const Route = createFileRoute("/_authenticated/app/visitas")({
  component: VisitasPage,
});

function VisitasPage() {
  const listFn = useServerFn(listVisitas);
  const { data } = useQuery({ queryKey: ["visitas"], queryFn: () => listFn() });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Visitas</h1>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Data</th><th className="p-3">Imóvel</th><th className="p-3">Cliente</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {(data ?? []).map((v: any) => (
              <tr key={v.id} className="border-b last:border-0">
                <td className="p-3">{new Date(v.data_visita).toLocaleString("pt-BR")}</td>
                <td className="p-3 text-muted-foreground">{v.imoveis?.referencia  ? `Cód. ${v.imoveis.referencia}` : "—"}</td>
                <td className="p-3 text-muted-foreground">{v.leads?.nome || "—"}</td>
                <td className="p-3">{v.status}</td>
              </tr>
            ))}
            {data && data.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Nenhuma visita agendada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}