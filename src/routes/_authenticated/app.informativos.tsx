import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createSiteInformativo,
  getSiteAppearanceSettings,
  getSiteInformativos,
  saveSiteAppearanceSettings,
  saveSiteInformativos,
  type SiteAppearanceSettings,
  type SiteInformativo,
} from "@/lib/site-informativos";

export const Route = createFileRoute("/_authenticated/app/informativos")({
  component: InformativosAdmin,
});

type FormState = {
  titulo: string;
  descricao: string;
  etiqueta: string;
  linkTexto: string;
  linkUrl: string;
  variante: SiteInformativo["variante"];
  ativo: boolean;
};

const emptyForm: FormState = {
  titulo: "",
  descricao: "",
  etiqueta: "Comunicado",
  linkTexto: "Saiba mais",
  linkUrl: "/contato",
  variante: "destaque",
  ativo: true,
};

function InformativosAdmin() {
  const [informativos, setInformativos] = useState<SiteInformativo[]>([]);
  const [appearance, setAppearance] = useState<SiteAppearanceSettings>({ informativoBarColor: "#241114" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    setInformativos(getSiteInformativos());
    setAppearance(getSiteAppearanceSettings());
  }, []);

  const ativos = useMemo(() => informativos.filter((item) => item.ativo).length, [informativos]);

  const persist = (next: SiteInformativo[]) => {
    setInformativos(next);
    saveSiteInformativos(next);
  };

  const updateInformativoBarColor = (informativoBarColor: string) => {
    if (!/^#[0-9a-f]{6}$/i.test(informativoBarColor)) return;
    const next = { ...appearance, informativoBarColor };
    setAppearance(next);
    saveSiteAppearanceSettings(next);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.titulo.trim() || !form.descricao.trim()) return;

    if (editingId) {
      const updated = informativos.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...form,
                titulo: form.titulo.trim(),
                descricao: form.descricao.trim(),
                etiqueta: form.etiqueta.trim() || "Comunicado",
                linkTexto: form.linkTexto.trim() || "Saiba mais",
                linkUrl: form.linkUrl.trim() || "/contato",
                atualizadoEm: new Date().toISOString(),
              }
            : item,
      );
      persist([
        ...updated.filter((item) => item.id === editingId),
        ...updated.filter((item) => item.id !== editingId),
      ]);
    } else {
      persist([
        createSiteInformativo({
          ...form,
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim(),
          etiqueta: form.etiqueta.trim() || "Comunicado",
          linkTexto: form.linkTexto.trim() || "Saiba mais",
          linkUrl: form.linkUrl.trim() || "/contato",
        }),
        ...informativos,
      ]);
    }

    setEditingId(null);
    setForm(emptyForm);
  };

  const edit = (item: SiteInformativo) => {
    setEditingId(item.id);
    setForm({
      titulo: item.titulo,
      descricao: item.descricao,
      etiqueta: item.etiqueta,
      linkTexto: item.linkTexto,
      linkUrl: item.linkUrl,
      variante: item.variante,
      ativo: item.ativo,
    });
  };

  const remove = (id: string) => {
    persist(informativos.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  const toggle = (id: string) => {
    persist(
      informativos.map((item) =>
        item.id === id ? { ...item, ativo: !item.ativo, atualizadoEm: new Date().toISOString() } : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#e40016_0%,#8e1221_48%,#211014_100%)] p-7 text-white shadow-2xl shadow-[#8e1221]/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#f2d78a]">Conteudo do site</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight">Informativos da home</h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-white/78">
              Cadastre comunicados, campanhas e avisos para aparecerem no site publico.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="font-display text-3xl font-extrabold">{informativos.length}</p>
              <p className="text-xs font-bold text-white/70">cadastrados</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="font-display text-3xl font-extrabold">{ativos}</p>
              <p className="text-xs font-bold text-white/70">ativos</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={submit} className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-[#a50f1b]">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-extrabold">
                {editingId ? "Editar informativo" : "Novo informativo"}
              </h3>
              <p className="text-sm text-neutral-500">O conteudo ativo aparece automaticamente na home.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-bold">Etiqueta</span>
              <Input value={form.etiqueta} onChange={(event) => setForm({ ...form, etiqueta: event.target.value })} />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-bold">Titulo</span>
              <Input
                value={form.titulo}
                onChange={(event) => setForm({ ...form, titulo: event.target.value })}
                placeholder="Ex.: Semana de visitas abertas"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-bold">Descricao</span>
              <Textarea
                value={form.descricao}
                onChange={(event) => setForm({ ...form, descricao: event.target.value })}
                placeholder="Explique o aviso em poucas linhas."
                className="min-h-28"
              />
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-bold">Texto do botao</span>
                <Input value={form.linkTexto} onChange={(event) => setForm({ ...form, linkTexto: event.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-bold">Link</span>
                <Input value={form.linkUrl} onChange={(event) => setForm({ ...form, linkUrl: event.target.value })} />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-bold">Visual</span>
                <select
                  value={form.variante}
                  onChange={(event) => setForm({ ...form, variante: event.target.value as SiteInformativo["variante"] })}
                  className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                >
                  <option value="destaque">Vermelho destaque</option>
                  <option value="claro">Claro</option>
                  <option value="escuro">Escuro</option>
                </select>
              </label>

              <label className="flex items-end gap-3 rounded-md border bg-[#fbfaf8] px-3 py-2">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(event) => setForm({ ...form, ativo: event.target.checked })}
                  className="mb-1 h-4 w-4"
                />
                <span>
                  <span className="block text-sm font-bold">Publicado</span>
                  <span className="block text-xs text-neutral-500">Mostrar no site</span>
                </span>
              </label>
            </div>

            <div className="rounded-md border bg-[#fbfaf8] p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold">Faixa global do informativo</p>
                  <p className="text-xs text-neutral-500">A cor aparece na faixa de avisos abaixo do cabeçalho.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.informativoBarColor}
                    onChange={(event) => updateInformativoBarColor(event.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-md border bg-white p-1"
                    aria-label="Escolher cor da faixa do informativo"
                  />
                  <Input
                    value={appearance.informativoBarColor.toUpperCase()}
                    onChange={(event) => updateInformativoBarColor(event.target.value.trim())}
                    className="h-10 w-28 font-mono text-sm uppercase"
                    maxLength={7}
                    aria-label="Código hexadecimal da faixa do informativo"
                  />
                </div>
              </div>
              <div className="mt-3 h-8 rounded-md" style={{ backgroundColor: appearance.informativoBarColor }} />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" className="bg-[#a50f1b] hover:bg-[#7e0d16]">
                {editingId ? "Salvar alterações" : "Publicar informativo"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="space-y-5">
          <article className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-extrabold">Informativos cadastrados</h3>
                <p className="text-sm text-neutral-500">Controle o que aparece no site.</p>
              </div>
              <Eye className="h-5 w-5 text-[#a50f1b]" />
            </div>

            <div className="space-y-3">
              {informativos.map((item) => (
                <div key={item.id} className="rounded-xl border bg-[#fbfaf8] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#fff5dc] px-2.5 py-1 text-xs font-black uppercase text-[#8e641a]">
                          {item.etiqueta}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.ativo ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>
                          {item.ativo ? "Ativo" : "Oculto"}
                        </span>
                      </div>
                      <h4 className="mt-3 font-display text-lg font-extrabold">{item.titulo}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-600">{item.descricao}</p>
                      <p className="mt-2 text-xs text-neutral-400">
                        Atualizado em {new Date(item.atualizadoEm).toLocaleString("pt-BR")}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => toggle(item.id)}>
                        {item.ativo ? "Ocultar" : "Ativar"}
                      </Button>
                      <Button type="button" variant="outline" size="icon" onClick={() => edit(item)} aria-label="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="icon" onClick={() => remove(item.id)} aria-label="Remover">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-display text-xl font-extrabold">Preview no site</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {informativos.filter((item) => item.ativo).map((item) => (
                <PreviewCard key={item.id} item={item} />
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function PreviewCard({ item }: { item: SiteInformativo }) {
  const styles = {
    destaque: "bg-[linear-gradient(135deg,#e40016_0%,#8e1221_55%,#211014_100%)] text-white",
    claro: "bg-[#fff7e4] text-neutral-950",
    escuro: "bg-[#211014] text-white",
  }[item.variante];

  return (
    <div className={`rounded-xl p-5 ${styles}`}>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6ad57]">{item.etiqueta}</p>
      <h4 className="mt-3 font-display text-xl font-extrabold">{item.titulo}</h4>
      <p className={`mt-2 text-sm leading-relaxed ${item.variante === "claro" ? "text-neutral-600" : "text-white/78"}`}>
        {item.descricao}
      </p>
    </div>
  );
}
