import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/portal/proprietario/financeiro")({
  component: () => <div className="rounded-xl border bg-card p-10 text-center shadow-sm"><p className="font-display text-lg font-bold">Financeiro</p><p className="mt-1 text-sm text-muted-foreground">Extratos e repasses em desenvolvimento</p></div>,
});
