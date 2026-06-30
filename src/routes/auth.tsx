import { createFileRoute, redirect } from "@tanstack/react-router";

// Rota legada — redireciona para a nova tela de login unificada
export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    throw redirect({ to: "/entrar" });
  },
});
