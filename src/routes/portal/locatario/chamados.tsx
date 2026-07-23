import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Plus, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/portal/locatario/chamados")({
  component: ChamadosPage,
});

const chamados = [
  { titulo: "Revisao do interfone", data: "18/07/2026", status: "Em analise" },
  { titulo: "Troca de lampada da garagem", data: "02/07/2026", status: "Resolvido" },
];

function ChamadosPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Chamados</h1>
          <p className="text-sm text-muted-foreground">Solicite manutencoes e acompanhe o atendimento.</p>
        </div>
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b p-5">
            <h2 className="font-display text-base font-bold">Solicitacoes</h2>
          </div>
          <div className="divide-y">
            {chamados.map((item) => (
              <div key={item.titulo} className="flex items-center gap-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Wrench className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.titulo}</p>
                  <p className="text-xs text-muted-foreground">Aberto em {item.data}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${item.status === "Resolvido" ?"bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                  {item.status === "Resolvido"  ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          <h2 className="font-display text-base font-bold">Novo chamado</h2>
        </div>
        <form className="space-y-3">
          <Input placeholder="Assunto" />
          <Input placeholder="Comodo ou area" />
          <Textarea rows={5} placeholder="Descreva o problema" />
          <Button className="w-full" type="button">Enviar chamado</Button>
        </form>
      </aside>
    </div>
  );
}
