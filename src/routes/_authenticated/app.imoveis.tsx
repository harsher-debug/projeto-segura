import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { adminProperties, brl } from "@/lib/admin-demo";

export const Route = createFileRoute("/_authenticated/app/imoveis")({
  component: ImoveisPage,
});

function ImoveisPage() {
  const [search, setSearch] = useState("");
  const properties = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return adminProperties;
    return adminProperties.filter((property) =>
      [property.title, property.code, property.neighborhood, property.city, property.type]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c7a45a]">Carteira online</p>
          <h1 className="font-display text-3xl font-extrabold">Imoveis do site</h1>
          <p className="text-sm text-neutral-500">Controle de publicacao, valores e status dos imoveis.</p>
        </div>
        <label className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por codigo, bairro ou tipo..."
            className="h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm outline-none focus:border-[#a50f1b] focus:ring-2 focus:ring-[#a50f1b]/10"
          />
        </label>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {properties.map((property) => (
          <article key={property.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
              <img src={property.image} alt={property.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#a50f1b] px-2.5 py-1 text-xs font-bold text-white">{property.purpose}</span>
                <span className="rounded-full bg-[#f7f5f2] px-2.5 py-1 text-xs font-bold text-neutral-600">{property.status}</span>
              </div>
              <h2 className="mt-3 min-h-12 font-display text-lg font-extrabold leading-tight">{property.title}</h2>
              <p className="text-sm text-neutral-500">{property.neighborhood}, {property.city}</p>
              <p className="mt-3 text-xl font-extrabold text-[#d71920]">{brl(property.price)}</p>
              <div className="mt-4 rounded-xl bg-[#f7f5f2] p-3 text-xs text-neutral-600">
                <p className="font-bold">Cod. {property.code}</p>
                <p>{property.metrics}</p>
                <p>Proprietario: {property.owner}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <button className="inline-flex items-center gap-2 rounded-xl bg-[#a50f1b] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#a50f1b]/20">
        <SlidersHorizontal className="h-4 w-4" />
        Criar novo imovel exemplo
      </button>
    </div>
  );
}
