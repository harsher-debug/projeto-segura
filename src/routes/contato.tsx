import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin, Phone, Mail, MessageCircle, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { createLeadPublic } from "@/lib/imoveis.functions";
import { whatsappLink } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | Imobiliária Segura" },
      {
        name: "description",
        content: "Fale com a Imobiliária Segura. Atendimento em Canoas e região.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const [enviado, setEnviado] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const createFn = useServerFn(createLeadPublic);

  const mutation = useMutation({
    mutationFn: () =>
      createFn({ data: { nome, telefone, email, observacoes: msg } }),
    onSuccess: () => {
      setEnviado(true);
      toast.success("Mensagem enviada com sucesso!");
    },
    onError: () => toast.error("Não foi possível enviar. Tente novamente."),
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="font-display text-3xl font-extrabold">Fale Conosco</h1>
        <p className="mt-1 text-muted-foreground">
          Estamos prontos para ajudar você a encontrar o imóvel ideal.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {[
              { icon: MapPin, t: "Endereço", d: "Canoas — RS, Brasil" },
              { icon: Phone, t: "Telefone", d: "(51) 2102-4000" },
              { icon: Mail, t: "E-mail", d: "imobiliaria@segura.com.br" },
            ].map((c) => (
              <div key={c.t} className="flex items-start gap-3 rounded-xl border bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{c.t}</p>
                  <p className="text-sm text-muted-foreground">{c.d}</p>
                </div>
              </div>
            ))}
            <a
              href={whatsappLink("Olá! Gostaria de falar com a Imobiliária Segura.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <MessageCircle className="h-5 w-5" /> Conversar no WhatsApp
            </a>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            {enviado ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <p className="mt-3 font-semibold">Mensagem enviada!</p>
                <p className="text-sm text-muted-foreground">
                  Nossa equipe entrará em contato em breve.
                </p>
              </div>
            ) : (
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (nome.length < 2) return toast.error("Informe seu nome.");
                  mutation.mutate();
                }}
              >
                <h2 className="font-display text-lg font-bold">Envie sua mensagem</h2>
                <Input placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                <Input placeholder="Telefone / WhatsApp" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                <Input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Textarea placeholder="Como podemos ajudar?" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Enviando..." : "Enviar mensagem"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}