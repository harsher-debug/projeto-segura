import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/portal/locatario/perfil")({
  component: () => <div className="rounded-xl border bg-card p-10 text-center shadow-sm"><p className="font-display text-lg font-bold">Meu Perfil</p><p className="mt-1 text-sm text-muted-foreground">Edição de perfil em desenvolvimento</p></div>,
});
