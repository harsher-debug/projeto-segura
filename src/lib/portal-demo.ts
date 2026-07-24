export const ownerProperties = [
  {
    code: "5732",
    title: "Apartamento 3 dormitorios",
    location: "Centro, Canoas",
    rent: 3490,
    status: "Locado",
    tenant: "Marina Costa",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
  },
  {
    code: "1082",
    title: "Casa terrea com garagem",
    location: "Centro, Canoas",
    rent: 0,
    status: "Em proposta",
    tenant: "Disponivel",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  },
];

export const ownerContracts = [
  { id: "CTR-5732", property: "Apartamento 3 dormitorios", tenant: "Marina Costa", period: "01/02/2026 a 31/01/2027", value: 3490, status: "Ativo" },
  { id: "ADM-1082", property: "Casa terrea com garagem", tenant: "Sem locatario", period: "Administracao ativa", value: 0, status: "Captacao" },
];

export const ownerTransfers = [
  { month: "Agosto/2026", property: "Cod. 5732", gross: 3490, fee: 349, net: 3141, status: "Previsto" },
  { month: "Julho/2026", property: "Cod. 5732", gross: 3490, fee: 349, net: 3141, status: "Pago" },
  { month: "Junho/2026", property: "Cod. 5732", gross: 3490, fee: 349, net: 3141, status: "Pago" },
];

export const ownerProposals = [
  { id: "PROP-1082", client: "Fernanda Lopes", property: "Casa terrea com garagem", value: 730000, status: "Em analise", date: "Hoje" },
  { id: "PROP-5732", client: "Carlos Ribeiro", property: "Apartamento 3 dormitorios", value: 3600, status: "Lista de espera", date: "Ontem" },
];

export const condoBills = [
  { id: "COND-0826", title: "Condominio agosto", due: "08/08/2026", value: 642, status: "Aberto" },
  { id: "COND-0726", title: "Condominio julho", due: "08/07/2026", value: 642, status: "Pago" },
  { id: "RES-0726", title: "Fundo de reserva", due: "15/07/2026", value: 85, status: "Pago" },
];

export const condoRequests = [
  { id: "#S1201", subject: "Manutencao elevador social", category: "Manutencao", status: "Em andamento", date: "Hoje" },
  { id: "#S1198", subject: "Reserva do salao de festas", category: "Reserva", status: "Aprovado", date: "Ontem" },
  { id: "#S1187", subject: "Duvida sobre prestacao de contas", category: "Financeiro", status: "Respondido", date: "22/07/2026" },
];

export const condoNotices = [
  { title: "Assembleia ordinaria", text: "Reuniao marcada para 05/08/2026 as 19h no salao principal.", tag: "Assembleia" },
  { title: "Limpeza da garagem", text: "Garagem B ficara em manutencao no dia 27/07 pela manha.", tag: "Aviso" },
  { title: "Prestacao de contas", text: "Relatorio de julho disponivel para consulta do condomino.", tag: "Financeiro" },
];

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
