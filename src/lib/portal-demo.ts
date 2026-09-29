export const ownerProperties = [
  {
    code: "5732",
    title: "Apartamento com 3 dormitórios",
    location: "Centro, Canoas",
    rent: 3490,
    status: "Locado",
    tenant: "Marina Costa",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
  },
  {
    code: "1082",
    title: "Casa térrea com garagem",
    location: "Centro, Canoas",
    rent: 0,
    status: "Em proposta",
    tenant: "Disponível",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  },
];

export const ownerContracts = [
  { id: "CTR-5732", property: "Apartamento 3 dormitorios", tenant: "Marina Costa", period: "01/02/2026 a 31/01/2027", value: 3490, status: "Ativo" },
  { id: "ADM-1082", property: "Casa térrea com garagem", tenant: "Sem locatário", period: "Administração ativa", value: 0, status: "Captação" },
];

export const ownerTransfers = [
  { month: "Agosto/2026", property: "Cod. 5732", gross: 3490, fee: 349, net: 3141, status: "Previsto" },
  { month: "Julho/2026", property: "Cod. 5732", gross: 3490, fee: 349, net: 3141, status: "Pago" },
  { month: "Junho/2026", property: "Cod. 5732", gross: 3490, fee: 349, net: 3141, status: "Pago" },
];

export const ownerProposals = [
  { id: "PROP-1082", client: "Fernanda Lopes", property: "Casa térrea com garagem", value: 730000, status: "Em análise", date: "Hoje" },
  { id: "PROP-5732", client: "Carlos Ribeiro", property: "Apartamento com 3 dormitórios", value: 3600, status: "Lista de espera", date: "Ontem" },
];

export const condoBills = [
  { id: "COND-0826", title: "Condomínio de agosto", due: "08/08/2026", value: 642, status: "Aberto" },
  { id: "COND-0726", title: "Condomínio de julho", due: "08/07/2026", value: 642, status: "Pago" },
  { id: "RES-0726", title: "Fundo de reserva", due: "15/07/2026", value: 85, status: "Pago" },
];

export const condoRequests = [
  { id: "#S1201", subject: "Manutenção do elevador social", category: "Manutenção", status: "Em andamento", date: "Hoje" },
  { id: "#S1198", subject: "Reserva do salao de festas", category: "Reserva", status: "Aprovado", date: "Ontem" },
  { id: "#S1187", subject: "Dúvida sobre prestação de contas", category: "Financeiro", status: "Respondido", date: "22/07/2026" },
];

export const condoNotices = [
  { title: "Assembleia ordinária", text: "Reunião marcada para 05/08/2026 às 19h no salão principal.", tag: "Assembleia" },
  { title: "Limpeza da garagem", text: "A garagem B ficará em manutenção no dia 27/07 pela manhã.", tag: "Aviso" },
  { title: "Prestação de contas", text: "Relatório de julho disponível para consulta do condômino.", tag: "Financeiro" },
];

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
