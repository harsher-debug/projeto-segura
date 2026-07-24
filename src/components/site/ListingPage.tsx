import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DivIcon, LatLngExpression, Map as LeafletMap, Marker } from "leaflet";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, SlidersHorizontal } from "lucide-react";
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
  const [mapVisibleRegions, setMapVisibleRegions] = useState<string[]>([]);
  const [mapVisibleItemIds, setMapVisibleItemIds] = useState<string[]>([]);
  const [mapSelectionMode, setMapSelectionMode] = useState(false);
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
    setMapVisibleRegions([]);
    setMapVisibleItemIds([]);
    setMapSelectionMode(false);
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
    queryKey: ["imoveis-map", finalidade, apenasRecentes, filtros.cidade, filtros.tipo, filtros.dormitorios, filtros.vagas, filtros.busca, filtros.ordem],
    queryFn: () =>
      listFn({
        data: {
          finalidade,
          apenasRecentes,
          cidade: filtros.cidade === ALL ? undefined : filtros.cidade,
          tipo: filtros.tipo === ALL ? undefined : filtros.tipo,
          dormitorios:
            filtros.dormitorios === ALL ? undefined : Number(filtros.dormitorios),
          vagas: filtros.vagas === ALL ? undefined : Number(filtros.vagas),
          busca: filtros.busca || undefined,
          ordem: filtros.ordem as "recentes" | "menor_preco" | "maior_preco",
          page: 1,
          pageSize: 500,
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

  const mapPoints = useMemo(
    () => buildMapPoints(((mapData?.items ?? []) as ImovelResumo[])),
    [mapData],
  );

  const visibleRegionKeys = useMemo(
    () => new Set(mapVisibleRegions.map(regionKey)),
    [mapVisibleRegions],
  );

  const visibleItemIds = useMemo(
    () => new Set(mapVisibleItemIds),
    [mapVisibleItemIds],
  );

  const mapFilteredItems = useMemo(() => {
    const items = ((mapData?.items ?? []) as ImovelResumo[]);
    if (!mapSelectionMode) return null;
    if (visibleItemIds.size > 0) {
      return items.filter((imovel) => visibleItemIds.has(imovel.id));
    }
    if (!mapSelectionMode || visibleRegionKeys.size === 0 || visibleRegionKeys.size >= mapRegions.length) return null;
    return items.filter((imovel) => visibleRegionKeys.has(regionKey(imovel.bairro || imovel.cidade || "Canoas")));
  }, [mapData, mapRegions.length, mapSelectionMode, visibleItemIds, visibleRegionKeys]);

  const displayItems = mapFilteredItems ?? ((data?.items ?? []) as ImovelResumo[]);

  const handleMapRegionSelect = useCallback((bairro: string) => {
    setMapVisibleRegions([bairro]);
    setMapVisibleItemIds([]);
    setMapSelectionMode(true);
    setPage(1);
  }, []);

  const handleMapItemSelect = useCallback((id: string) => {
    setMapVisibleRegions([]);
    setMapVisibleItemIds([id]);
    setMapSelectionMode(true);
    setPage(1);
  }, []);

  const handleMapViewportChange = useCallback((regions: string[], itemIds: string[]) => {
    setMapVisibleRegions(regions);
    setMapVisibleItemIds(itemIds);
    setMapSelectionMode(true);
    setPage(1);
  }, []);

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
              setMapVisibleRegions([]);
              setMapVisibleItemIds([]);
              setMapSelectionMode(false);
              setPage(1);
            }}
          >
            Limpar
          </Button>
        </form>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {mapFilteredItems
            ? `${mapFilteredItems.length} imóveis nesta área do mapa`
            : data
              ? `${data.total} imóveis encontrados`
              : "Carregando..."}
        </span>
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          {data && displayItems.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card p-12 text-center text-muted-foreground">
              Nenhum imóvel encontrado com esses filtros.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {displayItems.map((imovel) => (
                <ImovelCard key={imovel.id} imovel={imovel as never} />
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SearchMap
            regions={mapRegions}
            points={mapPoints}
            selectedRegion={mapVisibleRegions.length === 1 ? mapVisibleRegions[0] : filtros.bairro === ALL ? "" : filtros.bairro}
            selectedItemIds={mapVisibleItemIds}
            onSelectRegion={handleMapRegionSelect}
            onSelectItem={handleMapItemSelect}
            onViewportChange={handleMapViewportChange}
          />
        </aside>
      </div>

      {!mapFilteredItems && totalPages > 1 && (
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
  lat: number;
  lng: number;
};

type MapPropertyPoint = {
  id: string;
  title: string;
  bairro: string;
  cidade: string;
  price: number;
  lat: number;
  lng: number;
  precise: boolean;
};

const regionPositions: Record<string, { lat: number; lng: number }> = {
  centro: { lat: -29.9178, lng: -51.1801 },
  "marechal rondon": { lat: -29.9103, lng: -51.1697 },
  "moinhos de vento": { lat: -29.9014, lng: -51.1762 },
  "estancia velha": { lat: -29.8992, lng: -51.1904 },
  "estância velha": { lat: -29.8992, lng: -51.1904 },
  "nossa senhora das gracas": { lat: -29.9067, lng: -51.1627 },
  "nossa senhora das graças": { lat: -29.9067, lng: -51.1627 },
  "mathias velho": { lat: -29.9236, lng: -51.2025 },
  "sao jose": { lat: -29.9332, lng: -51.1805 },
  "são josé": { lat: -29.9332, lng: -51.1805 },
  niteroi: { lat: -29.9358, lng: -51.1608 },
  niterói: { lat: -29.9358, lng: -51.1608 },
  igara: { lat: -29.8919, lng: -51.1873 },
  "rio branco": { lat: -29.9294, lng: -51.1694 },
  guajuviras: { lat: -29.9001, lng: -51.2265 },
  ozenan: { lat: -29.9164, lng: -51.1907 },
  harmonia: { lat: -29.9128, lng: -51.1851 },
  "são luís": { lat: -29.9424, lng: -51.1901 },
  "sao luis": { lat: -29.9424, lng: -51.1901 },
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
    lat: -29.918 + (((hash % 100) - 50) / 10000),
    lng: -51.18 + ((((hash * 7) % 100) - 50) / 10000),
  };
}

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 9973;
  }
  return hash;
}

function readMapCoordinate(value: unknown) {
  if (value == null || value === "") return null;
  const normalized = typeof value === "string" ? value.replace(",", ".").trim() : value;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function hasRealMapPosition(item: ImovelResumo) {
  const lat = readMapCoordinate(item.latitude);
  const lng = readMapCoordinate(item.longitude);
  return lat != null && lng != null && lat >= -35 && lat <= -25 && lng >= -58 && lng <= -48;
}

function getMapPosition(item: ImovelResumo, index: number) {
  const lat = readMapCoordinate(item.latitude);
  const lng = readMapCoordinate(item.longitude);
  if (hasRealMapPosition(item) && lat != null && lng != null) {
    return { lat, lng, precise: true };
  }

  const bairro = normalizeRegion(item.bairro || item.cidade || "Canoas");
  const key = regionKey(bairro);
  const base = regionPositions[key] ?? fallbackPosition(key);
  const hash = hashText(`${item.id}-${item.referencia ?? ""}-${index}`);
  const angle = (hash % 360) * (Math.PI / 180);
  const radius = 0.00055 + ((hash % 9) * 0.00018);

  return {
    lat: base.lat + Math.sin(angle) * radius,
    lng: base.lng + Math.cos(angle) * radius,
    precise: false,
  };
}

function buildMapRegions(items: ImovelResumo[]): MapRegion[] {
  const groups = new Map<string, MapRegion & { latTotal: number; lngTotal: number }>();

  for (const [index, item] of items.entries()) {
    const bairro = normalizeRegion(item.bairro || item.cidade || "Canoas");
    const cidade = normalizeRegion(item.cidade || "Canoas");
    const key = regionKey(bairro);
    const position = getMapPosition(item, index);
    const current = groups.get(key);

    if (current) {
      current.count += 1;
      current.minPrice = Math.min(current.minPrice, Number(item.preco || 0));
      current.latTotal += position.lat;
      current.lngTotal += position.lng;
      current.lat = current.latTotal / current.count;
      current.lng = current.lngTotal / current.count;
    } else {
      groups.set(key, {
        bairro,
        cidade,
        count: 1,
        minPrice: Number(item.preco || 0),
        lat: position.lat,
        lng: position.lng,
        latTotal: position.lat,
        lngTotal: position.lng,
      });
    }
  }

  return [...groups.values()]
    .map(({ latTotal, lngTotal, ...region }) => region)
    .sort((a, b) => b.count - a.count);
}

function buildMapPoints(items: ImovelResumo[]): MapPropertyPoint[] {
  return items.map((item, index) => {
    const bairro = normalizeRegion(item.bairro || item.cidade || "Canoas");
    const cidade = normalizeRegion(item.cidade || "Canoas");
    const position = getMapPosition(item, index);

    return {
      id: item.id,
      title: titleCase(item.titulo),
      bairro,
      cidade,
      price: Number(item.preco || 0),
      lat: position.lat,
      lng: position.lng,
      precise: position.precise,
    };
  });
}

function SearchMap({
  regions,
  points,
  selectedRegion,
  selectedItemIds,
  onSelectRegion,
  onSelectItem,
  onViewportChange,
}: {
  regions: MapRegion[];
  points: MapPropertyPoint[];
  selectedRegion: string;
  selectedItemIds: string[];
  onSelectRegion: (bairro: string) => void;
  onSelectItem: (id: string) => void;
  onViewportChange: (regions: string[], itemIds: string[]) => void;
}) {
  const mapRef = useRef<LeafletMap | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const regionsRef = useRef<MapRegion[]>(regions);
  const pointsRef = useRef<MapPropertyPoint[]>(points);
  const regionSignatureRef = useRef("");
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    regionsRef.current = regions;
  }, [regions]);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    let mounted = true;

    async function setupMap() {
      if (!mapElementRef.current || mapRef.current || typeof window === "undefined") return;

      const L = await import("leaflet");
      if (!mounted || !mapElementRef.current) return;

      const map = L.map(mapElementRef.current, {
        center: [-29.918, -51.18],
        zoom: 13,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const syncVisibleRegions = () => {
        const bounds = map.getBounds();
        const currentZoom = map.getZoom();
        setZoom(currentZoom);
        if (currentZoom >= 15) {
          const visibleItems = pointsRef.current
            .filter((point) => bounds.contains([point.lat, point.lng]))
            .map((point) => point.id);
          onViewportChange([], visibleItems);
          return;
        }

        const visibleRegions = regionsRef.current
          .filter((region) => bounds.contains([region.lat, region.lng]))
          .map((region) => region.bairro);
        onViewportChange(visibleRegions, []);
      };

      map.on("moveend zoomend", syncVisibleRegions);

      mapRef.current = map;
    }

    setupMap();

    return () => {
      mounted = false;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onViewportChange]);

  useEffect(() => {
    let cancelled = false;

    async function updateMarkers() {
      const map = mapRef.current;
      if (!map) return;

      const L = await import("leaflet");
      if (cancelled) return;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const bounds: LatLngExpression[] = [];

      if (zoom >= 15) {
        points.forEach((point) => {
          const selected = selectedItemIds.includes(point.id);
          const icon: DivIcon = L.divIcon({
            className: "",
            html: `<button class="segura-map-marker segura-map-marker-property ${selected ? "is-selected" : ""}" type="button">
              <span>1</span>
            </button>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });
          const position: LatLngExpression = [point.lat, point.lng];
          const marker = L.marker(position, { icon })
            .addTo(map)
            .bindPopup(
              `<strong>${point.title}</strong><br>${point.bairro}, ${point.cidade}${
                point.precise ? "" : "<br><small>Posição aproximada por bairro</small>"
              }`,
            )
            .on("click", () => onSelectItem(point.id));

          markersRef.current.push(marker);
          bounds.push(position);
        });
      } else {
        regions.forEach((region) => {
          const selected = regionKey(selectedRegion) === regionKey(region.bairro);
          const icon: DivIcon = L.divIcon({
            className: "",
            html: `<button class="segura-map-marker ${selected ? "is-selected" : ""}" type="button">
              <span>${region.count}</span>
            </button>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });
          const position: LatLngExpression = [region.lat, region.lng];
          const marker = L.marker(position, { icon })
            .addTo(map)
            .bindPopup(
              `<strong>${region.bairro}</strong><br>${region.count} imóveis disponíveis`,
            )
            .on("click", () => {
              onSelectRegion(region.bairro);
              map.setView(position, 15, { animate: true });
            });

          markersRef.current.push(marker);
          bounds.push(position);
        });
      }

      const signature = regions.map((region) => `${region.bairro}:${region.count}`).join("|");
      const signatureChanged = signature !== regionSignatureRef.current;
      if (signatureChanged) {
        regionSignatureRef.current = signature;
        if (bounds.length === 1) {
          map.setView(bounds[0], 14, { animate: true });
        } else if (bounds.length > 1) {
          map.fitBounds(bounds, { padding: [34, 34], maxZoom: 14 });
        } else {
          map.setView([-29.918, -51.18], 13);
        }
      }

      if (signatureChanged) {
        window.setTimeout(() => {
          if (cancelled) return;
          const visible = regions
            .filter((region) => map.getBounds().contains([region.lat, region.lng]))
            .map((region) => region.bairro);
          onViewportChange(visible, []);
        }, 260);
      }
    }

    updateMarkers();
    return () => {
      cancelled = true;
    };
  }, [points, regions, selectedItemIds, selectedRegion, zoom, onSelectItem, onSelectRegion, onViewportChange]);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-extrabold text-foreground">Mapa por região</h2>
          <p className="text-xs text-muted-foreground">Ruas reais, zoom e imóveis por bairro</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {regions.reduce((total, region) => total + region.count, 0)} imóveis
        </span>
      </div>

      <div className="relative h-[520px]">
        <div ref={mapElementRef} className="h-full w-full" />
        {regions.length === 0 ? (
          <div className="absolute inset-0 z-[401] flex items-center justify-center bg-white/75 px-8 text-center text-sm text-muted-foreground">
            Ajuste os filtros para visualizar imóveis no mapa.
          </div>
        ) : null}
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
