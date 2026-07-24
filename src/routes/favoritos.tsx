import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Heart, Mail, Phone } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ImovelCard, type ImovelResumo } from "@/components/site/ImovelCard";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getFavoriteContact,
  getFavoriteIds,
  getFavoriteItems,
  saveFavoriteContact,
} from "@/lib/public-favorites";
import { getImovel, listImoveis } from "@/lib/imoveis.functions";

export const Route = createFileRoute("/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos | Imobiliária Segura" }] }),
  component: Page,
});

function Page() {
  const listFn = useServerFn(listImoveis);
  const detailFn = useServerFn(getImovel);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [savedItems, setSavedItems] = useState<ImovelResumo[]>([]);
  const [contactReady, setContactReady] = useState(false);
  const [checkingContact, setCheckingContact] = useState(true);
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    const contact = getFavoriteContact();
    if (contact) {
      setEmail(contact.email ?? "");
      setTelefone(contact.telefone ?? "");
      setContactReady(true);
    }
    setCheckingContact(false);

    const syncFavorites = () => {
      setFavoriteIds(getFavoriteIds());
      setSavedItems(getFavoriteItems());
    };
    syncFavorites();
    window.addEventListener("segura:favorites-change", syncFavorites);
    return () => window.removeEventListener("segura:favorites-change", syncFavorites);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ["favoritos-publicos"],
    queryFn: () => listFn({ data: { page: 1, pageSize: 500 } }),
  });

  const { data: detailItems = [], isFetching: isFetchingDetails } = useQuery({
    queryKey: ["favoritos-publicos-detalhes", favoriteIds],
    enabled: contactReady && favoriteIds.length > 0,
    queryFn: async () => {
      const rows = await Promise.all(
        favoriteIds.map((id) => detailFn({ data: { id } }).catch(() => null)),
      );
      return rows.filter(Boolean) as ImovelResumo[];
    },
  });

  const favoritos = useMemo(() => {
    const merged = new Map<string, ImovelResumo>();
    for (const item of savedItems) {
      if (favoriteIds.includes(item.id)) merged.set(item.id, item);
    }
    for (const item of detailItems) {
      if (favoriteIds.includes(item.id)) merged.set(item.id, item);
    }
    for (const item of ((data?.items ?? []) as ImovelResumo[])) {
      if (favoriteIds.includes(item.id)) merged.set(item.id, item);
    }
    return favoriteIds
      .map((id) => merged.get(id))
      .filter(Boolean) as ImovelResumo[];
  }, [data?.items, detailItems, favoriteIds, savedItems]);

  const handleContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = email.trim();
    const cleanPhone = telefone.trim();
    if (!cleanEmail && !cleanPhone) {
      toast.error("Informe um telefone ou e-mail para acessar seus favoritos.");
      return;
    }
    saveFavoriteContact({ email: cleanEmail, telefone: cleanPhone });
    setContactReady(true);
    toast.success("Favoritos liberados neste navegador.");
  };

  return (
    <SiteLayout>
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 max-w-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Heart className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold">
            Seus imóveis favoritos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Salve imóveis, volte depois e compartilhe as opções sem precisar ter login de cliente.
          </p>
        </div>

        {checkingContact ? (
          <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
            Carregando favoritos...
          </div>
        ) : !contactReady ? (
          <section className="max-w-xl rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="font-display text-xl font-extrabold">Acesse seus favoritos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Informe telefone ou e-mail para liberar os favoritos neste navegador.
            </p>
            <form className="mt-5 space-y-3" onSubmit={handleContact}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="E-mail para contato"
                  className="pl-10"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Telefone ou WhatsApp"
                  className="pl-10"
                  value={telefone}
                  onChange={(event) => setTelefone(event.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Acessar favoritos
              </Button>
            </form>
          </section>
        ) : (
          <>
            <div className="mb-6 flex flex-col justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold text-foreground">
                  {favoriteIds.length} {favoriteIds.length === 1 ? "imóvel salvo" : "imóveis salvos"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sua seleção fica salva neste navegador.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/alugar">Ver mais imóveis</Link>
              </Button>
            </div>

            {(isFetching || isFetchingDetails) && favoritos.length === 0 ? (
              <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
                Carregando favoritos...
              </div>
            ) : favoritos.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {favoritos.map((imovel) => (
                  <ImovelCard key={imovel.id} imovel={imovel} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed bg-card p-10 text-center">
                <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
                <h2 className="mt-4 font-display text-xl font-extrabold">Nenhum favorito ainda</h2>
                <p className="mt-2 text-muted-foreground">
                  Use o botão Favoritos nos cards dos imóveis para montar sua seleção.
                </p>
                <Button asChild className="mt-5">
                  <Link to="/alugar">Ver imóveis</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </SiteLayout>
  );
}
