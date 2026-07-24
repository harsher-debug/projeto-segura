import { useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  CalendarDays,
  Camera,
  FileText,
  Grid3X3,
  HelpCircle,
  Home,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
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
  { to: "/app/dashboard", label: "Painel", icon: Grid3X3 },
  { to: "/app/leads", label: "Leads", icon: Users },
  { to: "/app/imoveis", label: "Imoveis", icon: Building2 },
  { to: "/app/visitas", label: "Visitas", icon: CalendarDays },
  { to: "/app/propostas", label: "Propostas", icon: FileText },
];

const profileItems = [
  { label: "Deixe sua opiniao", icon: MessageCircle },
  { label: "Suporte", icon: HelpCircle },
  { label: "Alterar foto do perfil", icon: Camera },
  { label: "Alterar senha", icon: LockKeyhole },
  { label: "Preferencias", icon: Settings },
  { label: "Ultimos acessos", icon: KeyRound },
  { label: "Sobre", icon: Bell },
];

function AppLayout() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const sair = async () => {
    const localAdmin = getLocalAdminSession();
    clearLocalAdminSession();
    if (!localAdmin) await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-neutral-900">
      <header className="sticky top-0 z-[120] shadow-md shadow-black/15">
        <div className="h-16 bg-[#56585b]">
          <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4">
            <Link to="/app/dashboard" className="flex items-center">
              <Logo light className="h-12" />
            </Link>

            <nav className="hidden h-full items-stretch md:flex">
              {nav.slice(0, 1).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2 border-l border-white/10 px-5 text-sm font-bold text-white transition hover:bg-black/20 [&.active]:bg-[#3d3f42]"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="relative flex items-center gap-2 border-l border-white/10 px-5 text-sm font-bold text-white transition hover:bg-black/20"
              >
                <User className="h-4 w-4" />
                Perfil
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center border-l border-white/10 px-5 text-white transition hover:bg-black/20"
                aria-label="Menu administrativo"
              >
                <Menu className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>

        <div className="bg-[#f00000]">
          <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between px-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#f00000]">
                <User className="h-5 w-5" />
              </div>
              <span className="font-bold">Ola, Time Segura</span>
            </div>
            <Link
              to="/"
              className="hidden text-sm font-bold underline-offset-4 hover:underline md:inline-flex"
            >
              Acessar site
            </Link>
          </div>
        </div>

        {(profileOpen || menuOpen) && (
          <div className="absolute right-0 top-16 z-[130] w-64 bg-[#56585b] py-2 text-sm text-white shadow-xl">
            {profileOpen && (
              <>
                {profileItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="flex w-full items-center gap-2 px-5 py-2 text-left hover:bg-black/20"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={sair}
                  className="flex w-full items-center gap-2 px-5 py-2 text-left hover:bg-black/20"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </>
            )}

            {menuOpen && (
              <>
                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-5 py-2 hover:bg-black/20"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-5 py-2 hover:bg-black/20"
                >
                  <Home className="h-4 w-4" />
                  Ver site
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="min-h-[calc(100vh-112px)] bg-[linear-gradient(135deg,rgba(0,0,0,0.025)_25%,transparent_25%),linear-gradient(225deg,rgba(0,0,0,0.025)_25%,transparent_25%),linear-gradient(45deg,rgba(0,0,0,0.02)_25%,transparent_25%),linear-gradient(315deg,rgba(0,0,0,0.02)_25%,#fafafa_25%)] bg-[length:220px_220px] bg-[position:0_0,0_0,0_0,0_0]">
        <div className="mx-auto max-w-[1600px] px-5 py-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
