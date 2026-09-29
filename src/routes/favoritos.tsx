import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Heart, Lock, Mail, Phone } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ImovelCard, type ImovelResumo } from "@/components/site/ImovelCard";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getFavoriteContact,
  getFavoriteIds,
  getFavoriteItems,
  hasFavoriteSessionToday,
  saveFavoriteContact,
  saveClientFavoriteSession,
  authenticateFavoriteAccount,
} from "@/lib/public-favorites";
import { registerFavoriteAccess } from "@/lib/favorite-access.functions";
import { getImovel, listImoveis } from "@/lib/imoveis.functions";
import {
  authenticateLocalPortalContact,
  findLocalPortalUserByContact,
  getLocalPortalSession,
  hasLocalPortalSessionToday,
} from "@/lib/portal-auth";

export const Route = createFileRoute("/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos | Imobiliária Segura" }] }),
  component: Page,
});

function Page() {
  const listFn = useServerFn(listImoveis);
  const detailFn = useServerFn(getImovel);
  const registerAccessFn = useServerFn(registerFavoriteAccess);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [savedItems, setSavedItems] = useState<ImovelResumo[]>([]);
  const [contactReady, setContactReady] = useState(false);
  const [checkingContact, setCheckingContact] = useState(true);
  const [accessMode, setAccessMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const contact = getFavoriteContact();
    if (contact) {
      if (contact.email) {
        setUsername(contact.email);
      } else if (contact.telefone) {
        setUsername(formatPhone(contact.telefone));
      }
    }
    const portalSession = getLocalPortalSession();
    if (hasLocalPortalSessionToday() && portalSession) {
      saveClientFavoriteSession({ email: portalSession.email, telefone: portalSession.phone });
      setContactReady(true);
    } else if (hasFavoriteSessionToday()) {
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

  const handleContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanValue = username.trim();
    const isPhone = isPhoneUsername(cleanValue);
    const contact = isPhone ? { email: "", telefone: cleanValue } : { email: cleanValue, telefone: "" };
    const digits = cleanValue.replace(/\D/g, "");
    if (!cleanValue || (!isPhone && !/^\S+@\S+\.\S+$/.test(cleanValue)) || (isPhone && digits.length < 10)) {
      toast.error(isPhone ? "Informe um telefone válido com DDD." : "Informe um e-mail válido.");
      return;
    }
    if (senha.length < 6) {
      toast.error("Crie ou informe uma senha com pelo menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    const client = authenticateLocalPortalContact(contact, senha);
    const knownClient = findLocalPortalUserByContact(contact);
    if (client) {
      saveClientFavoriteSession({ email: client.email, telefone: client.phone });
    } else if (knownClient) {
      setSubmitting(false);
      toast.error("Use a mesma senha cadastrada para a Área do Cliente.");
      return;
    } else {
      const account = await authenticateFavoriteAccount(contact, senha, accessMode);
      if (!account.ok) {
        setSubmitting(false);
        const messages = {
          "invalid-password": "Senha incorreta para este cadastro.",
          "not-found": "Não encontramos um cadastro com esse contato. Escolha Cadastro para criar seu acesso.",
          "already-exists": "Este contato já possui cadastro. Use a opção Entrar.",
          unsupported: "Este navegador não suporta o cadastro de favoritos.",
        };
        toast.error(messages[account.reason]);
        return;
      }
    }

    saveFavoriteContact(contact);
    registerAccessFn({
      data: {
        email: contact.email,
        telefone: contact.telefone,
        localizacao: await getBrowserLocation(),
      },
    }).catch(() => {
      console.error("[Favoritos] Não foi possível registrar o acesso.");
    });
    setContactReady(true);
    setSubmitting(false);
    toast.success(client ? "Favoritos liberados com seu cadastro de cliente." : accessMode === "register" ? "Cadastro criado e favoritos liberados." : "Favoritos liberados neste navegador.");
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
            Salve imóveis, volte depois e compartilhe as opções com um acesso simples e seguro.
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
              Clientes Segura usam os mesmos dados da Área do Cliente. Novos interessados podem criar um acesso básico.
            </p>
            <form className="mt-5 space-y-3" onSubmit={handleContact}>
              <div className="grid grid-cols-2 rounded-md bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setAccessMode("login")}
                  className={`rounded-sm px-3 py-2 text-sm font-bold transition-colors ${accessMode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setAccessMode("register")}
                  className={`rounded-sm px-3 py-2 text-sm font-bold transition-colors ${accessMode === "register" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  Cadastro
                </button>
              </div>
              <div>
                <Label htmlFor="favorite-username" className="mb-1.5 block">Usuário</Label>
                <div className="relative">
                  {isPhoneUsername(username) ? <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /> : <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />}
                  <Input
                    id="favorite-username"
                    type="text"
                    inputMode={isPhoneUsername(username) ? "tel" : "email"}
                    placeholder="E-mail ou telefone com DDD"
                    className="pl-10"
                    value={username}
                    onChange={(event) => {
                      const value = event.target.value;
                      setUsername(isPhoneUsername(value) ? formatPhone(value) : value);
                    }}
                    autoComplete="username"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="favorite-password" className="mb-1.5 block">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="favorite-password"
                    type="password"
                    placeholder="Crie ou informe sua senha"
                    className="pl-10"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Validando..." : accessMode === "login" ? "Entrar nos favoritos" : "Criar cadastro"}
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

function getBrowserLocation() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(undefined);
  }

  return new Promise<{ latitude: number; longitude: number; precisao?: number } | undefined>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          precisao: position.coords.accuracy,
        });
      },
      () => resolve(undefined),
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 3500 },
    );
  });
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isPhoneUsername(value: string) {
  return !value.includes("@") && /^[\d\s()+-]*$/.test(value);
}
