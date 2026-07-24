import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Cake,
  FileText,
  Grid3X3,
  Image,
  KeyRound,
  Link2,
  Mail,
  Megaphone,
  MessageSquare,
  Newspaper,
  Search,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/dashboard")({
  component: Dashboard,
});

const modules = [
  { label: "Novidades", icon: Sparkles, color: "text-[#0866a8]", to: "/app/leads" },
  { label: "Pop-ups", icon: Image, color: "text-[#67b7ad]", to: "/app/dashboard" },
  { label: "Banners", icon: Image, color: "text-[#ff7a24]", to: "/app/dashboard" },
  { label: "Convites de acesso", icon: KeyRound, color: "text-[#8b0e18]", to: "/app/leads" },
  { label: "Cartao de aniversario", icon: Cake, color: "text-[#0ea5d7]", to: "/app/dashboard" },
  { label: "Mensageiro", icon: MessageSquare, color: "text-[#00816f]", to: "/app/leads" },
  { label: "Avisos gerais", icon: Megaphone, color: "text-[#9b0f5b]", to: "/app/propostas" },
  { label: "Avisos e circulares", icon: Mail, color: "text-[#9b0f5b]", to: "/app/propostas" },
  { label: "Boletim da administracao", icon: Newspaper, color: "text-[#4357c9]", to: "/app/dashboard" },
  { label: "Encurtador de Links", icon: Link2, color: "text-[#fb5a1d]", to: "/app/dashboard" },
  { label: "Avisos de locacao", icon: FileText, color: "text-[#9b0f5b]", to: "/app/imoveis" },
  { label: "Imoveis do site", icon: Grid3X3, color: "text-[#d71920]", to: "/app/imoveis" },
  { label: "Visitas", icon: Bell, color: "text-[#d6ad57]", to: "/app/visitas" },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function Dashboard() {
  const [filter, setFilter] = useState("");
  const filteredModules = useMemo(() => {
    const term = normalize(filter);
    if (!term) return modules;
    return modules.filter((item) => normalize(item.label).includes(term));
  }, [filter]);

  return (
    <div className="space-y-4">
      <section className="rounded-md border bg-white px-7 py-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Grid3X3 className="h-6 w-6 text-neutral-700" />
          <h1 className="font-display text-2xl font-extrabold text-neutral-800">Painel</h1>
        </div>
      </section>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-neutral-300" />
        <input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filtrar itens"
          className="h-12 w-full rounded-md border bg-white pl-12 pr-4 text-sm shadow-sm outline-none transition focus:border-[#d71920] focus:ring-2 focus:ring-[#d71920]/15"
        />
      </label>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {filteredModules.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="group flex h-32 flex-col items-center justify-center rounded-md border bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[#d71920]/30 hover:shadow-lg"
          >
            <item.icon className={`h-11 w-11 stroke-[1.8] transition group-hover:scale-105 ${item.color}`} />
            <span className="mt-4 text-sm font-extrabold text-neutral-950">{item.label}</span>
          </Link>
        ))}
      </section>

      {!filteredModules.length && (
        <div className="rounded-md border bg-white px-5 py-8 text-center text-sm text-neutral-500">
          Nenhum item encontrado para esse filtro.
        </div>
      )}
    </div>
  );
}
