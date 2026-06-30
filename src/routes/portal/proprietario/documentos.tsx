import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/portal/proprietario/documentos")({
  component: () => <div className="rounded-xl border bg-card p-10 text-center shadow-sm"><p className="font-display text-lg font-bold">Documentos</p><p className="mt-1 text-sm text-muted-foreground">Gestão de documentos em desenvolvimento</p></div>,
});
