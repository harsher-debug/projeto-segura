import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, ShieldCheck } from "lucide-react";
import { adminAccesses } from "@/lib/admin-demo";

export const Route = createFileRoute("/_authenticated/app/acessos")({
  component: AcessosPage,
});

function AcessosPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c7a45a]">Portal do cliente</p>
        <h1 className="font-display text-3xl font-extrabold">Acessos</h1>
        <p className="text-sm text-neutral-500">Usuarios liberados para locatario, proprietario e sindico.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-4">
        {adminAccesses.map((access) => (
          <article key={access.name} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#a50f1b] text-lg font-extrabold text-white">
                {access.name.charAt(0)}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${access.status === "Ativo" ? "bg-emerald-100 text-emerald-700" : "bg-[#fff5dc] text-[#8e641a]"}`}>
                {access.status}
              </span>
            </div>
            <h2 className="mt-5 font-display text-lg font-extrabold">{access.name}</h2>
            <p className="text-sm text-neutral-500">{access.contact}</p>
            <div className="mt-5 rounded-xl bg-[#f7f5f2] p-4">
              <p className="flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="h-4 w-4 text-[#a50f1b]" />
                Perfil {access.profile}
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                <KeyRound className="h-3.5 w-3.5" />
                Ultimo acesso: {access.lastAccess}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
