import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/portal/sindico/condominios")({
  component: SindicoCondominiosPage,
});

const condominios = [
  { nome: "Residencial Centro", unidades: 48, status: "Ativo" },
  { nome: "Condominio Marechal", unidades: 32, status: "Ativo" },
  { nome: "Edificio Moinhos", unidades: 24, status: "Em revisao" },
];

function SindicoCondominiosPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Condominios</h1>
        <p className="text-sm text-muted-foreground">Carteira condominial vinculada ao sindico logado.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {condominios.map((condominio) => (
          <article key={condominio.nome} className="rounded-xl border bg-card p-5 shadow-sm">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="mt-4 font-display text-lg font-bold">{condominio.nome}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{condominio.unidades} unidades</p>
            <span className="mt-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {condominio.status}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
