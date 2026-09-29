import { useMemo, useState } from "react";
import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { Bell, Building2, CalendarDays, ClipboardList, FileText, Heart, Home, LogOut, Mail, Phone, Receipt, ShieldCheck, User, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import {
  canAccessPortalPath,
  clearLocalPortalSession,
  firstPortalPath,
  getLocalPortalSession,
  type PortalPermission,
} from "@/lib/portal-auth";
import { condoBills, condoRequests, ownerProposals, ownerTransfers } from "@/lib/portal-demo";

function hasSupabaseEnv() {
  const hasValue = (value: unknown) =>
    typeof value === "string" &&
    value.trim() !== "" &&
    value !== "undefined" &&
    value !== "null";

  return hasValue(import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL) &&
    hasValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY);
}

export const Route = createFileRoute("/portal")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const localSession = getLocalPortalSession();
    if (localSession) {
      if (location.pathname === "/portal" || location.pathname === "/portal/") {
        throw redirect({ to: localSession.defaultPath });
      }

      if (!canAccessPortalPath(location.pathname, localSession.permissions)) {
        throw redirect({ to: firstPortalPath(localSession.permissions) });
      }

      return {
        user: {
          id: localSession.id,
          email: localSession.email,
          user_metadata: {
            nome: localSession.name,
            fullName: localSession.fullName,
            login: localSession.login,
            phone: localSession.phone,
            document: localSession.document,
            address: localSession.address,
          },
        },
        permissions: localSession.permissions,
        roles: localSession.permissions,
        isLocal: true,
      };
    }

    if (!hasSupabaseEnv()) {
      throw redirect({ to: "/entrar" });
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/entrar" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    return {
      user: data.user,
      permissions: ["locatario"] as PortalPermission[],
      roles: roles?.map((item) => item.role) ?? [],
      isLocal: false,
    };
  },
  component: PortalLayout,
});

const locatarioNav = [
  { to: "/portal/locatario", label: "Visão geral", icon: Home },
  { to: "/portal/locatario/contrato", label: "Contratos", icon: FileText },
  { to: "/portal/locatario/boletos", label: "Boletos", icon: Receipt },
  { to: "/portal/locatario/chamados", label: "Chamados", icon: Wrench },
];

const proprietarioNav = [
  { to: "/portal/proprietario", label: "Painel proprietário", icon: Building2 },
  { to: "/portal/proprietario/imoveis", label: "Meus imóveis", icon: Home },
  { to: "/portal/proprietario/contratos", label: "Contratos", icon: FileText },
  { to: "/portal/proprietario/financeiro", label: "Financeiro", icon: Receipt },
  { to: "/portal/proprietario/documentos", label: "Documentos", icon: ClipboardList },
];

const sindicoNav = [
  { to: "/portal/sindico", label: "Painel condômino", icon: Building2 },
  { to: "/portal/sindico/condominios", label: "Condomínios", icon: Home },
  { to: "/portal/sindico/boletos", label: "Boletos", icon: Receipt },
  { to: "/portal/sindico/solicitacoes", label: "Solicitações", icon: Wrench },
];

const commonNav = [
  { to: "/favoritos", label: "Favoritos", icon: Heart },
];

function PortalLayout() {
  const [openPanel, setOpenPanel] = useState<"perfil" | "notificacoes" | null>(null);
  const navigate = useNavigate();
  const ctx = Route.useRouteContext();
  const metadata = (ctx.user as any)?.user_metadata ?? {};
  const nome = metadata.nome ?? "Cliente";
  const fullName = metadata.fullName ?? metadata.nome ?? "Cliente Segura";
  const email = ctx.user.email ?? "cliente@segura.com";
  const login = metadata.login ?? "cliente";
  const phone = metadata.phone ?? "(51) 2102-4000";
  const document = metadata.document ?? "CPF/CNPJ cadastrado no BXP";
  const address = metadata.address ?? "Canoas - RS";
  const permissions = (ctx as any).permissions as PortalPermission[];
  const nav = [
    ...(permissions.includes("locatario") ? locatarioNav : []),
    ...(permissions.includes("proprietario") ? proprietarioNav : []),
    ...(permissions.includes("sindico") ? sindicoNav : []),
    ...commonNav,
  ];
  const profileLabels = permissions.map((permission) => ({
    locatario: "Locatário",
    proprietario: "Proprietário",
    sindico: "Condômino",
  }[permission]));
  const notifications = useMemo(() => {
    const items = [
      ...(permissions.includes("proprietario")
        ? [
            { title: "Nova proposta recebida", text: `${ownerProposals[0].client} enviou proposta para ${ownerProposals[0].property}.`, time: ownerProposals[0].date },
            { title: "Repasse atualizado", text: `${ownerTransfers[0].month} previsto em ${ownerTransfers[0].net.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`, time: "Hoje" },
          ]
        : []),
      ...(permissions.includes("sindico")
        ? [
            { title: "Boleto condominial em aberto", text: `${condoBills[0].title} vence em ${condoBills[0].due}.`, time: "Hoje" },
            { title: "Solicitação alterada", text: `${condoRequests[0].id} mudou para ${condoRequests[0].status}.`, time: condoRequests[0].date },
          ]
        : []),
      ...(permissions.includes("locatario")
        ? [
            { title: "Boleto disponível", text: "Boleto de agosto disponível para segunda via.", time: "Hoje" },
            { title: "Chamado respondido", text: "A equipe técnica respondeu seu chamado de manutenção.", time: "Ontem" },
          ]
        : []),
    ];

    return items.slice(0, 5);
  }, [permissions]);

  const sair = async () => {
    clearLocalPortalSession();
    if (!(ctx as any).isLocal && hasSupabaseEnv()) await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[262px_1fr]">
        <aside className="h-fit rounded-xl border bg-white p-6 shadow-xl shadow-black/5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-extrabold text-white">
              {nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-neutral-950">Cliente Segura</p>
              <p className="text-sm text-neutral-500">{email}</p>
            </div>
          </div>

          <nav className="mt-7 space-y-2">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to !== "/favoritos" }}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50 [&.active]:bg-primary [&.active]:text-white"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={sair}
            className="mt-10 flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold text-primary"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </aside>

        <section className="min-w-0">
          <div className="relative mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => setOpenPanel((value) => value === "notificacoes" ? null : "notificacoes")}
              className="relative rounded-lg p-2 text-primary hover:bg-primary/10"
              aria-label="Abrir notificacoes"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />}
            </button>
            <button
              type="button"
              onClick={() => setOpenPanel((value) => value === "perfil" ? null : "perfil")}
              className="ml-2 rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
              aria-label="Abrir perfil"
            >
              <User className="h-5 w-5" />
            </button>

            {openPanel === "notificacoes" && (
              <div className="absolute right-10 top-11 z-30 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl border bg-white p-4 shadow-2xl shadow-black/15">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-lg font-extrabold">Notificacoes</h2>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {notifications.length} novas
                  </span>
                </div>
                <div className="space-y-3">
                  {notifications.map((item) => (
                    <div key={`${item.title}-${item.text}`} className="rounded-xl bg-[#fbfaf8] p-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{item.title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-neutral-600">{item.text}</p>
                          <p className="mt-2 text-xs font-bold text-primary">{item.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {openPanel === "perfil" && (
              <div className="absolute right-0 top-11 z-30 w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl border bg-white p-5 shadow-2xl shadow-black/15">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-extrabold text-white">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-xl font-extrabold">{fullName}</h2>
                    <p className="text-sm text-neutral-500">{email}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    { icon: ShieldCheck, label: "Perfil de acesso", value: profileLabels.join(" + ") },
                    { icon: User, label: "Usuário", value: login },
                    { icon: Mail, label: "E-mail", value: email },
                    { icon: Phone, label: "Telefone", value: phone },
                    { icon: FileText, label: "Documento", value: document },
                    { icon: Home, label: "Endereço vinculado", value: address },
                    { icon: CalendarDays, label: "Entrada no portal", value: new Date().toLocaleString("pt-BR") },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-3 rounded-xl bg-[#fbfaf8] p-3">
                      <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase text-neutral-500">{item.label}</p>
                        <p className="break-words text-sm font-semibold text-neutral-900">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
