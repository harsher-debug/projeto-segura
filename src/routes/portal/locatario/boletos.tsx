import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/portal/locatario/boletos")({
  component: () => <div className="rounded-xl border bg-card p-10 text-center shadow-sm"><p className="font-display text-lg font-bold">Boletos</p><p className="mt-1 text-sm text-muted-foreground">Histórico de boletos em desenvolvimento</p></div>,
});
