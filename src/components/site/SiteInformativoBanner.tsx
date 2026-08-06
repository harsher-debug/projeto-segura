import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Info, X } from "lucide-react";
import {
  SITE_INFORMATIVOS_EVENT,
  getSiteInformativos,
  type SiteInformativo,
} from "@/lib/site-informativos";

const DISMISSED_INFORMATIVOS_KEY = "segura_dismissed_informativos";

function getDismissedInformativos() {
  if (typeof window === "undefined") return {} as Record<string, string>;

  try {
    return JSON.parse(window.localStorage.getItem(DISMISSED_INFORMATIVOS_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
}

export function SiteInformativoBanner() {
  const [informativos, setInformativos] = useState<SiteInformativo[]>([]);
  const [dismissed, setDismissed] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateInformativos = () => setInformativos(getSiteInformativos());
    updateInformativos();
    setDismissed(getDismissedInformativos());

    window.addEventListener(SITE_INFORMATIVOS_EVENT, updateInformativos);
    window.addEventListener("storage", updateInformativos);
    return () => {
      window.removeEventListener(SITE_INFORMATIVOS_EVENT, updateInformativos);
      window.removeEventListener("storage", updateInformativos);
    };
  }, []);

  const informativo = useMemo(
    () =>
      informativos
        .filter((item) => item.ativo && dismissed[item.id] !== item.atualizadoEm)
        .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())[0],
    [dismissed, informativos],
  );

  if (!informativo) return null;

  const dismiss = () => {
    const next = { ...dismissed, [informativo.id]: informativo.atualizadoEm };
    setDismissed(next);
    window.localStorage.setItem(DISMISSED_INFORMATIVOS_KEY, JSON.stringify(next));
  };

  return (
    <aside className="border-b border-[#d6ad57]/35 bg-[#241114] text-white shadow-[0_5px_16px_rgba(0,0,0,0.18)]">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-6 py-3 sm:items-center">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#f0c96f] sm:mt-0" aria-hidden="true" />
        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-3">
          <p className="text-sm font-extrabold text-white">{informativo.titulo}</p>
          <p className="mt-1 text-sm text-white/78 sm:mt-0 sm:truncate">{informativo.descricao}</p>
          <Link
            to={informativo.linkUrl}
            className="mt-2 inline-flex text-sm font-bold text-[#f0c96f] underline-offset-4 transition-colors hover:text-white hover:underline sm:ml-auto sm:mt-0 sm:shrink-0"
          >
            {informativo.linkTexto}
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/75 transition-[background-color,color,transform] duration-200 hover:bg-white/10 hover:text-white active:scale-95"
          aria-label="Fechar informativo"
          title="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
