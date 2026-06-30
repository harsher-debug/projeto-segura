import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { whatsappLink } from "@/lib/format";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Há mais de 55 anos cuidando da sua locação e venda de imóveis em
            Canoas e região metropolitana, com segurança e experiência.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
            Navegação
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link to="/alugar" className="hover:text-white">Alugar</Link></li>
            <li><Link to="/comprar" className="hover:text-white">Comprar</Link></li>
            <li><Link to="/sobre" className="hover:text-white">Quem Somos</Link></li>
            <li><Link to="/contato" className="hover:text-white">Contato</Link></li>
            <li><Link to="/favoritos" className="hover:text-white">Favoritos</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
            Contato
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Canoas — RS, Brasil</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span>(51) 2102-4000</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <span>imobiliaria@segura.com.br</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
            Atendimento
          </h4>
          <a
            href={whatsappLink("Olá! Gostaria de mais informações sobre imóveis.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <MessageCircle className="h-4 w-4" />
            Fale no WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="mx-auto max-w-7xl px-4 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Imobiliária Segura. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}