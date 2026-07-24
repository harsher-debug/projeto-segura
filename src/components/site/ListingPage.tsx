import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MapPin, SlidersHorizontal } from "lucide-react";
import { getFacets, getSearchSuggestions, listImoveis } from "@/lib/imoveis.functions";
import { ImovelCard, type ImovelResumo } from "./ImovelCard";
import { formatBRL, titleCase } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

const ALL = "__all__";

interface Filtros {
  cidade: string;
  bairro: string;
  tipo: string;
  dormitorios: string;
  vagas: string;
  ordem: string;
  busca: string;
}

const emptyFiltros: Filtros = {
  cidade: ALL,
  bairro: ALL,
  tipo: ALL,
  dormitorios: ALL,
  vagas: ALL,
  ordem: "recentes",
  busca: "",
};

export function ListingPage({
  finalidade,
  apenasRecentes,
  titulo,
  subtitulo,
}: {
  finalidade?: "locacao" | "venda";
  apenasRecentes?: boolean;
  titulo: string;
  subtitulo: string;
}) {
  const [filtros, setFiltros] = useState<Filtros>(emptyFiltros);
  const [buscaInput, setBuscaInput] = useState("");
  const [buscaFocus, setBuscaFocus] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const navigate = useNavigate();

  const listFn = useServerFn(listImoveis);
  const facetsFn = useServerFn(getFacets);
  const suggestionsFn = useServerFn(getSearchSuggestions);

  const { data: facets } = useQuery({
    queryKey: ["facets", finalidade],
    queryFn: () => facetsFn({ data: { finalidade } }),
  });

  const set = (key: keyof Filtros, value: string) => {
    setFiltros((filtroAtual) => ({ ...filtroAtual, [key]: value }));
    setPage(1);
  };

  const { data, isFetching } = useQuery({
    queryKey: ["imoveis", finalidade, apenasRecentes, filtros, page],
    queryFn: () =>
      listFn({
        data: {
          finalidade,
          apenasRecentes,
          cidade: filtros.cidade === ALL ? undefined : filtros.cidade,
          bairro: filtros.bairro === ALL ? undefined : filtros.bairro,
          tipo: filtros.tipo === ALL ? undefined : filtros.tipo,
          dormitorios:
            filtros.dormitorios === ALL ? undefined : Number(filtros.dormitorios),
          vagas: filtros.vagas === ALL ? undefined : Number(filtros.vagas),
          busca: filtros.busca || undefined,
          ordem: filtros.ordem as "recentes" | "menor_preco" | "maior_preco",
          page,
          pageSize,
        },
      }),
  });

  const { data: mapData } = useQuery({
    queryKey: ["imoveis-map", finalidade, apenasRecentes, filtros],
    queryFn: () =>
      listFn({
        data: {
          finalidade,
          apenasRecentes,
          cidade: filtros.cidade === ALL ? undefined : filtros.cidade,
          bairro: filtros.bairro === ALL ? undefined : filtros.bairro,
          tipo: filtros.tipo === ALL ? undefined : filtros.tipo,
          dormitorios:
            filtros.dormitorios === ALL ? undefined : Number(filtros.dormitorios),
          vagas: filtros.vagas === ALL ? undefined : Number(filtros.vagas),
          busca: filtros.busca || undefined,
          ordem: filtros.ordem as "recentes" | "menor_preco" | "maior_preco",
          page: 1,
          pageSize: 48,
        },
      }),
  });

  const termoSugestao = buscaInput.trim();
  const { data: sugestoes = [] } = useQuery({
    queryKey: ["listing-search-suggestions", finalidade, termoSugestao],
    queryFn: () =>
      suggestionsFn({
        data: {
          finalidade,
          termo: termoSugestao,
          limit: 8,
        },
      }),
    enabled: termoSugestao.length >= 2,
  });

  const showSugestoes = buscaFocus && termoSugestao.length >= 2 && sugestoes.length > 0;

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1),
    [data],
  );

  const mapRegions = useMemo(
    () => buildMapRegions(((mapData?.items ?? []) as ImovelResumo[])),
    [mapData],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold text-foreground">
          {titulo}
        </h1>
        <p className="mt-1 text-muted-foreground">{subtitulo}</p>
      </div>

      <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-primary" /> Filtros
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Select value={filtros.cidade} onValueChange={(value) => set("cidade", value)}>
            <SelectTrigger><SelectValue placeholder="Cidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as cidades</SelectItem>
              {facets?.cidades.map((cidade) => (
                <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtros.bairro} onValueChange={(value) => set("bairro", value)}>
            <SelectTrigger><SelectValue placeholder="Bairro" /></SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value={ALL}>Todos os bairros</SelectItem>
              {facets?.bairros.map((bairro) => (
                <SelectItem key={bairro} value={bairro}>{bairro}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtros.tipo} onValueChange={(value) => set("tipo", value)}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value={ALL}>Todos os tipos</SelectItem>
              {facets?.tipos.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filtros.dormitorios}
            onValueChange={(value) => set("dormitorios", value)}
          >
            <SelectTrigger><SelectValue placeholder="Dormitórios" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Dormitórios</SelectItem>
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}+ dorm.</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtros.vagas} onValueChange={(value) => set("vagas", value)}>
            <SelectTrigger><SelectValue placeholder="Vagas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Vagas</SelectItem>
              {[1, 2, 3].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}+ vagas</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtros.ordem} onValueChange={(value) => set("ordem", value)}>
            <SelectTrigger><SelectValue placeholder="Ordenar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="menor_preco">Menor preço</SelectItem>
              <SelectItem value="maior_preco">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            set("busca", buscaInput);
          }}
        >
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por código, rua, bairro ou cidade..."
              value={buscaInput}
              onChange={(event) => setBuscaInput(event.target.value)}
              onFocus={() => setBuscaFocus(true)}
              onBlur={() => window.setTimeout(() => setBuscaFocus(false), 120)}
            />
            {showSugestoes && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 overflow-hidden rounded-xl border bg-white shadow-xl ring-1 ring-black/5">
                {sugestoes.map((sugestao) => (
                  <button
                    key={sugestao.imovelId}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setBuscaInput(sugestao.value);
                      navigate({ to: "/imovel/$id", params: { id: sugestao.imovelId } });
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
                  >
                    <span className="h-14 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {sugestao.image ? (
                        <img src={sugestao.image} alt={sugestao.label} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-primary">
                          {sugestao.referencia || "SEG"}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-foreground">
                        {sugestao.label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {sugestao.detail}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-extrabold text-primary">{sugestao.price}</span>
                      <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                        {sugestao.finalidade === "venda" ? "Venda" : "Aluguel"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button type="submit">Buscar</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setFiltros(emptyFiltros);
              setBuscaInput("");
              setPage(1);
            }}
          >
            Limpar
          </Button>
        </form>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {data ? `${data.total} imóveis encontrados` : "Carregando..."}
        </span>
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          {data && data.items.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card p-12 text-center text-muted-foreground">
              Nenhum imóvel encontrado com esses filtros.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {(data?.items ?? []).map((imovel) => (
                <ImovelCard key={imovel.id} imovel={imovel as never} />
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SearchMap
            regions={mapRegions}
            selectedRegion={filtros.bairro === ALL ? "" : filtros.bairro}
            onSelectRegion={(bairro) => set("bairro", bairro)}
          />
        </aside>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

type MapRegion = {
  bairro: string;
  cidade: string;
  count: number;
  minPrice: number;
  x: number;
  y: number;
};

const regionPositions: Record<string, { x: number; y: number }> = {
  centro: { x: 54, y: 52 },
  "marechal rondon": { x: 62, y: 43 },
  "moinhos de vento": { x: 66, y: 34 },
  "estancia velha": { x: 43, y: 33 },
  "estância velha": { x: 43, y: 33 },
  "nossa senhora das gracas": { x: 57, y: 28 },
  "nossa senhora das graças": { x: 57, y: 28 },
  "mathias velho": { x: 36, y: 54 },
  "sao jose": { x: 48, y: 64 },
  "são josé": { x: 48, y: 64 },
  niteroi: { x: 68, y: 66 },
  niterói: { x: 68, y: 66 },
  igara: { x: 34, y: 31 },
  "rio branco": { x: 63, y: 58 },
  guajuviras: { x: 25, y: 47 },
  ozenan: { x: 45, y: 44 },
  harmonia: { x: 49, y: 40 },
  "são luís": { x: 39, y: 67 },
  "sao luis": { x: 39, y: 67 },
};

function normalizeRegion(value?: string | null) {
  return titleCase(value || "Região não informada");
}

function regionKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function fallbackPosition(key: string) {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 997;
  }

  return {
    x: 18 + (hash % 65),
    y: 24 + ((hash * 7) % 50),
  };
}

function buildMapRegions(items: ImovelResumo[]): MapRegion[] {
  const groups = new Map<string, MapRegion>();

  for (const item of items) {
    const bairro = normalizeRegion(item.bairro || item.cidade || "Canoas");
    const cidade = normalizeRegion(item.cidade || "Canoas");
    const key = regionKey(bairro);
    const position = regionPositions[key] ?? fallbackPosition(key);
    const current = groups.get(key);

    if (current) {
      current.count += 1;
      current.minPrice = Math.min(current.minPrice, Number(item.preco || 0));
    } else {
      groups.set(key, {
        bairro,
        cidade,
        count: 1,
        minPrice: Number(item.preco || 0),
        x: position.x,
        y: position.y,
      });
    }
  }

  return [...groups.values()].sort((a, b) => b.count - a.count);
}

function SearchMap({
  regions,
  selectedRegion,
  onSelectRegion,
}: {
  regions: MapRegion[];
  selectedRegion: string;
  onSelectRegion: (bairro: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-extrabold text-foreground">Mapa por região</h2>
          <p className="text-xs text-muted-foreground">Imóveis disponíveis por bairro</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {regions.reduce((total, region) => total + region.count, 0)} imóveis
        </span>
      </div>

      <div className="relative h-[520px] bg-[#eef1e8]">
        <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(28deg,transparent_0_46%,rgba(255,255,255,0.9)_46%_48%,transparent_48%_100%),linear-gradient(118deg,transparent_0_54%,rgba(255,255,255,0.72)_54%_56%,transparent_56%_100%),linear-gradient(0deg,rgba(122,135,98,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(122,135,98,0.08)_1px,transparent_1px)] [background-size:220px_160px,260px_190px,42px_42px,42px_42px]" />
        <div className="absolute left-[8%] top-[12%] h-[76%] w-[76%] rounded-[42%_58%_48%_52%] border-2 border-[#8aa16a]/30 bg-[#dfe8d2]/60" />
        <div className="absolute bottom-5 left-5 rounded-md bg-white/90 px-3 py-2 text-xs font-semibold text-neutral-700 shadow-sm">
          Canoas e região
        </div>

        {regions.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm text-muted-foreground">
            Ajuste os filtros para visualizar imóveis no mapa.
          </div>
        ) : (
          regions.map((region) => {
            const selected = regionKey(selectedRegion) === regionKey(region.bairro);

            return (
              <button
                key={`${region.bairro}-${region.cidade}`}
                type="button"
                onClick={() => onSelectRegion(region.bairro)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-xs font-extrabold shadow-lg ring-2 transition hover:-translate-y-[55%] hover:scale-105 ${
                  selected
                    ? "bg-primary text-white ring-white"
                    : "bg-white text-primary ring-primary/20 hover:ring-primary/50"
                }`}
                style={{ left: `${region.x}%`, top: `${region.y}%` }}
                title={`${region.bairro}: ${region.count} imóveis`}
              >
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {region.count}
                </span>
                <span className="block whitespace-nowrap text-[10px] font-bold opacity-80">
                  desde {formatBRL(region.minPrice)}
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="max-h-48 divide-y overflow-y-auto bg-white">
        {regions.slice(0, 8).map((region) => (
          <button
            key={`list-${region.bairro}-${region.cidade}`}
            type="button"
            onClick={() => onSelectRegion(region.bairro)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-muted"
          >
            <span>
              <span className="block font-bold text-foreground">{region.bairro}</span>
              <span className="text-xs text-muted-foreground">{region.cidade}</span>
            </span>
            <span className="text-right">
              <span className="block font-extrabold text-primary">{region.count}</span>
              <span className="text-[10px] text-muted-foreground">imóveis</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
