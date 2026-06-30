import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Heart, User, ChevronDown, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { label: "Alugar", to: "/alugar" },
  { label: "Comprar", to: "/comprar" },
  { label: "Quem Somos", to: "/sobre" },
  { label: "Contato", to: "/contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  // Detectar scroll para mudar aparência do header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Barra superior com contato */}
      <div className="hidden bg-secondary text-white/80 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <span>Há mais de 55 anos cuidando da sua locação em Canoas e região</span>
          <div className="flex items-center gap-4">
            <a href="tel:5121024000" className="flex items-center gap-1.5 hover:text-white">
              <Phone className="h-3 w-3" /> (51) 2102-4000
            </a>
            <a href="mailto:imobiliaria@segura.com.br" className="hover:text-white">
              imobiliaria@segura.com.br
            </a>
          </div>
        </div>
      </div>

      {/* Header principal — sempre sólido, nunca transparente */}
      <header
        className={`sticky top-0 z-50 w-full border-b bg-background transition-shadow duration-200 ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Logo />

          {/* Nav Desktop */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-accent hover:text-primary [&.active]:text-primary [&.active]:font-semibold"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Ações Desktop */}
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="icon" aria-label="Favoritos">
              <Link to="/favoritos">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant={user ? "outline" : "default"}
              size="sm"
              className={user ? "" : "bg-primary hover:bg-primary/90 text-white font-semibold"}
            >
              <Link to={user ? "/app/dashboard" : "/entrar"}>
                <User className="mr-1.5 h-4 w-4" />
                {user ? "Painel" : "Área do Cliente"}
              </Link>
            </Button>
          </div>

          {/* Botão Mobile */}
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Menu Mobile */}
        {open && (
          <div className="border-t bg-background shadow-lg md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col divide-y px-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm font-medium text-foreground/80 hover:text-primary [&.active]:text-primary [&.active]:font-semibold"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/favoritos"
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium text-foreground/80 hover:text-primary"
              >
                ♡ Favoritos
              </Link>
              <Link
                to={user ? "/app/dashboard" : "/entrar"}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-semibold text-primary"
              >
                {user ? "→ Painel" : "→ Área do Cliente"}
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
