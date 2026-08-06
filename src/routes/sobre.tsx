import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Users, Award, Home } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Quem Somos | Imobiliária Segura" },
      {
        name: "description",
        content:
          "Conheça a Imobiliária Segura: mais de 55 anos de experiência em locação e venda de imóveis em Canoas e região.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="border-b border-[#d6ad57]/75 bg-[linear-gradient(135deg,#bd101d_0%,#751522_52%,#211014_100%)] py-16 text-center text-white shadow-[0_10px_24px_rgba(56,13,18,0.2)]">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">
            Quem Somos
          </h1>
          <p className="mt-3 text-white/80">
            Há mais de 55 anos cuidando da sua locação e venda de imóveis com
            segurança, agilidade e praticidade em Canoas e região.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Award, n: "+55", l: "anos de mercado" },
            { icon: Home, n: "+574", l: "imóveis disponíveis" },
            { icon: Users, n: "Equipe", l: "experiente e dedicada" },
            { icon: ShieldCheck, n: "Segurança", l: "em cada negociação" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <s.icon className="mx-auto h-7 w-7 text-primary" />
              <p className="mt-2 font-display text-2xl font-extrabold">{s.n}</p>
              <p className="text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-4 text-muted-foreground">
          <p>
            A Imobiliária Segura é referência em Canoas e na região
            metropolitana de Porto Alegre. Ao longo de mais de cinco décadas,
            construímos uma reputação sólida baseada na confiança, transparência
            e proximidade com nossos clientes.
          </p>
          <p>
            Oferecemos um portfólio amplo de imóveis para locação e venda —
            apartamentos, casas, salas comerciais, lojas e muito mais — sempre
            com o atendimento atencioso de uma equipe que entende do mercado
            local.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Button asChild size="lg">
            <Link to="/alugar">Ver imóveis disponíveis</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
