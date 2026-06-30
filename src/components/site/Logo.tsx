import { Link } from "@tanstack/react-router";
import logoImg from "@/assets/logo.jpg";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center group">
      <img
        src={logoImg}
        alt="Imobiliária Segura"
        className={`h-10 w-auto object-contain transition-opacity group-hover:opacity-90 ${light ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
}
