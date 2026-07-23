import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal/locatario/documentos")({
  component: DocumentosPage,
});

const documentos = [
  { nome: "Contrato de locacao", tipo: "PDF", data: "01/01/2026" },
  { nome: "Vistoria de entrada", tipo: "PDF", data: "02/01/2026" },
  { nome: "Comprovante de caucao", tipo: "PDF", data: "03/01/2026" },
];

function DocumentosPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Documentos</h1>
          <p className="text-sm text-muted-foreground">Arquivos vinculados ao seu contrato.</p>
        </div>
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Enviar documento</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {documentos.map((doc) => (
          <div key={doc.nome} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <p className="mt-4 font-semibold">{doc.nome}</p>
            <p className="text-sm text-muted-foreground">{doc.tipo} - {doc.data}</p>
            <Button className="mt-4 w-full" size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" /> Baixar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
