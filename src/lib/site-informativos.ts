export type SiteInformativo = {
  id: string;
  titulo: string;
  descricao: string;
  etiqueta: string;
  linkTexto: string;
  linkUrl: string;
  variante: "destaque" | "claro" | "escuro";
  ativo: boolean;
  atualizadoEm: string;
};

export const SITE_INFORMATIVOS_EVENT = "segura-site-informativos-updated";
const SITE_INFORMATIVOS_KEY = "segura_site_informativos";

export const defaultInformativos: SiteInformativo[] = [
  {
    id: "info-atendimento",
    titulo: "Atendimento com equipe local",
    descricao: "Fale com a Segura para confirmar disponibilidade, valores e agendar sua visita com seguranca.",
    etiqueta: "Atendimento",
    linkTexto: "Entrar em contato",
    linkUrl: "/contato",
    variante: "destaque",
    ativo: true,
    atualizadoEm: "2026-08-06T00:00:00.000Z",
  },
  {
    id: "info-mapa",
    titulo: "Busca por regiao em Canoas",
    descricao: "Use o mapa nas buscas para aproximar bairros, ruas e encontrar imoveis disponiveis na area desejada.",
    etiqueta: "Mapa",
    linkTexto: "Ver imoveis",
    linkUrl: "/alugar",
    variante: "claro",
    ativo: true,
    atualizadoEm: "2026-08-06T00:00:00.000Z",
  },
];

export function getSiteInformativos() {
  if (typeof window === "undefined") return defaultInformativos;

  const raw = window.localStorage.getItem(SITE_INFORMATIVOS_KEY);
  if (!raw) return defaultInformativos;

  try {
    const parsed = JSON.parse(raw) as SiteInformativo[];
    if (!Array.isArray(parsed)) return defaultInformativos;
    return parsed.filter((item) => item.id && item.titulo);
  } catch {
    return defaultInformativos;
  }
}

export function saveSiteInformativos(informativos: SiteInformativo[]) {
  window.localStorage.setItem(SITE_INFORMATIVOS_KEY, JSON.stringify(informativos));
  window.dispatchEvent(new Event(SITE_INFORMATIVOS_EVENT));
}

export function createSiteInformativo(data: Omit<SiteInformativo, "id" | "atualizadoEm">): SiteInformativo {
  return {
    ...data,
    id: `info-${Date.now()}`,
    atualizadoEm: new Date().toISOString(),
  };
}
