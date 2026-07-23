import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { listLeads, updateLeadStatus, deleteLead } from "@/lib/crm.functions";
import { formatBRL } from "@/lib/format";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/leads")({
  component: LeadsPage,
});

const STATUS = ["novo", "contato", "visita", "proposta", "fechado", "perdido"] as const;

function LeadsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listLeads);
  const statusFn = useServerFn(updateLeadStatus);
  const delFn = useServerFn(deleteLead);
  const { data } = useQuery({ queryKey: ["leads"], queryFn: () => listFn() });

  const mutStatus = useMutation({
    mutationFn: (v: { id: string; status: (typeof STATUS)[number] }) => statusFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
  const mutDel = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Lead removido"); qc.invalidateQueries({ queryKey: ["leads"] }); },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Leads</h1>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Nome</th><th className="p-3">Contato</th>
              <th className="p-3">Imóvel</th><th className="p-3">Valor</th>
              <th className="p-3">Status</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((l: any) => (
              <tr key={l.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{l.nome}</td>
                <td className="p-3 text-muted-foreground">{l.telefone || l.email || "—"}</td>
                <td className="p-3 text-muted-foreground">{l.imoveis?.referencia  ? `Cód. ${l.imoveis.referencia}` : "—"}</td>
                <td className="p-3">{l.valor_estimado  ? formatBRL(l.valor_estimado) : "—"}</td>
                <td className="p-3">
                  <Select value={l.status} onValueChange={(v) => mutStatus.mutate({ id: l.id, status: v as any })}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <Button variant="ghost" size="icon" onClick={() => mutDel.mutate(l.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {data && data.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhum lead ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}