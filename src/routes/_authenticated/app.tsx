import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  FileCheck2,
  FileText,
  Home,
  Info,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Receipt,
  Search,
  User,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";
import { clearLocalAdminSession, getLocalAdminSession } from "@/lib/admin-auth";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

const nav = [
  { to: "/app/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/app/imoveis", label: "Imóveis", icon: Building2 },
  { to: "/app/contratos", label: "Contratos", icon: FileText },
  { to: "/app/boletos", label: "Boletos", icon: Receipt },
  { to: "/app/propostas", label: "Propostas", icon: FileCheck2 },
  { to: "/app/informativos", label: "Informativos", icon: Info },
  { to: "/app/acessos", label: "Acessos", icon: KeyRound },
  { to: "/app/leads", label: "Leads", icon: Users },
  { to: "/app/visitas", label: "Visitas", icon: CalendarDays },
];

function AppLayout() {
  const navigate = useNavigate();

  const sair = async () => {
    const localAdmin = getLocalAdminSession();
    clearLocalAdminSession();
    if (!localAdmin) await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-neutral-950">
      <aside className="fixed inset-y-0 left-0 z-[110] hidden w-[272px] border-r border-white/10 bg-[linear-gradient(180deg,#e40016_0%,#70111f_48%,#170c10_100%)] text-white shadow-2xl shadow-black/20 lg:block">
        <div className="flex h-24 items-center border-b border-white/10 px-7">
          <Logo light className="h-16" />
        </div>

        <nav className="space-y-1 px-4 py-5">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-white/78 transition hover:bg-white/10 hover:text-white [&.active]:bg-white [&.active]:text-[#a50f1b]"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
          <Link
            to="/"
            className="mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Ver site
          </Link>
          <button
            type="button"
            onClick={sair}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-[100] border-b border-[#e5d8bd] bg-white/92 shadow-sm backdrop-blur">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-5 lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c7a45a]">
                Admin Segura
              </p>
              <h1 className="font-display text-xl font-extrabold text-neutral-950">
                Gestao do site e atendimento
              </h1>
            </div>

            <div className="hidden min-w-[320px] items-center gap-3 rounded-full border bg-[#f8f6f2] px-4 py-2.5 md:flex">
              <Search className="h-4 w-4 text-neutral-400" />
              <span className="text-sm text-neutral-500">Buscar imovel, cliente, contrato...</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-extrabold">Administrador</p>
                <p className="text-xs text-neutral-500">adminsite@segura.local</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#a50f1b] text-white shadow-md shadow-[#a50f1b]/20">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="h-1 bg-[#d6ad57]" />

          <div className="flex gap-2 overflow-x-auto px-4 py-3 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border bg-white px-3 py-2 text-xs font-bold text-neutral-700 [&.active]:border-[#a50f1b] [&.active]:bg-[#a50f1b] [&.active]:text-white"
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            ))}
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
