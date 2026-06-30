import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { listImoveis, getFacets } from "@/lib/imoveis.functions";
import { ImovelCard } from "./ImovelCard";
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
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const listFn = useServerFn(listImoveis);
  const facetsFn = useServerFn(getFacets);

  const { data: facets } = useQuery({
    queryKey: ["facets", finalidade],
    queryFn: () => facetsFn({ data: { finalidade } }),
  });

  const set = (key: keyof Filtros, value: string) => {
    setFiltros((f) => ({ ...f, [key]: value }));
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

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1),
    [data],
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
          <Select value={filtros.cidade} onValueChange={(v) => set("cidade", v)}>
            <SelectTrigger><SelectValue placeholder="Cidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as cidades</SelectItem>
              {facets?.cidades.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtros.bairro} onValueChange={(v) => set("bairro", v)}>
            <SelectTrigger><SelectValue placeholder="Bairro" /></SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value={ALL}>Todos os bairros</SelectItem>
              {facets?.bairros.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtros.tipo} onValueChange={(v) => set("tipo", v)}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value={ALL}>Todos os tipos</SelectItem>
              {facets?.tipos.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filtros.dormitorios}
            onValueChange={(v) => set("dormitorios", v)}
          >
            <SelectTrigger><SelectValue placeholder="Dormitórios" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Dormitórios</SelectItem>
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}+ dorm.</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtros.vagas} onValueChange={(v) => set("vagas", v)}>
            <SelectTrigger><SelectValue placeholder="Vagas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Vagas</SelectItem>
              {[1, 2, 3].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}+ vagas</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtros.ordem} onValueChange={(v) => set("ordem", v)}>
            <SelectTrigger><SelectValue placeholder="Ordenar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="menor_preco">Menor preço</SelectItem>
              <SelectItem value="maior_preco">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            set("busca", buscaInput);
          }}
        >
          <Input
            placeholder="Buscar por código, bairro ou palavra-chave..."
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
          />
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

      {data && data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-12 text-center text-muted-foreground">
          Nenhum imóvel encontrado com esses filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(data?.items ?? []).map((imovel) => (
            <ImovelCard key={imovel.id} imovel={imovel as never} />
          ))}
        </div>
      )}

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