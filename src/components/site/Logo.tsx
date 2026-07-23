import { Link } from "@tanstack/react-router";
import logoImg from "@/assets/logo-transparent.png";
import logoFooterImg from "@/assets/logo-footer.png";

export function Logo({
  light = false,
  className = "",
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <Link to="/" className="group flex items-center">
      <img
        src={light ?logoFooterImg : logoImg}
        alt="Imobiliária Segura"
        className={`h-14 w-auto object-contain transition-opacity group-hover:opacity-90 ${className}`}
      />
    </Link>
  );
}
