import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Users, ShieldCheck, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/entrar")({
  head: () => ({ meta: [{ title: "Área do Cliente | Imobiliária Segura" }] }),
  component: EntrarPage,
});

type Perfil = "locatario" | "proprietario" | "admin";

const PERFIS: { id: Perfil; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  {
    id: "locatario",
    label: "Locatário",
    desc: "Acesse boletos, contrato e chamados",
    icon: Users,
    color: "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-400",
  },
  {
    id: "proprietario",
    label: "Proprietário",
    desc: "Gerencie seus imóveis e repasses",
    icon: Building2,
    color: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400",
  },
  {
    id: "admin",
    label: "Equipe / Admin",
    desc: "Painel administrativo completo",
    icon: ShieldCheck,
    color: "border-purple-200 bg-purple-50 text-purple-700 hover:border-purple-400",
  },
];

const destinos: Record<Perfil, string> = {
  locatario: "/portal/locatario",
  proprietario: "/portal/proprietario",
  admin: "/app/dashboard",
};

function EntrarPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil) return;
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            emailRedirectTo: window.location.origin + destinos[perfil],
            data: { nome, perfil },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode acessar.");
        navigate({ to: destinos[perfil] });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: destinos[perfil] });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao autenticar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-secondary via-secondary/90 to-secondary/70">
      {/* Lateral decorativa */}
      <div className="hidden flex-col justify-between p-10 lg:flex lg:w-2/5 xl:w-1/3">
        <Logo light />
        <div>
          <blockquote className="text-lg font-medium text-white/90 leading-relaxed">
            "Há mais de 55 anos cuidando do seu patrimônio com segurança e transparência."
          </blockquote>
          <p className="mt-3 text-sm text-white/60">Imobiliária Segura · Canoas, RS</p>
        </div>
        <div className="space-y-2">
          {["Segurança Jurídica", "Transparência Financeira", "Atendimento Especializado"].map((t) => (
            <div key={t} className="flex items-center gap-2 text-sm text-white/70">
              <ShieldCheck className="h-4 w-4 text-primary" /> {t}
            </div>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-card p-8 shadow-2xl">
            <div className="flex justify-center lg:hidden mb-6">
              <Logo />
            </div>

            {!perfil ? (
              /* Seleção de Perfil */
              <div>
                <h1 className="font-display text-2xl font-extrabold text-center">
                  Área do Cliente
                </h1>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Selecione como deseja acessar
                </p>
                <div className="mt-6 space-y-3">
                  {PERFIS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPerfil(p.id)}
                      className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${p.color}`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/70">
                        <p.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{p.label}</p>
                        <p className="text-xs opacity-75">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-6 text-center">
                  <Link to="/" className="text-xs text-muted-foreground hover:text-primary">
                    ← Voltar ao site
                  </Link>
                </p>
              </div>
            ) : (
              /* Formulário de Login */
              <div>
                <button
                  onClick={() => setPerfil(null)}
                  className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  ← Voltar
                </button>
                <h1 className="font-display text-2xl font-extrabold">
                  {mode === "login" ? "Entrar" : "Criar conta"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Acesso como{" "}
                  <span className="font-semibold text-foreground">
                    {PERFIS.find((p) => p.id === perfil)?.label}
                  </span>
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  {mode === "signup" && (
                    <div>
                      <Label htmlFor="nome">Nome completo</Label>
                      <Input
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome"
                        required
                        className="mt-1"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="senha">Senha</Label>
                      {mode === "login" && (
                        <button type="button" className="text-xs text-primary hover:underline">
                          Esqueci a senha
                        </button>
                      )}
                    </div>
                    <div className="relative mt-1">
                      <Input
                        id="senha"
                        type={showSenha ? "text" : "password"}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenha(!showSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
                  </Button>
                </form>

                <p className="mt-5 text-center text-sm text-muted-foreground">
                  {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
                  <button
                    className="font-semibold text-primary"
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  >
                    {mode === "login" ? "Criar agora" : "Entrar"}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
