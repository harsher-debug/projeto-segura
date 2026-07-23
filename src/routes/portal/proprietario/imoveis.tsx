import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Building2, ExternalLink } from "lucide-react";
import { getProprietarioDashboard } from "@/lib/portal.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal/proprietario/imoveis")({
  component: ImoveisPage,
});

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ImoveisPage() {
  const dashFn = useServerFn(getProprietarioDashboard);
  const { data: user } = useQuery({
    queryKey: ["session"],
    queryFn: () => supabase.auth.getUser().then((r) => r.data.user),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["proprietario-imoveis", user?.id],
    queryFn: () => dashFn({ data: { userId: user?.id ?? "" } }),
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Meus Imoveis</h1>
        <p className="text-sm text-muted-foreground">Carteira administrada pela Segura.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(data?.imoveis ?? []).map((imovel) => (
          <div key={imovel.id} className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="aspect-[16/10] bg-muted">
              {imovel.imagem_principal  ? (
                <img src={imovel.imagem_principal} alt={imovel.titulo} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Building2 className="h-9 w-9" />
                </div>
              )}
            </div>
            <div className="space-y-3 p-4">
              <div>
                <p className="line-clamp-1 font-semibold capitalize">{imovel.titulo.toLowerCase()}</p>
                <p className="text-sm text-muted-foreground">{imovel.bairro}, {imovel.cidade} - Cod. {imovel.referencia}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-display text-xl font-extrabold">{brl(imovel.preco)}</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Ativo</span>
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link to="/imovel/$id" params={{ id: imovel.id }}>
                  <ExternalLink className="mr-2 h-4 w-4" /> Ver anuncio
                </Link>
              </Button>
            </div>
          </div>
        ))}
        {isLoading && <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">Carregando...</div>}
      </div>
    </div>
  );
}
