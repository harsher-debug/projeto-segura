import { Link } from "@tanstack/react-router";
import logoImg from "@/assets/hero-segura-logo.png";

export function Logo({
  light = false,
  shadow = true,
  className = "",
}: {
  light?: boolean;
  shadow?: boolean;
  className?: string;
}) {
  return (
    <Link to="/" className="group flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c96f] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent">
      <img
        src={logoImg}
        alt="Imobiliária Segura"
        className={`h-14 w-auto object-contain transition-[filter,opacity,transform] duration-200 ease-out group-hover:scale-[1.02] group-hover:opacity-100 ${
          light
            ? `brightness-125 contrast-125 ${shadow ? "drop-shadow-[0_2px_0_rgba(0,0,0,0.5)] drop-shadow-[0_5px_10px_rgba(0,0,0,0.75)]" : ""}`
            : `brightness-105 contrast-110 ${shadow ? "drop-shadow-[0_2px_5px_rgba(0,0,0,0.35)]" : ""}`
        } ${className}`}
      />
    </Link>
  );
}
