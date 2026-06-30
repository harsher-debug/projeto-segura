import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BedDouble,
  Bath,
  Car,
  Ruler,
  MapPin,
  MessageCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getImovel, createLeadPublic } from "@/lib/imoveis.functions";
import { formatBRL, formatArea, titleCase, whatsappLink } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/imovel/$id")({
  loader: async ({ params }) => {
    const imovel = await getImovel({ data: { id: params.id } });
    if (!imovel) throw notFound();
    return imovel;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${titleCase(loaderData.titulo)} | Imobiliária Segura`
          : "Imóvel | Imobiliária Segura",
      },
      {
        name: "description",
        content: loaderData?.descricao?.slice(0, 155) ?? "Detalhes do imóvel.",
      },
      ...(loaderData?.imagem_principal
        ? [{ property: "og:image", content: loaderData.imagem_principal }]
        : []),
    ],
  }),
  component: Page,
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Não foi possível carregar este imóvel.</p>
        <Button asChild className="mt-4"><Link to="/alugar">Ver imóveis</Link></Button>
      </div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Imóvel não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          Este imóvel pode ter sido removido ou alugado.
        </p>
        <Button asChild className="mt-4"><Link to="/alugar">Ver imóveis</Link></Button>
      </div>
    </SiteLayout>
  ),
});

function Page() {
  const imovel = Route.useLoaderData();
  const fotos: string[] = Array.isArray(imovel.fotos)
    ? (imovel.fotos as string[])
    : [];
  const galeria = fotos.length ? fotos : imovel.imagem_principal ? [imovel.imagem_principal] : [];
  const [ativa, setAtiva] = useState(0);
  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(", ");

  const mensagem = `Olá! Tenho interesse no imóvel ${
    imovel.referencia ? `(Cód. ${imovel.referencia}) ` : ""
  }${titleCase(imovel.titulo)}.`;

  const specs = [
    { icon: BedDouble, label: "Dormitórios", value: imovel.dormitorios },
    { icon: Bath, label: "Banheiros", value: imovel.banheiros },
    { icon: Car, label: "Vagas", value: imovel.vagas },
    { icon: Ruler, label: "Área", value: imovel.area ? formatArea(imovel.area) : null },
  ].filter((s) => s.value);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Link
          to="/alugar"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border bg-muted">
              {galeria.length ? (
                <img
                  src={galeria[ativa]}
                  alt={imovel.titulo}
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center text-muted-foreground">
                  <Building2 className="h-10 w-10" />
                </div>
              )}
            </div>
            {galeria.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-8">
                {galeria.slice(0, 16).map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setAtiva(i)}
                    className={`overflow-hidden rounded-md border-2 ${
                      i === ativa ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={src} alt="" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                  {imovel.finalidade === "venda" ? "Venda" : "Aluguel"}
                </Badge>
                {imovel.tipo && <Badge variant="secondary">{titleCase(imovel.tipo)}</Badge>}
                {imovel.mobiliado && <Badge variant="outline">Mobiliado</Badge>}
              </div>
              <h1 className="mt-3 font-display text-2xl font-extrabold text-foreground md:text-3xl">
                {titleCase(imovel.titulo)}
              </h1>
              {local && (
                <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {titleCase(local)}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {specs.map((s) => (
                  <div key={s.label} className="rounded-lg border bg-card p-3 text-center">
                    <s.icon className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-1 text-sm font-semibold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {imovel.descricao && (
                <>
                  <Separator className="my-6" />
                  <h2 className="font-display text-lg font-bold">Descrição</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {imovel.descricao}
                  </p>
                </>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <p className="text-3xl font-extrabold text-primary">
                  {formatBRL(imovel.preco)}
                  {imovel.finalidade === "locacao" && (
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  )}
                </p>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {!!imovel.preco_condominio && (
                    <p className="flex justify-between">
                      <span>Condomínio</span>
                      <span>{formatBRL(imovel.preco_condominio)}</span>
                    </p>
                  )}
                  {!!imovel.preco_iptu && (
                    <p className="flex justify-between">
                      <span>IPTU</span>
                      <span>{formatBRL(imovel.preco_iptu)}</span>
                    </p>
                  )}
                </div>
                <Button asChild className="mt-4 w-full" size="lg">
                  <a
                    href={whatsappLink(mensagem)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" /> Falar no WhatsApp
                  </a>
                </Button>
                {imovel.corretor_nome && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Atendimento: {titleCase(imovel.corretor_nome)}
                  </p>
                )}
              </div>

              <LeadForm imovelId={imovel.id} />
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}

function LeadForm({ imovelId }: { imovelId: string }) {
  const [enviado, setEnviado] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const createFn = useServerFn(createLeadPublic);

  const mutation = useMutation({
    mutationFn: () =>
      createFn({
        data: { nome, telefone, email, imovel_id: imovelId, observacoes: msg },
      }),
    onSuccess: () => {
      setEnviado(true);
      toast.success("Mensagem enviada! Em breve entraremos em contato.");
    },
    onError: () => toast.error("Não foi possível enviar. Tente novamente."),
  });

  if (enviado) {
    return (
      <div className="rounded-xl border bg-card p-5 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
        <p className="mt-2 text-sm font-semibold">Solicitação enviada!</p>
        <p className="text-xs text-muted-foreground">
          Nossa equipe entrará em contato em breve.
        </p>
      </div>
    );
  }

  return (
    <form
      className="rounded-xl border bg-card p-5 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (nome.length < 2) return toast.error("Informe seu nome.");
        mutation.mutate();
      }}
    >
      <h3 className="font-display text-base font-bold">Tenho interesse</h3>
      <p className="text-xs text-muted-foreground">Receba mais informações.</p>
      <div className="mt-3 space-y-2">
        <Input placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input placeholder="Telefone / WhatsApp" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        <Input placeholder="E-mail (opcional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Textarea placeholder="Mensagem (opcional)" value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Enviando..." : "Enviar solicitação"}
        </Button>
      </div>
    </form>
  );
}