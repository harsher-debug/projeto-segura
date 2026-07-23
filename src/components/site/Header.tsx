import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

const announceUrl = "https://imobiliariaseguracanoas.bitrix24.site/captacao/cadastro_externo/";

const navItems = [
  { label: "Alugar", to: "/alugar" },
  { label: "Comprar", to: "/comprar" },
  { label: "Quem Somos", to: "/sobre" },
  { label: "Contato", to: "/contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d6ad57]/35 bg-[linear-gradient(90deg,#e40016_0%,#7a1422_52%,#160c10_100%)] shadow-sm">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-6">
        <Logo light className="h-14" />

        <nav className="hidden items-center gap-9 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-semibold text-white transition hover:text-[#d6ad57] [&.active]:text-[#d6ad57]"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={announceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-white transition hover:text-[#d6ad57]"
          >
            Anunciar
          </a>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Button asChild variant="ghost" size="icon" aria-label="Favoritos" className="hover:bg-white/10">
            <Link to="/favoritos">
              <Heart className="h-6 w-6 text-[#d6ad57]" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="h-10 rounded-md border border-[#d6ad57]/70 bg-white px-5 font-bold text-[#a90f1b] shadow-md shadow-black/20 hover:border-[#f0c96f] hover:bg-[#fff8ea]"
          >
            <Link to="/entrar">
              <User className="mr-1.5 h-4 w-4" />
              Área do Cliente
            </Link>
          </Button>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#d6ad57]/35 bg-[linear-gradient(90deg,#e40016_0%,#7a1422_52%,#160c10_100%)] shadow-lg md:hidden">
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
