import { createFileRoute } from "@tanstack/react-router";
import { Building2, Mail, Phone, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/portal/proprietario/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground">Dados do proprietário e preferência de repasse.</p>
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Cadastro</p>
            <p className="text-xs text-muted-foreground">Use estes dados para comunicações da administração.</p>
          </div>
        </div>
        <form className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nome completo</Label>
            <Input className="mt-1" defaultValue="Proprietário Segura" />
          </div>
          <div>
            <Label>E-mail</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" defaultValue="proprietario@email.com" />
            </div>
          </div>
          <div>
            <Label>Telefone</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" defaultValue="(51) 99999-0000" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label>Chave Pix para repasse</Label>
            <div className="relative mt-1">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" defaultValue="proprietario@email.com" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Button type="button"><Save className="mr-2 h-4 w-4" /> Salvar alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
