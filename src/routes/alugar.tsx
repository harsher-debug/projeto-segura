import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ListingPage } from "@/components/site/ListingPage";

export const Route = createFileRoute("/alugar")({
  head: () => ({
    meta: [
      { title: "Imóveis para Alugar em Canoas | Imobiliária Segura" },
      {
        name: "description",
        content:
          "Encontre apartamentos, casas e salas para alugar em Canoas e região com a Imobiliária Segura. Filtre por bairro, tipo, preço e mais.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <ListingPage
        finalidade="locacao"
        titulo="Imóveis para Alugar"
        subtitulo="Ofertas selecionadas e uma equipe experiente para uma locação segura."
      />
    </SiteLayout>
  );
}