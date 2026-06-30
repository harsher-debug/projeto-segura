import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos | Imobiliária Segura" }] }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Heart className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 font-display text-2xl font-extrabold">
          Seus imóveis favoritos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Faça login na Área do Cliente para salvar e acompanhar seus imóveis
          preferidos.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild><Link to="/auth">Entrar</Link></Button>
          <Button asChild variant="outline"><Link to="/alugar">Ver imóveis</Link></Button>
        </div>
      </div>
    </SiteLayout>
  );
}