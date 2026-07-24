import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { Bell, Building2, ClipboardList, FileText, Heart, Home, LogOut, Receipt, User, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import {
  canAccessPortalPath,
  clearLocalPortalSession,
  firstPortalPath,
  getLocalPortalSession,
  type PortalPermission,
} from "@/lib/portal-auth";

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
          user_metadata: { nome: localSession.name, login: localSession.login },
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
  { to: "/portal/locatario", label: "Visao geral", icon: Home },
  { to: "/portal/locatario/contrato", label: "Contratos", icon: FileText },
  { to: "/portal/locatario/boletos", label: "Boletos", icon: Receipt },
  { to: "/portal/locatario/chamados", label: "Chamados", icon: Wrench },
];

const proprietarioNav = [
  { to: "/portal/proprietario", label: "Painel proprietario", icon: Building2 },
  { to: "/portal/proprietario/imoveis", label: "Meus imoveis", icon: Home },
  { to: "/portal/proprietario/contratos", label: "Contratos", icon: FileText },
  { to: "/portal/proprietario/financeiro", label: "Financeiro", icon: Receipt },
  { to: "/portal/proprietario/documentos", label: "Documentos", icon: ClipboardList },
];

const sindicoNav = [
  { to: "/portal/sindico", label: "Painel condomino", icon: Building2 },
  { to: "/portal/sindico/condominios", label: "Condominios", icon: Home },
  { to: "/portal/sindico/boletos", label: "Boletos", icon: Receipt },
  { to: "/portal/sindico/solicitacoes", label: "Solicitacoes", icon: Wrench },
];

const commonNav = [
  { to: "/favoritos", label: "Favoritos", icon: Heart },
];

function PortalLayout() {
  const navigate = useNavigate();
  const ctx = Route.useRouteContext();
  const nome = (ctx.user as any)?.user_metadata?.nome ?? "Cliente";
  const email = ctx.user.email ?? "cliente@segura.com";
  const permissions = (ctx as any).permissions as PortalPermission[];
  const nav = [
    ...(permissions.includes("locatario") ? locatarioNav : []),
    ...(permissions.includes("proprietario") ? proprietarioNav : []),
    ...(permissions.includes("sindico") ? sindicoNav : []),
    ...commonNav,
  ];

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
          <div className="mb-6 flex justify-end">
            <button className="relative rounded-lg p-2 text-primary hover:bg-primary/10">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </button>
            <button className="ml-2 rounded-lg p-2 text-neutral-500 hover:bg-neutral-100">
              <User className="h-5 w-5" />
            </button>
          </div>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
