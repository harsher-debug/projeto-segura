import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ListingPage } from "@/components/site/ListingPage";

export const Route = createFileRoute("/imoveis/recentes")({
  head: () => ({
    meta: [
      { title: "Imóveis Adicionados Recentemente | Imobiliária Segura" },
      {
        name: "description",
        content: "Confira os imóveis mais recentes cadastrados pela Imobiliária Segura nos últimos 30 dias.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <ListingPage
        apenasRecentes
        titulo="Adicionados Recentemente"
        subtitulo="Imóveis cadastrados pela Imobiliária Segura nos últimos 30 dias."
      />
    </SiteLayout>
  );
}
