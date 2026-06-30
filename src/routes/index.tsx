import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Search, ShieldCheck, Clock, ThumbsUp, ArrowRight,
  Star, Building2, Users, Home, TrendingUp,
  ChevronLeft, ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ImovelCard } from "@/components/site/ImovelCard";
import { getDestaques, listImoveis } from "@/lib/imoveis.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "Imobiliária Segura | Imóveis para Alugar e Comprar em Canoas" },
      {
        name: "description",
        content:
          "Há mais de 55 anos, a Imobiliária Segura oferece aluguel e venda de imóveis em Canoas e região metropolitana com segurança e atendimento experiente.",
      },
    ],
  }),
  component: Index,
} as Parameters<typeof createFileRoute<"/", {}, {}>>[0]));

function Carrossel({ items }: { items: any[] }) {
  const [idx, setIdx] = useState(0);
  const perPage = 4;
  const max = Math.max(0, items.length - perPage);

  const visible = items.slice(idx, idx + perPage);
  while (visible.length < perPage) visible.push(null);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((imovel, i) =>
          imovel ? (
            <ImovelCard key={imovel.id} imovel={imovel} />
          ) : (
            <div key={`empty-${i}`} />
          )
        )}
      </div>
      {items.length > perPage && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full border bg-card shadow-sm transition hover:bg-muted disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">
            {idx + 1}–{Math.min(idx + perPage, items.length)} de {items.length}
          </span>
          <button
            onClick={() => setIdx((i) => Math.min(max, i + 1))}
            disabled={idx >= max}
            className="flex h-9 w-9 items-center justify-center rounded-full border bg-card shadow-sm transition hover:bg-muted disabled:opacity-30"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function Index() {
  const [finalidade, setFinalidade] = useState<"locacao" | "venda">("locacao");
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();
  const destaquesFn = useServerFn(getDestaques);
  const listFn = useServerFn(listImoveis);

  const { data: destaquesLocacao } = useQuery({
    queryKey: ["destaques", "locacao"],
    queryFn: () => destaquesFn({ data: { finalidade: "locacao", limit: 8 } }),
  });

  const { data: destaquesVenda } = useQuery({
    queryKey: ["destaques", "venda"],
    queryFn: () => destaquesFn({ data: { finalidade: "venda", limit: 8 } }),
  });

  const { data: recentes } = useQuery({
    queryKey: ["recentes-home"],
    queryFn: () => listFn({ data: { ordem: "recentes", pageSize: 8, page: 1 } }),
  });

  const irParaBusca = () => {
    navigate({ to: finalidade === "venda" ? "/comprar" : "/alugar" });
  };

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative min-h-[520px] md:min-h-[600px]">
        <img
          src={heroImg}
          alt="Imóveis em Canoas"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
        <div className="relative mx-auto flex max-w-7xl flex-col px-4 py-20 md:py-28">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
            <ShieldCheck className="h-3.5 w-3.5" /> 55 anos de tradição em Canoas
          </span>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
            Encontre seu próximo imóvel com segurança
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/80 md:text-lg">
            Aluguel e venda de imóveis em Canoas e região metropolitana, com uma equipe experiente do seu lado.
          </p>

          <div className="mt-8 w-full max-w-2xl rounded-2xl bg-background/97 p-5 shadow-2xl">
            <div className="mb-4 inline-flex rounded-xl bg-muted p-1">
              {(["locacao", "venda"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFinalidade(f)}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                    finalidade === f
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "locacao" ? "Alugar" : "Comprar"}
                </button>
              ))}
            </div>
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => { e.preventDefault(); irParaBusca(); }}
            >
              <Input
                placeholder="Bairro, tipo de imóvel ou código..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="h-12 text-base"
              />
              <Button type="submit" size="lg" className="h-12 bg-primary px-6 font-bold hover:bg-primary/90">
                <Search className="mr-2 h-4 w-4" /> Buscar Imóveis
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-secondary text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px md:grid-cols-4">
          {[
            { label: "Anos de mercado", value: "55+", icon: Star },
            { label: "Imóveis administrados", value: "500+", icon: Building2 },
            { label: "Clientes atendidos", value: "10mil+", icon: Users },
            { label: "Imóveis locados", value: "300+", icon: Home },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 px-6 py-8 text-center">
              <s.icon className="mb-1 h-6 w-6 text-primary" />
              <span className="font-display text-3xl font-extrabold">{s.value}</span>
              <span className="text-xs font-medium uppercase tracking-wider text-white/60">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Diferenciais */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Segurança Jurídica", desc: "Contratos elaborados por especialistas, com total respaldo legal." },
            { icon: Clock, title: "Gestão Completa", desc: "Cuidamos de tudo, do anúncio à administração do contrato." },
            { icon: ThumbsUp, title: "Atendimento Especializado", desc: "Equipe experiente e dedicada para realizar o seu negócio." },
          ].map((v) => (
            <div key={v.title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <v.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold">{v.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Adicionados Recentemente */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <TrendingUp className="h-3.5 w-3.5" /> Novidades
            </span>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-foreground md:text-3xl">
              Adicionados Recentemente
            </h2>
            <p className="text-sm text-muted-foreground">Imóveis cadastrados nos últimos 30 dias</p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link to="/imoveis/recentes">
              Ver todos <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Carrossel items={recentes?.items ?? []} />
        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link to="/imoveis/recentes">Ver todos os recentes</Link>
          </Button>
        </div>
      </section>

      {/* Destaques — Locação */}
      <section className="bg-muted/40 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-foreground md:text-3xl">
                Imóveis para Alugar
              </h2>
              <p className="text-sm text-muted-foreground">Ofertas selecionadas para uma locação segura</p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/alugar">Ver todos <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <Carrossel items={destaquesLocacao ?? []} />
        </div>
      </section>

      {/* Destaques — Venda */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-foreground md:text-3xl">
                Imóveis à Venda
              </h2>
              <p className="text-sm text-muted-foreground">Encontre o imóvel ideal para comprar</p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/comprar">Ver todos <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <Carrossel items={destaquesVenda ?? []} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-16 text-center">
          <h2 className="font-display text-2xl font-extrabold text-white md:text-3xl">
            Quer anunciar ou alugar seu imóvel?
          </h2>
          <p className="max-w-xl text-white/70">
            Fale com a nossa equipe e descubra como é simples e seguro negociar com a Imobiliária Segura.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-primary font-bold hover:bg-primary/90">
              <Link to="/contato">Fale Conosco</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Link to="/sobre">Conheça a Segura</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
