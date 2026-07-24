import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Car, MapPin, Ruler } from "lucide-react";
import { formatBRL, formatArea, titleCase } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export interface ImovelResumo {
  id: string;
  referencia?: string | null;
  titulo: string;
  tipo?: string | null;
  finalidade: string;
  preco: number;
  preco_condominio?: number | null;
  cidade?: string | null;
  bairro?: string | null;
  dormitorios?: number | null;
  banheiros?: number | null;
  vagas?: number | null;
  area?: number | null;
  imagem_principal?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export function ImovelCard({ imovel }: { imovel: ImovelResumo }) {
  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(", ");

  return (
    <Link
      to="/imovel/$id"
      params={{ id: imovel.id }}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imovel.imagem_principal ? (
          <img
            src={imovel.imagem_principal}
            alt={imovel.titulo}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Sem foto
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary">
            {imovel.finalidade === "venda" ? "Venda" : "Aluguel"}
          </Badge>
          {imovel.tipo && (
            <Badge variant="secondary" className="bg-black/70 text-white hover:bg-black/70">
              {titleCase(imovel.tipo)}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-lg font-bold text-primary">
          {formatBRL(imovel.preco)}
          {imovel.finalidade === "locacao" && (
            <span className="text-xs font-normal text-muted-foreground">/mês</span>
          )}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
          {titleCase(imovel.titulo)}
        </h3>
        {local && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {titleCase(local)}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-3 border-t pt-3 text-xs text-muted-foreground">
          {!!imovel.dormitorios && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {imovel.dormitorios}
            </span>
          )}
          {!!imovel.banheiros && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {imovel.banheiros}
            </span>
          )}
          {!!imovel.vagas && (
            <span className="flex items-center gap-1">
              <Car className="h-3.5 w-3.5" /> {imovel.vagas}
            </span>
          )}
          {!!imovel.area && (
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" /> {formatArea(imovel.area)}
            </span>
          )}
        </div>
        {imovel.referencia && (
          <p className="mt-2 text-[10px] text-muted-foreground">
            Cód. {imovel.referencia}
          </p>
        )}
      </div>
    </Link>
  );
}
