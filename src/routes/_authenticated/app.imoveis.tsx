import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listImoveisAdmin, toggleImovelAtivo } from "@/lib/crm.functions";
import { formatBRL, titleCase } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/app/imoveis")({
  component: ImoveisPage,
});

function ImoveisPage() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const listFn = useServerFn(listImoveisAdmin);
  const toggleFn = useServerFn(toggleImovelAtivo);
  const { data } = useQuery({
    queryKey: ["imoveis-admin", busca],
    queryFn: () => listFn({ data: { busca: busca || undefined } }),
  });
  const mut = useMutation({
    mutationFn: (v: { id: string; ativo: boolean }) => toggleFn({ data: v }),
    onSuccess: () => { toast.success("Atualizado"); qc.invalidateQueries({ queryKey: ["imoveis-admin"] }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold">Imóveis</h1>
        <Input className="max-w-xs" placeholder="Buscar imóvel..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Imóvel</th><th className="p-3">Tipo</th>
              <th className="p-3">Local</th><th className="p-3">Preço</th>
              <th className="p-3">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((i: any) => (
              <tr key={i.id} className="border-b last:border-0">
                <td className="p-3">
                  <p className="font-medium">{titleCase(i.titulo)}</p>
                  <p className="text-xs text-muted-foreground">Cód. {i.referencia}</p>
                </td>
                <td className="p-3 text-muted-foreground">{i.tipo}</td>
                <td className="p-3 text-muted-foreground">{titleCase([i.bairro, i.cidade].filter(Boolean).join(", "))}</td>
                <td className="p-3">{formatBRL(i.preco)}</td>
                <td className="p-3">
                  <Switch checked={i.ativo} onCheckedChange={(c) => mut.mutate({ id: i.id, ativo: c })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}