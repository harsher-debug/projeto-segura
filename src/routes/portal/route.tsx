import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Building2, FileText, CreditCard, Wrench,
  Bell, LogOut, Home, ChevronRight, Menu, X, User,
  DollarSign, ClipboardList, Eye, Users, Settings,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/entrar" });
    // Buscar perfil/role do usuário
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const userRoles = roles?.map((r) => r.role) ?? [];
    return { user: data.user, roles: userRoles };
  },
  component: PortalLayout,
});

type NavItem = { to: string; label: string; icon: React.ElementType };

const navAdmin: NavItem[] = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/leads", label: "Leads", icon: Users },
  { to: "/app/imoveis", label: "Imóveis", icon: Building2 },
  { to: "/app/visitas", label: "Visitas", icon: Eye },
  { to: "/app/propostas", label: "Propostas", icon: ClipboardList },
];

const navProprietario: NavItem[] = [
  { to: "/portal/proprietario", label: "Início", icon: LayoutDashboard },
  { to: "/portal/proprietario/imoveis", label: "Meus Imóveis", icon: Building2 },
  { to: "/portal/proprietario/financeiro", label: "Financeiro", icon: DollarSign },
  { to: "/portal/proprietario/contratos", label: "Contratos", icon: FileText },
  { to: "/portal/proprietario/documentos", label: "Documentos", icon: ClipboardList },
  { to: "/portal/proprietario/perfil", label: "Meu Perfil", icon: User },
];

const navLocatario: NavItem[] = [
  { to: "/portal/locatario", label: "Início", icon: LayoutDashboard },
  { to: "/portal/locatario/boletos", label: "Boletos", icon: CreditCard },
  { to: "/portal/locatario/contrato", label: "Contrato", icon: FileText },
  { to: "/portal/locatario/chamados", label: "Chamados", icon: Wrench },
  { to: "/portal/locatario/documentos", label: "Documentos", icon: ClipboardList },
  { to: "/portal/locatario/perfil", label: "Meu Perfil", icon: User },
];

function PortalLayout() {
  const ctx = Route.useRouteContext();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = ctx.roles.includes("admin");
  const isCorretor = ctx.roles.includes("corretor");

  // Determinar perfil e nav com base na rota atual
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  let nav = navLocatario;
  let perfilLabel = "Locatário";
  let perfilColor = "bg-blue-500";

  if (isAdmin || isCorretor) {
    nav = navAdmin;
    perfilLabel = isAdmin ? "Administrador" : "Corretor";
    perfilColor = isAdmin ? "bg-red-500" : "bg-orange-500";
  } else if (path.startsWith("/portal/proprietario")) {
    nav = navProprietario;
    perfilLabel = "Proprietário";
    perfilColor = "bg-emerald-500";
  }

  const sair = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const nome = (ctx.user as any)?.user_metadata?.nome
    ?? ctx.user.email?.split("@")[0]
    ?? "Usuário";
  const initials = nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-sidebar-border p-4">
        <Logo light />
        <button className="md:hidden text-sidebar-foreground/60" onClick={() => setMobileOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Perfil */}
      <div className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${perfilColor} text-sm font-bold text-white`}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{nome}</p>
            <span className="inline-flex items-center rounded-full bg-sidebar-accent px-2 py-0.5 text-xs font-medium text-sidebar-foreground/70">
              {perfilLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Seletor de Portal (se admin/corretor podem acessar tudo) */}
      {(isAdmin || isCorretor) && (
        <div className="border-b border-sidebar-border p-3 space-y-1">
          <p className="px-2 text-xs font-semibold uppercase text-sidebar-foreground/40">Portais</p>
          <Link
            to="/portal/proprietario"
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent"
          >
            <Building2 className="h-3.5 w-3.5" /> Portal Proprietário
          </Link>
          <Link
            to="/portal/locatario"
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent"
          >
            <User className="h-3.5 w-3.5" /> Portal Locatário
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-all hover:bg-sidebar-accent [&.active]:bg-primary [&.active]:text-primary-foreground [&.active]:shadow-sm"
          >
            <n.icon className="h-4 w-4 shrink-0" />
            {n.label}
            <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0 [&.active]:opacity-100 transition-opacity" />
          </Link>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="space-y-0.5 border-t border-sidebar-border p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent"
        >
          <Home className="h-4 w-4" /> Ver site
        </Link>
        <button
          onClick={sair}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-sidebar text-sidebar-foreground">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header Mobile */}
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
          <button onClick={sair}>
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </button>
        </header>

        {/* Topbar Desktop */}
        <div className="hidden items-center justify-between border-b bg-background px-6 py-3 md:flex">
          <div />
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 hover:bg-muted">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${perfilColor} text-xs font-bold text-white`}>
              {initials}
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
