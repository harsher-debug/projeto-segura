import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/portal/locatario/contrato")({
  component: () => <div className="rounded-xl border bg-card p-10 text-center shadow-sm"><p className="font-display text-lg font-bold">Contrato</p><p className="mt-1 text-sm text-muted-foreground">Visualização de contrato em desenvolvimento</p></div>,
});
