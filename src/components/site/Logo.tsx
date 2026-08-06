import { Link } from "@tanstack/react-router";
import logoImg from "@/assets/hero-segura-logo.png";

export function Logo({
  className = "",
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <Link to="/" className="group flex items-center">
      <img
        src={logoImg}
        alt="Imobiliária Segura"
        className={`h-14 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)] transition-opacity group-hover:opacity-90 ${className}`}
      />
    </Link>
  );
}
