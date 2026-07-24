import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  KeyRound,
  MapPin,
  Search,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ImovelCard, type ImovelResumo } from "@/components/site/ImovelCard";
import { getDestaques, getSearchSuggestions } from "@/lib/imoveis.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImg from "@/assets/hero.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Segura Imobiliária | Imóveis em Canoas" },
      {
        name: "description",
        content: "Imóveis para alugar e comprar em Canoas com a Segura Imobiliária.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [finalidade, setFinalidade] = useState<"locacao" | "venda" | "condominios">("locacao");
  const [busca, setBusca] = useState("");
  const [buscaFocus, setBuscaFocus] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const destaquesFn = useServerFn(getDestaques);
  const suggestionsFn = useServerFn(getSearchSuggestions);

  const { data: destaquesLocacao } = useQuery({
    queryKey: ["destaques-home", "locacao"],
    queryFn: () => destaquesFn({ data: { finalidade: "locacao", limit: 8 } }),
  });

  const { data: destaquesVenda } = useQuery({
    queryKey: ["destaques-home", "venda"],
    queryFn: () => destaquesFn({ data: { finalidade: "venda", limit: 8 } }),
  });

  const locacao = (destaquesLocacao ?? []) as ImovelResumo[];
  const venda = (destaquesVenda ?? []) as ImovelResumo[];
  const vendaHome = venda.length > 0 ? venda : buildVendaFallback(locacao);
  const recentes = [...vendaHome, ...locacao].slice(0, 8);
  const carouselItems = recentes.length > 0 ? [...recentes, ...recentes] : [];
  const termoSugestao = busca.trim();

  const { data: sugestoes = [] } = useQuery({
    queryKey: ["search-suggestions", finalidade, termoSugestao],
    queryFn: () =>
      suggestionsFn({
        data: {
          finalidade: finalidade === "condominios" ? undefined : finalidade,
          termo: termoSugestao,
          limit: 8,
        },
      }),
    enabled: termoSugestao.length >= 2,
  });

  const showSugestoes = buscaFocus && termoSugestao.length >= 2 && sugestoes.length > 0;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    buscarPorTermo(busca);
  };

  const buscarPorTermo = (valor: string) => {
    const termo = finalidade === "condominios" ? valor || "condominio" : valor;
    navigate({
      to: finalidade === "venda" ? "/comprar" : "/alugar",
      search: termo ? { busca: termo } : undefined,
    });
  };

  const scrollCarousel = (direction: "prev" | "next") => {
    carouselRef.current?.scrollBy({
      left: direction === "next" ? 370 : -370,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || recentes.length === 0) return;

    const step = () => {
      const resetPoint = carousel.scrollWidth / 2;
      if (carousel.scrollLeft >= resetPoint - 390) {
        carousel.scrollTo({ left: 0 });
      }
      carousel.scrollBy({ left: 370, behavior: "smooth" });
    };

    const timer = window.setInterval(step, 1200);
    return () => window.clearInterval(timer);
  }, [recentes.length]);

  return (
    <SiteLayout>
      <section className="relative min-h-[560px] overflow-hidden bg-neutral-950">
        <img
          src={heroImg}
          alt="Imóveis em Canoas"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pt-16 text-center md:pt-20">
          <h1 className="max-w-5xl font-sans text-4xl font-extrabold leading-tight text-white [text-shadow:0_5px_22px_rgba(0,0,0,0.95)] md:text-6xl">
            Imóveis em Canoas
          </h1>
          <p className="mt-4 text-xl font-semibold text-white [text-shadow:0_4px_18px_rgba(0,0,0,0.9)] md:text-2xl">
            Tradição e confiança para comprar ou alugar.
          </p>
        </div>

        <div className="relative z-10 mx-auto mt-36 max-w-7xl px-6 pb-10 md:mt-40">
        <form
          onSubmit={submit}
          className="mx-auto max-w-[940px]"
        >
          <div className="mx-auto mb-4 flex w-fit overflow-hidden rounded-full bg-white p-1 shadow-[0_10px_24px_rgba(0,0,0,0.22)] ring-1 ring-black/10">
            {[
              { key: "locacao", label: "Alugar" },
              { key: "venda", label: "Comprar" },
              { key: "condominios", label: "Condomínios" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFinalidade(item.key as typeof finalidade)}
                className={`h-10 rounded-full px-7 text-sm font-bold transition ${
                  finalidade === item.key
                    ? "bg-primary text-white shadow"
                    : "text-neutral-700 hover:text-primary"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative flex flex-col overflow-visible rounded-[2rem] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.22)] ring-1 ring-black/10 sm:flex-row">
            <div className="relative flex-1">
              <MapPin className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
              <Input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                onFocus={() => setBuscaFocus(true)}
                onBlur={() => window.setTimeout(() => setBuscaFocus(false), 120)}
                className="h-16 rounded-l-[2rem] rounded-r-none border-0 pl-14 text-base shadow-none focus-visible:ring-0"
                placeholder={finalidade === "condominios" ? "Digite o condomínio, bairro ou código..." : "Digite a cidade, bairro ou empreendimento..."}
              />
            </div>
            <Button className="m-2 h-12 rounded-full bg-primary px-8 text-base font-bold text-white hover:bg-primary/90 sm:h-auto sm:w-16 sm:px-0" aria-label="Buscar">
              <Search className="h-6 w-6" />
              <span className="ml-2 sm:hidden">Buscar</span>
            </Button>
            {showSugestoes && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl border bg-white text-left shadow-2xl ring-1 ring-black/5">
                {sugestoes.map((sugestao) => (
                  <button
                    key={sugestao.imovelId}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setBusca(sugestao.value);
                      navigate({ to: "/imovel/$id", params: { id: sugestao.imovelId } });
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
                  >
                    <div className="h-14 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {sugestao.image ? (
                        <img src={sugestao.image} alt={sugestao.label} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Search className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-foreground">
                        {sugestao.label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {sugestao.detail}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-extrabold text-primary">{sugestao.price}</span>
                      <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                        {sugestao.finalidade === "venda" ? "Venda" : "Aluguel"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-16">
        <div className="grid gap-4 md:grid-cols-3">
          <HomeFeature
            icon={<KeyRound className="h-5 w-5" />}
            title="Locação segura"
            text="Atendimento dedicado para encontrar o aluguel certo."
          />
          <HomeFeature
            icon={<Home className="h-5 w-5" />}
            title="Compra assistida"
            text="Opções de venda com orientação em cada etapa."
          />
          <HomeFeature
            icon={<Building2 className="h-5 w-5" />}
            title="Canoas e região"
            text="Carteira focada nos bairros que a Segura conhece de perto."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl overflow-hidden px-6 pb-12 pt-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-tight">
              Adicionados recentemente
            </h2>
            <p className="text-base text-muted-foreground">
              Carrossel apenas com os imóveis mais novos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild variant="ghost" className="font-bold">
              <Link to="/imoveis/recentes">
                Ver somente recentes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-md"
                aria-label="Voltar carrossel"
                onClick={() => scrollCarousel("prev")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-md"
                aria-label="Avançar carrossel"
                onClick={() => scrollCarousel("next")}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div ref={carouselRef} className="home-carousel overflow-hidden pb-4">
          <div className="flex w-max gap-5">
            {carouselItems.map((imovel, index) => (
              <div key={`${imovel.id}-${index}`} className="w-[320px] shrink-0 md:w-[340px]">
                <ImovelCard imovel={imovel} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold">Imóveis para alugar</h2>
            <p className="text-sm text-muted-foreground">Seleção inicial da Segura.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/alugar">Ver todos</Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {locacao.slice(0, 4).map((imovel) => (
            <ImovelCard key={imovel.id} imovel={imovel} />
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-extrabold">Imóveis à venda</h2>
              <p className="text-sm text-muted-foreground">
                Oportunidades para comprar em Canoas.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/comprar">Ver todos</Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {vendaHome.slice(0, 4).map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

const fallbackVendaInfo = [
  { preco: 495000, titulo: "Casa à venda em Canoas" },
  { preco: 690000, titulo: "Apartamento à venda no Centro" },
  { preco: 890000, titulo: "Casa com pátio em bairro residencial" },
  { preco: 350000, titulo: "Apartamento pronto para morar" },
  { preco: 1250000, titulo: "Residência ampla em Canoas" },
  { preco: 430000, titulo: "Sobrado à venda próximo ao comércio" },
  { preco: 760000, titulo: "Casa térrea com garagem" },
  { preco: 315000, titulo: "Apartamento à venda com ótima localização" },
];

function buildVendaFallback(base: ImovelResumo[]) {
  const source = base.length > 0 ? base : staticVendaCards;
  return source.slice(0, fallbackVendaInfo.length).map((imovel, index) => ({
    ...imovel,
    id: `${imovel.referencia ?? imovel.id}-venda`,
    finalidade: "venda",
    preco: fallbackVendaInfo[index].preco,
    preco_condominio: imovel.tipo?.toLowerCase().includes("apartamento")
      ? imovel.preco_condominio
      : null,
    titulo: fallbackVendaInfo[index].titulo,
  })) as ImovelResumo[];
}

const staticVendaCards: ImovelResumo[] = [
  {
    id: "1041-venda",
    referencia: "1041",
    titulo: "Casa à venda em Canoas",
    tipo: "Casa",
    finalidade: "venda",
    preco: 495000,
    cidade: "Canoas",
    bairro: "Marechal Rondon",
    dormitorios: 3,
    banheiros: 2,
    vagas: 1,
    area: 120,
    imagem_principal: "https://inetsoft.imobiliariaseguracanoas.com.br/Site_Imobiliar/FotosPortais/1041/00001041AA_fa_1.jpg",
  },
  {
    id: "1052-venda",
    referencia: "1052",
    titulo: "Apartamento à venda no Centro",
    tipo: "Apartamento",
    finalidade: "venda",
    preco: 690000,
    cidade: "Canoas",
    bairro: "Centro",
    dormitorios: 2,
    banheiros: 1,
    vagas: 1,
    area: 84,
    imagem_principal: "https://inetsoft.imobiliariaseguracanoas.com.br/Site_Imobiliar/FotosPortais/1052/00001052AA_fa_1.jpg",
  },
  {
    id: "1062-venda",
    referencia: "1062",
    titulo: "Casa com pátio em bairro residencial",
    tipo: "Casa",
    finalidade: "venda",
    preco: 890000,
    cidade: "Canoas",
    bairro: "Centro",
    dormitorios: 3,
    banheiros: 3,
    vagas: 2,
    area: 180,
    imagem_principal: "https://inetsoft.imobiliariaseguracanoas.com.br/Site_Imobiliar/FotosPortais/1062/00001062AA_fa_0.jpg",
  },
  {
    id: "1069-venda",
    referencia: "1069",
    titulo: "Apartamento pronto para morar",
    tipo: "Apartamento",
    finalidade: "venda",
    preco: 350000,
    cidade: "Canoas",
    bairro: "Moinhos de Vento",
    dormitorios: 2,
    banheiros: 1,
    vagas: 1,
    area: 65,
    imagem_principal: "https://inetsoft.imobiliariaseguracanoas.com.br/Site_Imobiliar/FotosPortais/1069/00001069AA_fa_0.jpg",
  },
];

function HomeFeature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-md border bg-white p-5 shadow-lg shadow-black/5">
      <div className="mb-5 text-primary">{icon}</div>
      <h3 className="text-xl font-extrabold">{title}</h3>
      <p className="mt-3 leading-relaxed text-muted-foreground">{text}</p>
    </article>
  );
}

