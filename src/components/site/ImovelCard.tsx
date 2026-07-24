import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Car, Heart, MapPin, Ruler, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatArea, formatBRL, titleCase } from "@/lib/format";
import { isFavorite, shareImovel, toggleFavorite } from "@/lib/public-favorites";

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
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(imovel.id));
    const sync = () => setFavorited(isFavorite(imovel.id));
    window.addEventListener("segura:favorites-change", sync);
    return () => window.removeEventListener("segura:favorites-change", sync);
  }, [imovel.id]);

  const handleFavorite = () => {
    const saved = toggleFavorite(imovel.id);
    setFavorited(saved);
    toast.success(saved ? "Imóvel salvo nos favoritos." : "Imóvel removido dos favoritos.");
  };

  const handleShare = async () => {
    try {
      await shareImovel(imovel);
      toast.success("Link do imóvel pronto para compartilhar.");
    } catch {
      toast.error("Não foi possível compartilhar este imóvel.");
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to="/imovel/$id" params={{ id: imovel.id }} className="block">
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
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to="/imovel/$id" params={{ id: imovel.id }} className="flex flex-1 flex-col">
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
        </Link>

        <div className="mt-4 grid grid-cols-2 border-t pt-3 text-[11px] font-bold uppercase text-muted-foreground">
          <Button type="button" variant="ghost" size="sm" className="justify-start px-1" onClick={handleFavorite}>
            <Heart className={favorited ? "fill-primary text-primary" : "text-muted-foreground"} />
            Favoritos
          </Button>
          <Button type="button" variant="ghost" size="sm" className="justify-end px-1" onClick={handleShare}>
            <Share2 className="text-muted-foreground" />
            Compartilhar
          </Button>
        </div>
      </div>
    </article>
  );
}
