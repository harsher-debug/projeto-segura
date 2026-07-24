import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, IdCard, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/entrar")({
  head: () => ({ meta: [{ title: "Área do Cliente | Segura Imobiliária" }] }),
  component: EntrarPage,
});

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function EntrarPage() {
  const [documento, setDocumento] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (documento.trim().toLowerCase() === "admin" && senha === "0000") {
      setLoading(true);
      window.localStorage.setItem("segura_cliente_nome", "Admin");
      window.localStorage.setItem("segura_cliente_tipo", "admin");
      window.setTimeout(() => {
        setLoading(false);
        navigate({ to: "/portal/locatario" });
      }, 250);
      return;
    }

    if (onlyDigits(documento).length < 11) {
      toast.error("Informe um CPF ou CNPJ válido.");
      return;
    }
    if (!senha) {
      toast.error("Informe a senha cadastrada no BXP.");
      return;
    }

    setLoading(true);
    window.localStorage.setItem("segura_cliente_nome", "Cliente");
    window.localStorage.removeItem("segura_cliente_tipo");
    window.setTimeout(() => {
      setLoading(false);
      navigate({ to: "/portal/locatario" });
    }, 350);
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-red-600 to-slate-950 p-8 text-white lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_26%),radial-gradient(circle_at_90%_90%,rgba(0,0,0,0.45),transparent_35%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <Logo light className="h-16" />
            </div>

            <div className="max-w-lg">
              <h1 className="font-display text-5xl font-extrabold leading-tight">
                Área exclusiva para clientes BXP.
              </h1>
              <p className="mt-5 text-lg font-medium text-white/85">
                O acesso só é liberado para CPF ou CNPJ cadastrado no sistema da imobiliária.
              </p>
            </div>

            <p className="text-sm text-white/65">© 2026 Segura Imobiliária</p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <Logo />
            </div>
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Validação local para teste
            </span>
            <h2 className="mt-7 font-display text-3xl font-extrabold text-neutral-950">
              Acesse sua área do cliente
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              Use CPF/CNPJ e senha BXP ou entre com o acesso local de administrador.
            </p>

            <form className="mt-8 space-y-5" onSubmit={submit}>
              <div>
                <Label htmlFor="documento" className="text-sm font-semibold text-neutral-900">
                  CPF, CNPJ ou usuário
                </Label>
                <div className="relative mt-2">
                  <IdCard className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    id="documento"
                    value={documento}
                    onChange={(event) => setDocumento(event.target.value)}
                    placeholder="Digite admin para acesso local"
                    className="h-11 rounded-md border-red-300 pl-11 focus-visible:ring-primary"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="senha" className="text-sm font-semibold text-neutral-900">
                  Senha
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    placeholder="Senha cadastrada ou 0000"
                    className="h-11 rounded-md pl-11"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-md bg-primary text-sm font-bold text-white hover:bg-primary/90"
              >
                <User className="mr-2 h-4 w-4" />
                {loading ? "Validando..." : "Entrar"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-neutral-500">
              Acesso local de teste: usuário admin e senha 0000.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
