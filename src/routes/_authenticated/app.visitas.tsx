import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/visitas")({
  component: VisitasPage,
});

const visits = [
  { date: "25/07/2026", hour: "10:30", client: "Camila Martins", property: "Cod. 5708 - Casa resid. 2 dormitorios", place: "Mathias Velho", status: "Confirmada" },
  { date: "25/07/2026", hour: "14:00", client: "Rafael Souza", property: "Cod. 1089 - Apartamento a venda", place: "Moinhos de Vento", status: "Aguardando" },
  { date: "27/07/2026", hour: "09:15", client: "Bruno Pereira", property: "Cod. 1950 - Sala comercial", place: "Centro", status: "Confirmada" },
];

function VisitasPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c7a45a]">Agenda</p>
        <h1 className="font-display text-3xl font-extrabold">Visitas</h1>
        <p className="text-sm text-neutral-500">Agendamentos do site e acompanhamento da equipe.</p>
      </div>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="divide-y">
          {visits.map((visit) => (
            <article key={`${visit.date}-${visit.hour}-${visit.client}`} className="grid gap-4 p-5 md:grid-cols-[160px_1fr_160px] md:items-center">
              <div className="rounded-xl bg-[#fff5dc] p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-[#8e641a]">
                  <CalendarDays className="h-4 w-4" />
                  {visit.date}
                </p>
                <p className="mt-1 font-display text-2xl font-extrabold">{visit.hour}</p>
              </div>
              <div>
                <h2 className="font-display text-lg font-extrabold">{visit.client}</h2>
                <p className="text-sm text-neutral-500">{visit.property}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
                  <MapPin className="h-4 w-4 text-[#a50f1b]" />
                  {visit.place}, Canoas
                </p>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${visit.status === "Confirmada" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-[#a50f1b]"}`}>
                {visit.status}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
