import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ListingPage } from "@/components/site/ListingPage";

export const Route = createFileRoute("/comprar")({
  head: () => ({
    meta: [
      { title: "Imóveis à Venda em Canoas | Imobiliária Segura" },
      {
        name: "description",
        content:
          "Imóveis à venda em Canoas e região com a Imobiliária Segura. Apartamentos, casas, terrenos e mais.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <ListingPage
        finalidade="venda"
        titulo="Imóveis à Venda"
        subtitulo="Realize o sonho do imóvel próprio com quem entende do mercado."
      />
    </SiteLayout>
  );
}