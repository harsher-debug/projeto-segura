import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { SITE_APPEARANCE_EVENT, getSiteAppearanceSettings } from "@/lib/site-informativos";

const announceUrl = "https://imobiliariaseguracanoas.bitrix24.site/captacao/cadastro_externo/";

const navItems = [
  { label: "Alugar", to: "/alugar" },
  { label: "Comprar", to: "/comprar" },
  { label: "Quem Somos", to: "/sobre" },
  { label: "Contato", to: "/contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [headerLineColor, setHeaderLineColor] = useState("#d6ad57");

  useEffect(() => {
    const updateAppearance = () => setHeaderLineColor(getSiteAppearanceSettings().headerLineColor);
    updateAppearance();
    window.addEventListener(SITE_APPEARANCE_EVENT, updateAppearance);
    window.addEventListener("storage", updateAppearance);
    return () => {
      window.removeEventListener(SITE_APPEARANCE_EVENT, updateAppearance);
      window.removeEventListener("storage", updateAppearance);
    };
  }, []);

  return (
    <header
      className="sticky top-0 z-[100] w-full border-b-4 bg-[linear-gradient(90deg,#e40016_0%,#7a1422_52%,#160c10_100%)] shadow-[0_2px_10px_rgba(0,0,0,0.22)]"
      style={{ borderBottomColor: headerLineColor, boxShadow: `0 2px 10px rgba(0,0,0,0.22), 0 2px 9px ${headerLineColor}b8` } as CSSProperties}
    >
      <div className="mx-auto grid h-[74px] max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-6">
        <div className="flex justify-start">
          <Logo light className="h-[3.9rem]" />
        </div>

        <nav className="hidden items-center justify-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-semibold text-white transition-[color,transform] duration-200 ease-out hover:-translate-y-px hover:text-[#f0c96f] active:translate-y-0 [&.active]:text-[#f0c96f]"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={announceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-white transition-[color,transform] duration-200 ease-out hover:-translate-y-px hover:text-[#f0c96f] active:translate-y-0"
          >
            Anunciar
          </a>
        </nav>

        <div className="hidden items-center justify-end gap-4 md:flex">
          <Button
            asChild
            variant="ghost"
            aria-label="Favoritos"
            className="h-11 rounded-md px-3 text-sm font-bold text-[#f0c96f] transition-[transform,background-color,color] duration-200 ease-out hover:-translate-y-px hover:bg-white/10 hover:text-[#fff1bd] active:translate-y-0"
          >
            <Link to="/favoritos">
              <Heart className="mr-1.5 h-7 w-7 text-[#d6ad57]" />
              Favoritos
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="h-10 rounded-md border border-[#d6ad57]/80 bg-[#fffdf8] px-5 font-bold text-[#8f0f18] shadow-md shadow-black/25 transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-px hover:border-[#f0c96f] hover:bg-[#fff5dc] hover:shadow-lg hover:shadow-black/30 active:translate-y-0"
          >
            <Link to="/entrar">
              <User className="mr-1.5 h-4 w-4" />
              Área do Cliente
            </Link>
          </Button>
        </div>

        <button
          className="col-start-3 inline-flex items-center justify-self-end rounded-md p-2 text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="bg-[linear-gradient(90deg,#e40016_0%,#7a1422_52%,#160c10_100%)] shadow-lg md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col divide-y divide-white/10 px-6">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium text-white hover:text-[#d6ad57]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/favoritos"
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-medium text-white hover:text-[#d6ad57]"
            >
              Favoritos
            </Link>
            <a
              href={announceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-medium text-white hover:text-[#d6ad57]"
            >
              Anunciar
            </a>
            <Link
              to="/entrar"
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-semibold text-[#f0c96f]"
            >
              Área do Cliente
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
