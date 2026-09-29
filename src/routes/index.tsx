import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  Search,
  X,
} from "lucide-react";
import whatsappIcon from "simple-icons/icons/whatsapp.svg";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ImovelCard, type ImovelResumo } from "@/components/site/ImovelCard";
import { getDestaques, getSearchSuggestions } from "@/lib/imoveis.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImg from "@/assets/hero-living-room-clean.png";
import heroLogoImg from "@/assets/hero-segura-logo.png";

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
  const carouselPausedRef = useRef(false);
  const carouselResumeTimeoutRef = useRef<number | null>(null);
  const carouselDraggingRef = useRef(false);
  const carouselDraggedRef = useRef(false);
  const carouselDragStartXRef = useRef(0);
  const carouselDragStartScrollRef = useRef(0);
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
    const carousel = carouselRef.current;
    if (!carousel) return;

    const resetPoint = carousel.scrollWidth / 2;
    if (direction === "prev" && carousel.scrollLeft < 370) {
      carousel.scrollLeft = resetPoint;
    }

    pauseCarousel();
    carousel.scrollBy({
      left: direction === "next" ? 370 : -370,
      behavior: "smooth",
    });
    resumeCarousel(900);
  };

  const pauseCarousel = () => {
    if (carouselResumeTimeoutRef.current) {
      window.clearTimeout(carouselResumeTimeoutRef.current);
      carouselResumeTimeoutRef.current = null;
    }
    carouselPausedRef.current = true;
  };

  const resumeCarousel = (delay = 0) => {
    if (carouselResumeTimeoutRef.current) {
      window.clearTimeout(carouselResumeTimeoutRef.current);
    }

    if (delay > 0) {
      carouselResumeTimeoutRef.current = window.setTimeout(() => {
        carouselPausedRef.current = false;
        carouselResumeTimeoutRef.current = null;
      }, delay);
      return;
    }

    carouselPausedRef.current = false;
    carouselResumeTimeoutRef.current = null;
  };

  const startCarouselDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    pauseCarousel();

    const resetPoint = carousel.scrollWidth / 2;
    if (carousel.scrollLeft <= 5) {
      carousel.scrollLeft = resetPoint;
    }

    carouselDraggingRef.current = true;
    carouselDraggedRef.current = false;
    carouselDragStartXRef.current = event.clientX;
    carouselDragStartScrollRef.current = carousel.scrollLeft;
    carousel.setPointerCapture(event.pointerId);
  };

  const moveCarouselDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    if (!carousel || !carouselDraggingRef.current) return;

    event.preventDefault();
    const resetPoint = carousel.scrollWidth / 2;
    const delta = event.clientX - carouselDragStartXRef.current;
    if (Math.abs(delta) > 6) {
      carouselDraggedRef.current = true;
    }
    carousel.scrollLeft = carouselDragStartScrollRef.current - delta;

    if (carousel.scrollLeft >= resetPoint + 20) {
      carousel.scrollLeft -= resetPoint;
      carouselDragStartScrollRef.current -= resetPoint;
    }

    if (carousel.scrollLeft <= 20) {
      carousel.scrollLeft += resetPoint;
      carouselDragStartScrollRef.current += resetPoint;
    }
  };

  const stopCarouselDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    carouselDraggingRef.current = false;
    carousel?.releasePointerCapture?.(event.pointerId);
    resumeCarousel();
  };

  const handleCarouselClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselDraggedRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    window.setTimeout(() => {
      carouselDraggedRef.current = false;
    }, 0);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || recentes.length === 0) return;

    let frame = 0;
    let lastTime = performance.now();
    const speed = 70;

    const tick = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!carouselPausedRef.current) {
        const resetPoint = carousel.scrollWidth / 2;
        if (carousel.scrollLeft >= resetPoint) {
          carousel.scrollTo({ left: 0 });
        }
        carousel.scrollLeft += (speed * delta) / 1000;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      if (carouselResumeTimeoutRef.current) {
        window.clearTimeout(carouselResumeTimeoutRef.current);
      }
    };
  }, [recentes.length]);

  return (
    <SiteLayout>
      <section className="relative z-20 flow-root min-h-[560px] overflow-visible bg-neutral-950">
        <img
          src={heroImg}
          alt="Sala decorada com a marca Segura Imobiliária"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,7,5,0.08)_0%,rgba(16,7,5,0.22)_45%,rgba(16,7,5,0.72)_100%)]" />
        <img
          src={heroLogoImg}
          alt="Segura Imobiliária"
          className="absolute left-1/2 top-[38%] z-10 w-[58vw] max-w-[430px] -translate-x-1/2 -translate-y-1/2 object-contain brightness-110 drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(245,239,230,0)_0%,rgba(64,31,20,0.72)_42%,#f5efe6_96%)]" />
        <div className="relative z-30 mx-auto mt-[340px] max-w-7xl px-6 pb-10 md:mt-[360px]">
        <form
          onSubmit={submit}
          className="mx-auto max-w-[940px]"
        >
          <div className="mx-auto mb-4 flex w-fit overflow-hidden rounded-full bg-[#2a1715]/95 p-1 shadow-[0_14px_32px_rgba(0,0,0,0.46)] ring-1 ring-[#d6ad57]/25">
            {[
              { key: "locacao", label: "Alugar" },
              { key: "venda", label: "Comprar" },
              { key: "condominios", label: "Condomínios" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFinalidade(item.key as typeof finalidade)}
                className={`h-10 rounded-full px-7 text-sm font-bold transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.98] ${
                  finalidade === item.key
                    ? "bg-[#8f0f18] text-white shadow-[0_5px_12px_rgba(0,0,0,0.28)]"
                    : "text-white/82 hover:bg-white/8 hover:text-[#f2d084]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative flex flex-col overflow-visible rounded-[2rem] bg-[#fbf6ed] shadow-[0_18px_38px_rgba(0,0,0,0.42)] ring-1 ring-[#3b1b17]/20 sm:flex-row">
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
            <Button className="m-2 h-12 rounded-full bg-[#8f0f18] px-8 text-base font-bold text-white shadow-[0_5px_12px_rgba(87,7,13,0.28)] hover:bg-[#6f0b13] sm:h-auto sm:w-16 sm:px-0" aria-label="Buscar">
              <Search className="h-6 w-6" />
              <span className="ml-2 sm:hidden">Buscar</span>
            </Button>
            {showSugestoes && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 max-h-[min(22rem,calc(100vh-12rem))] overflow-y-auto overscroll-contain rounded-2xl border bg-white text-left shadow-2xl ring-1 ring-black/5">
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

      <section className="relative mx-auto max-w-7xl px-6 pt-12">
        <HomePromoGrid />
      </section>

      <section className="mx-auto max-w-7xl overflow-visible px-6 pb-12 pt-10">
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
          </div>
        </div>

        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-white/95 shadow-lg shadow-black/15 md:-left-5 md:h-12 md:w-12"
            aria-label="Voltar carrossel"
            onClick={() => scrollCarousel("prev")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-white/95 shadow-lg shadow-black/15 md:-right-5 md:h-12 md:w-12"
            aria-label="Avancar carrossel"
            onClick={() => scrollCarousel("next")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div
            ref={carouselRef}
            className="home-carousel overflow-hidden pb-4"
            onMouseEnter={pauseCarousel}
            onMouseLeave={() => {
              carouselDraggingRef.current = false;
              resumeCarousel();
            }}
            onPointerDown={startCarouselDrag}
            onPointerMove={moveCarouselDrag}
            onPointerUp={stopCarouselDrag}
            onPointerCancel={stopCarouselDrag}
            onClickCapture={handleCarouselClickCapture}
            onWheel={() => {
              pauseCarousel();
              resumeCarousel(1200);
            }}
          >
            <div className="flex w-max gap-5">
              {carouselItems.map((imovel, index) => (
                <div key={`${imovel.id}-${index}`} className="w-[320px] shrink-0 md:w-[340px]">
                  <ImovelCard imovel={imovel} />
                </div>
              ))}
            </div>
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

      <section className="bg-[#eee5da]/70 py-14">
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
      <HomeWhatsappButton />
    </SiteLayout>
  );
}

function HomeWhatsappButton() {
  const [open, setOpen] = useState(false);
  const message = "Olá! Vim pelo site da Segura, gostaria de ser atendido (a).";
  const whatsappOptions = [
    { label: "Central", phone: "(51) 2102-4000", number: "555121024000" },
    { label: "Vendas", phone: "+55 51 98122-4077", number: "5551981224077" },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="w-64 overflow-hidden rounded-xl border border-[#d6ad57]/35 bg-white shadow-2xl shadow-black/25">
          <div className="bg-[#241114] px-4 py-3 text-white">
            <p className="text-sm font-extrabold">Fale com a Segura</p>
            <p className="mt-0.5 text-xs text-white/70">Escolha um número para conversar.</p>
          </div>
          <div className="space-y-1 p-2">
            {whatsappOptions.map((option) => (
              <a
                key={option.number}
                href={`https://web.whatsapp.com/send?phone=${option.number}&text=${encodeURIComponent(message)}`}
                target="segura-whatsapp"
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-neutral-800 transition-[background-color,color,transform] duration-200 hover:bg-[#fff5dc] hover:text-[#8f0f18] active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5 text-[#1d9b56]" />
                <span>
                  <span className="block">{option.label}</span>
                  <span className="block text-xs font-medium text-neutral-500">{option.phone}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1d9b56] p-0 text-white shadow-[0_12px_28px_rgba(10,74,39,0.36)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-1 hover:bg-[#168246] hover:shadow-[0_16px_32px_rgba(10,74,39,0.42)] active:translate-y-0 active:scale-[0.98]"
        aria-expanded={open}
        aria-label={open ? "Fechar opções do WhatsApp" : "Abrir opções do WhatsApp"}
        title={open ? "Fechar opções do WhatsApp" : "Abrir opções do WhatsApp"}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <img src={whatsappIcon} alt="" className="h-7 w-7 brightness-0 invert" />
        )}
      </button>
    </div>
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

function HomePromoGrid() {
  return (
    <div className="grid gap-5">
      <article className="overflow-hidden rounded-md border bg-white shadow-xl shadow-black/8">
        <div className="grid min-h-[300px] md:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center p-7 md:p-10">
            <p className="text-xs font-extrabold uppercase tracking-wide text-primary">Segura Imobiliária</p>
            <h2 className="mt-4 max-w-lg font-display text-3xl font-extrabold leading-tight text-neutral-950 md:text-4xl">
              Encontre o imóvel certo por região, valor e momento de vida
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
              A busca combina atendimento local, imóveis organizados por bairro e um mapa real para aproximar sua escolha das ruas de Canoas.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-5">
                <Link to="/alugar">Buscar aluguel</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-5">
                <Link to="/comprar">Buscar compra</Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[300px] bg-[#f8f2e3] p-7">
            <div className="absolute left-10 top-8 h-[76%] w-[70%] rounded-[38%_62%_42%_58%] border border-[#d6ad57]/60 bg-white shadow-inner" />
            <div className="absolute left-[18%] top-[28%] h-1 w-[58%] rotate-[-18deg] rounded-full bg-[#d6ad57]/70" />
            <div className="absolute left-[28%] top-[20%] h-[58%] w-1 rotate-[14deg] rounded-full bg-[#d6ad57]/70" />
            <div className="absolute left-[23%] top-[58%] h-1 w-[52%] rotate-[12deg] rounded-full bg-[#d6ad57]/70" />
            {[
              { label: "Centro", count: "12", className: "left-[22%] top-[34%]" },
              { label: "Marechal", count: "8", className: "left-[55%] top-[28%]" },
              { label: "Moinhos", count: "6", className: "left-[47%] top-[58%]" },
            ].map((item) => (
              <div key={item.label} className={`absolute ${item.className} rounded-full bg-primary px-3 py-2 text-xs font-black text-white shadow-lg`}>
                {item.count}
              </div>
            ))}
            <div className="absolute bottom-7 right-7 w-56 rounded-md border bg-white p-4 shadow-xl">
              <p className="text-xs font-extrabold uppercase text-primary">Mapa interativo</p>
              <p className="mt-2 text-sm font-bold text-neutral-950">Aproxime para ver imóveis por rua.</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">A lista acompanha a área visível do mapa.</p>
            </div>
          </div>
        </div>
      </article>

      <div className="hidden gap-5 md:grid md:grid-cols-3">
        <article className="rounded-md border bg-white p-7 shadow-lg shadow-black/5">
          <h3 className="font-display text-2xl font-extrabold leading-tight text-neutral-950">Alugue sem perder tempo</h3>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Filtre por bairro, código ou tipo de imóvel e fale com a equipe para confirmar disponibilidade.
          </p>
          <Button asChild className="mt-6 rounded-full px-5">
            <Link to="/alugar">Ver imóveis para alugar</Link>
          </Button>
        </article>

        <article className="rounded-md border bg-white p-7 shadow-lg shadow-black/5">
          <h3 className="font-display text-2xl font-extrabold leading-tight text-neutral-950">Compare antes de visitar</h3>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Veja valores, regiões e características antes de agendar, com imóveis organizados para comparação rápida.
          </p>
          <div className="mt-6 grid gap-2 text-sm font-bold text-neutral-800">
            <div className="rounded-md bg-muted px-3 py-2">Valor</div>
            <div className="rounded-md bg-muted px-3 py-2">Bairro</div>
            <div className="rounded-md bg-muted px-3 py-2">Dormitórios</div>
          </div>
        </article>

        <article className="rounded-md border bg-white p-7 text-neutral-950 shadow-lg shadow-black/5">
          <h3 className="font-display text-2xl font-extrabold leading-tight">Compre com apoio local</h3>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Conheça oportunidades em Canoas com orientação para escolher, visitar e negociar com mais segurança.
          </p>
          <Button asChild className="mt-6 rounded-full px-5">
            <Link to="/comprar">Ver imóveis à venda</Link>
          </Button>
        </article>
      </div>
    </div>
  );
}
