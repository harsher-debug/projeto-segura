import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal/proprietario/documentos")({
  component: DocumentosPage,
});

const documentos = [
  { nome: "Contrato Ap. Centro", categoria: "Contrato", data: "01/01/2026" },
  { nome: "Extrato anual 2026", categoria: "Financeiro", data: "22/07/2026" },
  { nome: "Laudo de vistoria", categoria: "Vistoria", data: "02/01/2026" },
];

function DocumentosPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Documentos</h1>
          <p className="text-sm text-muted-foreground">Arquivos operacionais e financeiros.</p>
        </div>
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Enviar arquivo</Button>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="divide-y">
          {documentos.map((doc) => (
            <div key={doc.nome} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{doc.nome}</p>
                <p className="text-sm text-muted-foreground">{doc.categoria} - {doc.data}</p>
              </div>
              <Button size="sm" variant="outline"><Download className="mr-2 h-4 w-4" /> Baixar</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
