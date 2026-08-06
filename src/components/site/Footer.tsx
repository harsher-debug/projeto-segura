import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { whatsappLink } from "@/lib/format";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[linear-gradient(90deg,#e40016_0%,#7a1422_52%,#160c10_100%)] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.25fr_1fr_1fr_1fr]">
        <div>
          <Logo light shadow={false} className="h-[4.5rem]" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/85">
            Há mais de 55 anos cuidando da sua locação e venda de imóveis em
            Canoas e região metropolitana, com segurança e experiência.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-extrabold uppercase text-white">
            Navegação
          </h4>
          <ul className="mt-5 space-y-2 text-sm text-white/85">
            <li><Link to="/alugar" className="hover:text-white">Alugar</Link></li>
            <li><Link to="/comprar" className="hover:text-white">Comprar</Link></li>
            <li><Link to="/sobre" className="hover:text-white">Quem Somos</Link></li>
            <li><Link to="/contato" className="hover:text-white">Contato</Link></li>
            <li><Link to="/favoritos" className="hover:text-white">Favoritos</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-extrabold uppercase text-white">
            Contato
          </h4>
          <ul className="mt-5 space-y-3 text-sm text-white/85">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white" />
              <span>Canoas - RS, Brasil</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-white" />
              <span>(51) 2102-4000</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-white" />
              <span>(51) 2102-4001</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-white" />
              <span>imobiliaria@segura.com.br</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-extrabold uppercase text-white">
            Atendimento
          </h4>
          <a
            href={whatsappLink("Olá! Gostaria de mais informações sobre imóveis.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-extrabold text-primary shadow-lg transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-px hover:bg-[#fff5dc] hover:shadow-xl active:translate-y-0"
          >
            <MessageCircle className="h-4 w-4" />
            Fale no WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-white/15 bg-black/20 py-5">
        <p className="mx-auto max-w-7xl px-6 text-center text-xs text-white/75">
          © {new Date().getFullYear()} Imobiliária Segura. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
