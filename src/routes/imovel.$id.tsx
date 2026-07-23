import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Hash,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Send,
  Sofa,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ImovelCard } from "@/components/site/ImovelCard";
import { createLeadPublic, getDestaques, getImovel } from "@/lib/imoveis.functions";
import { formatArea, formatBRL, normalizeText, titleCase, whatsappLink } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const copy = {
  imobiliaria: "Imobili\u00e1ria Segura",
  imovel: "Im\u00f3vel",
  detalhes: "Detalhes do im\u00f3vel.",
  naoCarregou: "N\u00e3o foi poss\u00edvel carregar este im\u00f3vel.",
  verImoveis: "Ver im\u00f3veis",
  naoEncontrado: "Im\u00f3vel n\u00e3o encontrado",
  removido: "Este im\u00f3vel pode ter sido removido ou indisponibilizado.",
  voltar: "Voltar",
  codigo: "C\u00f3digo",
  dormitorios: "dorm.",
  vagas: "vagas",
  banheiros: "banheiros",
  areaUtil: "\u00e1rea \u00fatil",
  mobiliado: "mobiliado",
  semMobilia: "sem mobiliado",
  caracteristicas: "Caracter\u00edsticas",
  valores: "Valores",
  aluguel: "Aluguel",
  venda: "Venda",
  iptu: "IPTU",
  condominio: "Condom\u00ednio",
  total: "Total",
  whatsapp: "Saiba mais no WhatsApp",
  favoritos: "Adicionar aos favoritos",
  agendamento: "Agendamento de visita",
  escolhaHorario: "Sugira uma data e hor\u00e1rio para a visita",
  nome: "Nome completo *",
  telefone: "Telefone *",
  email: "E-mail",
  data: "Sugest\u00e3o de data *",
  horario: "Sugest\u00e3o de hor\u00e1rio *",
  contato: "Entre em Contato",
  mensagem: "Mensagem",
  enviar: "Enviar",
  enviando: "Enviando...",
  aceite: "Ao enviar voc\u00ea est\u00e1 de acordo com a nossa Pol\u00edtica de Privacidade e Termos de Uso.",
  informeNome: "Informe seu nome.",
  enviadaToast: "Mensagem enviada! Em breve entraremos em contato.",
  erroToast: "N\u00e3o foi poss\u00edvel enviar. Tente novamente.",
  solicitacaoEnviada: "Solicita\u00e7\u00e3o enviada!",
  contatoBreve: "Nossa equipe entrar\u00e1 em contato em breve.",
  semelhantes: "Im\u00f3veis Semelhantes",
  semelhantesSub: "Gostou desse im\u00f3vel?Confira a sele\u00e7\u00e3o que fizemos abaixo:",
  semFoto: "Sem foto dispon\u00edvel",
  anterior: "Imagem anterior",
  proxima: "Pr\u00f3xima imagem",
};

export const Route = createFileRoute("/imovel/$id")({
  loader: async ({ params }) => {
    const imovel = await getImovel({ data: { id: params.id } });
    if (!imovel) throw notFound();
    const semelhantes = await getDestaques({
      data: { finalidade: imovel.finalidade as "locacao" | "venda", limit: 4 },
    });
    return {
      imovel,
      semelhantes: semelhantes.filter((item) => item.id !== imovel.id).slice(0, 3),
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.imovel
           ? `${titleCase(loaderData.imovel.titulo)} | ${copy.imobiliaria}`
          : `${copy.imovel} | ${copy.imobiliaria}`,
      },
      {
        name: "description",
        content: normalizeText(loaderData?.imovel?.descricao).slice(0, 155) || copy.detalhes,
      },
      ...(loaderData?.imovel?.imagem_principal
        ?[{ property: "og:image", content: loaderData.imovel.imagem_principal }]
        : []),
    ],
  }),
  component: Page,
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground">{copy.naoCarregou}</p>
        <Button asChild className="mt-4">
          <Link to="/alugar">{copy.verImoveis}</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">{copy.naoEncontrado}</h1>
        <p className="mt-2 text-muted-foreground">{copy.removido}</p>
        <Button asChild className="mt-4">
          <Link to="/alugar">{copy.verImoveis}</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
});

function buildGaleria(urls: Array<string | null | undefined>) {
  return [
    ...new Set(
      urls
        .filter(Boolean)
        .map((url) => String(url).trim())
        .filter((url) => /^https?:\/\//i.test(url)),
    ),
  ].slice(0, 16);
}

function Page() {
  const { imovel, semelhantes } = Route.useLoaderData();
  const fotos = Array.isArray(imovel.fotos)  ? (imovel.fotos as string[]) : [];
  const [ativa, setAtiva] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());

  const galeria = useMemo(
    () => buildGaleria([imovel.imagem_principal, ...fotos]),
    [fotos, imovel.imagem_principal],
  );
  const visibleGaleria = galeria.filter((url) => !failedImages.has(url));
  const activeIndex = Math.min(ativa, Math.max(visibleGaleria.length - 1, 0));
  const activeSrc = visibleGaleria[activeIndex];

  const titulo = titleCase(imovel.titulo);
  const tipo = titleCase(imovel.tipo || copy.imovel);
  const finalidade = imovel.finalidade === "venda" ?"Venda" : "Loca\u00e7\u00e3o";
  const local = [imovel.bairro, imovel.cidade].filter(Boolean).map((value) => titleCase(value)).join(", ");
  const descricao = normalizeText(imovel.descricao);
  const totalMensal =
    imovel.finalidade === "locacao"
      ?Number(imovel.preco || 0) + Number(imovel.preco_condominio || 0) + Number(imovel.preco_iptu || 0)
      : Number(imovel.preco || 0);
  const backTo = imovel.finalidade === "venda" ?"/comprar" : "/alugar";

  const markFailed = (url: string) => {
    setFailedImages((current) => {
      const next = new Set(current);
      next.add(url);
      return next;
    });
  };

  const navigateGallery = (direction: -1 | 1) => {
    if (!visibleGaleria.length) return;
    setAtiva((current) => (current + direction + visibleGaleria.length) % visibleGaleria.length);
  };

  const resumo = [
    { icon: Hash, label: `${copy.codigo} ${imovel.referencia || imovel.id}` },
    imovel.dormitorios ?{ icon: BedDouble, label: `${imovel.dormitorios} ${copy.dormitorios}` } : null,
    imovel.vagas ?{ icon: Car, label: `${imovel.vagas} ${copy.vagas}` } : null,
    imovel.banheiros ?{ icon: Bath, label: `${imovel.banheiros} ${copy.banheiros}` } : null,
    imovel.area ?{ icon: Ruler, label: `${formatArea(imovel.area)} ${copy.areaUtil}` } : null,
    { icon: Sofa, label: imovel.mobiliado ?copy.mobiliado : copy.semMobilia },
  ].filter(Boolean) as Array<{ icon: typeof Hash; label: string }>;

  const caracteristicas = [
    ["Tipo", tipo],
    ["Negocia\u00e7\u00e3o", finalidade],
    ["Cidade", titleCase(imovel.cidade)],
    ["Bairro", titleCase(imovel.bairro)],
    [copy.codigo, imovel.referencia || imovel.id],
    ["\u00c1rea privativa", imovel.area ?formatArea(imovel.area) : null],
    ["Dormit\u00f3rios", imovel.dormitorios ?String(imovel.dormitorios) : null],
    ["Su\u00edtes", imovel.suites ?String(imovel.suites) : null],
    ["Banheiros", imovel.banheiros ?String(imovel.banheiros) : null],
    ["Garagem", imovel.vagas ?String(imovel.vagas) : null],
    ["Mobiliado", imovel.mobiliado ?"Sim" : "N\u00e3o"],
    ["Condom\u00ednio", imovel.preco_condominio  ? formatBRL(imovel.preco_condominio) : null],
    ["IPTU", imovel.preco_iptu  ? formatBRL(imovel.preco_iptu) : null],
  ].filter(([, value]) => value);

  return (
    <SiteLayout>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Link
          to={backTo}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> {copy.voltar}
        </Link>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <Gallery
              activeIndex={activeIndex}
              activeSrc={activeSrc}
              imagens={visibleGaleria}
              onFailed={markFailed}
              onSelect={setAtiva}
              onNavigate={navigateGallery}
              titulo={titulo}
            />

            <div className="mt-6 border-b pb-5">
              <h1 className="font-display text-3xl font-extrabold text-primary">
                {tipo} para {finalidade}
              </h1>
              {local && <p className="mt-1 text-base font-bold text-foreground">{local}</p>}
              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                {resumo.map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1 text-center text-xs text-muted-foreground">
                    <item.icon className="h-6 w-6 text-amber-500" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <InfoPanel title={local || copy.imovel}>
              <h2 className="text-sm font-extrabold uppercase tracking-normal text-foreground">{titulo}</h2>
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-foreground">
                {descricao}
              </p>
            </InfoPanel>

            <InfoPanel title={copy.caracteristicas} icon>
              <div className="grid grid-cols-1 text-sm sm:grid-cols-2">
                {caracteristicas.map(([label, value]) => (
                  <div key={label} className="border-b px-4 py-3">
                    <span className="font-bold">{label}: </span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </InfoPanel>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <PriceBox
              finalidade={imovel.finalidade}
              preco={imovel.preco}
              condominio={imovel.preco_condominio}
              iptu={imovel.preco_iptu}
              total={totalMensal}
              mensagem={`Ol\u00e1! Tenho interesse no im\u00f3vel ${
                imovel.referencia  ? `(C\u00f3d. ${imovel.referencia}) ` : ""
              }${titulo}.`}
            />
            <VisitForm imovelId={imovel.id} />
            <ContactForm imovelId={imovel.id} />
          </aside>
        </section>

        {semelhantes.length > 0 && (
          <section className="mt-12 border-t pt-8 text-center">
            <h2 className="font-display text-2xl font-extrabold text-primary">{copy.semelhantes}</h2>
            <p className="mt-2 text-sm font-semibold text-foreground">{copy.semelhantesSub}</p>
            <div className="mt-6 grid grid-cols-1 gap-5 text-left sm:grid-cols-2 lg:grid-cols-3">
              {semelhantes.map((item) => (
                <ImovelCard key={item.id} imovel={item as never} />
              ))}
            </div>
          </section>
        )}
      </main>
    </SiteLayout>
  );
}

function Gallery({
  activeIndex,
  activeSrc,
  imagens,
  onFailed,
  onNavigate,
  onSelect,
  titulo,
}: {
  activeIndex: number;
  activeSrc?: string;
  imagens: string[];
  onFailed: (url: string) => void;
  onNavigate: (direction: -1 | 1) => void;
  onSelect: (index: number) => void;
  titulo: string;
}) {
  return (
    <div>
      <div className="relative overflow-hidden rounded-sm border bg-muted">
        {activeSrc  ? (
          <img
            src={activeSrc}
            alt={titulo}
            className="aspect-[16/9] w-full object-cover"
            onError={() => onFailed(activeSrc)}
          />
        ) : (
          <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 text-muted-foreground">
            <Building2 className="h-10 w-10" />
            <span className="text-sm">{copy.semFoto}</span>
          </div>
        )}
        {imagens.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onNavigate(-1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm"
              aria-label={copy.anterior}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate(1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm"
              aria-label={copy.proxima}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
              {activeIndex + 1} / {imagens.length}
            </span>
          </>
        )}
      </div>
      {imagens.length > 1 && (
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {imagens.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => onSelect(index)}
              className={`overflow-hidden rounded-sm border-2 ${
                index === activeIndex ?"border-primary" : "border-transparent"
              }`}
            >
              <img src={src} alt="" className="aspect-square w-full object-cover" onError={() => onFailed(src)} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoPanel({ children, icon, title }: { children: React.ReactNode; icon?: boolean; title: string }) {
  return (
    <section className="mt-5 overflow-hidden rounded-sm border bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-[linear-gradient(90deg,#e40016_0%,#7a1422_52%,#160c10_100%)] px-4 py-2 text-sm font-bold text-white">
        {icon && <Home className="h-4 w-4" />}
        {title}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function PriceBox({
  condominio,
  finalidade,
  iptu,
  mensagem,
  preco,
  total,
}: {
  condominio?: number | null;
  finalidade: string;
  iptu?: number | null;
  mensagem: string;
  preco: number;
  total: number;
}) {
  return (
    <div className="rounded-sm border bg-white p-4 text-sm shadow-sm">
      <h3 className="mb-3 font-bold text-foreground">{copy.valores}</h3>
      <PriceLine label={finalidade === "venda" ?copy.venda : copy.aluguel} value={preco} />
      {!!iptu && <PriceLine label={copy.iptu} value={iptu} />}
      {!!condominio && <PriceLine label={copy.condominio} value={condominio} />}
      <div className="mt-2 border-t pt-2">
        <PriceLine label={copy.total} value={total} strong />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">*Valor sujeito a altera\u00e7\u00e3o.</p>
      <Button asChild className="mt-4 w-full bg-green-500 hover:bg-green-600">
        <a href={whatsappLink(mensagem)} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="mr-2 h-4 w-4" /> {copy.whatsapp}
        </a>
      </Button>
      <Button type="button" variant="outline" className="mt-2 w-full">
        {copy.favoritos}
      </Button>
    </div>
  );
}

function PriceLine({ label, strong, value }: { label: string; strong?: boolean; value: number }) {
  return (
    <div className={`flex justify-between gap-3 py-1 ${strong ?"font-extrabold" : "font-medium"}`}>
      <span>{label}</span>
      <span>{formatBRL(value)}</span>
    </div>
  );
}

function VisitForm({ imovelId }: { imovelId: string }) {
  return (
    <LeadShell title={copy.agendamento} subtitle={copy.escolhaHorario} imovelId={imovelId} submitLabel={copy.enviar}>
      {(state) => (
        <>
          <Input required placeholder={copy.nome} value={state.nome} onChange={(e) => state.setNome(e.target.value)} />
          <Input required placeholder={copy.telefone} value={state.telefone} onChange={(e) => state.setTelefone(e.target.value)} />
          <Input placeholder={copy.email} type="email" value={state.email} onChange={(e) => state.setEmail(e.target.value)} />
          <Input required placeholder={copy.data} value={state.extra1} onChange={(e) => state.setExtra1(e.target.value)} />
          <Input required placeholder={copy.horario} value={state.extra2} onChange={(e) => state.setExtra2(e.target.value)} />
        </>
      )}
    </LeadShell>
  );
}

function ContactForm({ imovelId }: { imovelId: string }) {
  return (
    <LeadShell title={copy.contato} imovelId={imovelId} submitLabel={copy.enviar}>
      {(state) => (
        <>
          <Input required placeholder={copy.nome} value={state.nome} onChange={(e) => state.setNome(e.target.value)} />
          <Input required placeholder={copy.telefone} value={state.telefone} onChange={(e) => state.setTelefone(e.target.value)} />
          <Input placeholder={copy.email} type="email" value={state.email} onChange={(e) => state.setEmail(e.target.value)} />
          <Textarea placeholder={copy.mensagem} rows={5} value={state.msg} onChange={(e) => state.setMsg(e.target.value)} />
          <label className="flex gap-2 text-[11px] leading-4 text-muted-foreground">
            <input type="checkbox" className="mt-0.5 h-3 w-3" />
            <span>{copy.aceite}</span>
          </label>
        </>
      )}
    </LeadShell>
  );
}

function LeadShell({
  children,
  imovelId,
  submitLabel,
  subtitle,
  title,
}: {
  children: (state: {
    email: string;
    extra1: string;
    extra2: string;
    msg: string;
    nome: string;
    setEmail: (value: string) => void;
    setExtra1: (value: string) => void;
    setExtra2: (value: string) => void;
    setMsg: (value: string) => void;
    setNome: (value: string) => void;
    setTelefone: (value: string) => void;
    telefone: string;
  }) => React.ReactNode;
  imovelId: string;
  submitLabel: string;
  subtitle?: string;
  title: string;
}) {
  const [enviado, setEnviado] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [extra1, setExtra1] = useState("");
  const [extra2, setExtra2] = useState("");
  const createFn = useServerFn(createLeadPublic);

  const observacoes = [msg, extra1  ? `Data sugerida: ${extra1}` : "", extra2  ? `Hor\u00e1rio sugerido: ${extra2}` : ""]
    .filter(Boolean)
    .join("\n");

  const mutation = useMutation({
    mutationFn: () => createFn({ data: { nome, telefone, email, imovel_id: imovelId, observacoes } }),
    onSuccess: () => {
      setEnviado(true);
      toast.success(copy.enviadaToast);
    },
    onError: () => toast.error(copy.erroToast),
  });

  if (enviado) {
    return (
      <div className="rounded-sm border bg-white p-5 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
        <p className="mt-2 text-sm font-semibold">{copy.solicitacaoEnviada}</p>
        <p className="text-xs text-muted-foreground">{copy.contatoBreve}</p>
      </div>
    );
  }

  return (
    <form
      className="overflow-hidden rounded-sm border bg-white shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        if (nome.length < 2) return toast.error(copy.informeNome);
        mutation.mutate();
      }}
    >
      <div className="flex items-center gap-2 bg-[linear-gradient(90deg,#e40016_0%,#7a1422_52%,#160c10_100%)] px-3 py-2 text-sm font-bold text-white">
        {title === copy.contato  ? <Mail className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
        {title}
      </div>
      <div className="space-y-3 p-4">
        {subtitle && <p className="text-center text-xs text-muted-foreground">{subtitle}</p>}
        {children({ email, extra1, extra2, msg, nome, setEmail, setExtra1, setExtra2, setMsg, setNome, setTelefone, telefone })}
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ?copy.enviando : <><Send className="mr-2 h-4 w-4" /> {submitLabel}</>}
        </Button>
      </div>
    </form>
  );
}
