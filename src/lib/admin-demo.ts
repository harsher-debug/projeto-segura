export const adminProperties = [
  {
    id: "5732",
    code: "5732",
    title: "Apartamento 3 dormitorios",
    purpose: "Locacao",
    type: "Apartamento",
    neighborhood: "Centro",
    city: "Canoas",
    price: 3490,
    status: "Publicado",
    owner: "Roberto Almeida",
    tenant: "Marina Costa",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
    metrics: "124 m2 - 3 dorm. - 1 vaga",
  },
  {
    id: "1089",
    code: "1089",
    title: "Apartamento a venda com otima localizacao",
    purpose: "Venda",
    type: "Sala",
    neighborhood: "Moinhos de Vento",
    city: "Canoas",
    price: 315000,
    status: "Publicado",
    owner: "Patricia Moreira",
    tenant: "-",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    metrics: "32 m2",
  },
  {
    id: "5708",
    code: "5708",
    title: "Casa resid. 2 dormitorios",
    purpose: "Locacao",
    type: "Casa Resid.",
    neighborhood: "Mathias Velho",
    city: "Canoas",
    price: 2200,
    status: "Em vistoria",
    owner: "Claudio Silveira",
    tenant: "Disponivel",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80",
    metrics: "155 m2 - 2 dorm. - 2 vagas",
  },
  {
    id: "1082",
    code: "1082",
    title: "Casa terrea com garagem",
    purpose: "Venda",
    type: "Loja",
    neighborhood: "Centro",
    city: "Canoas",
    price: 760000,
    status: "Proposta",
    owner: "Helena Duarte",
    tenant: "-",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    metrics: "180 m2 - 2 salas - 15 vagas",
  },
];

export const adminContracts = [
  {
    id: "CTR-2026-018",
    property: "Apartamento 3 dormitorios",
    code: "5732",
    client: "Marina Costa",
    owner: "Roberto Almeida",
    type: "Locacao",
    start: "01/02/2026",
    end: "31/01/2027",
    value: 3490,
    status: "Ativo",
  },
  {
    id: "CTR-2026-011",
    property: "Sala comercial",
    code: "1950",
    client: "Studio Prime",
    owner: "Lucia Andrade",
    type: "Comercial",
    start: "15/01/2026",
    end: "14/01/2028",
    value: 490,
    status: "Ativo",
  },
  {
    id: "CTR-2025-092",
    property: "Box coberto Centro",
    code: "5375",
    client: "Eduardo Mello",
    owner: "Carlos Pires",
    type: "Locacao",
    start: "10/11/2025",
    end: "09/11/2026",
    value: 265,
    status: "Renovacao",
  },
];

export const adminBills = [
  { id: "BOL-5732-08", client: "Marina Costa", property: "Cod. 5732", due: "10/08/2026", value: 3490, status: "Aberto" },
  { id: "BOL-1950-08", client: "Studio Prime", property: "Cod. 1950", due: "12/08/2026", value: 490, status: "Aberto" },
  { id: "BOL-5375-07", client: "Eduardo Mello", property: "Cod. 5375", due: "10/07/2026", value: 265, status: "Pago" },
  { id: "BOL-5732-07", client: "Marina Costa", property: "Cod. 5732", due: "10/07/2026", value: 3490, status: "Pago" },
];

export const adminProposals = [
  { id: "PROP-1082", client: "Fernanda Lopes", property: "Casa terrea com garagem", code: "1082", value: 730000, status: "Em negociacao", channel: "WhatsApp" },
  { id: "PROP-1089", client: "Rafael Souza", property: "Apartamento a venda", code: "1089", value: 305000, status: "Enviada", channel: "Site" },
  { id: "PROP-5708", client: "Camila Martins", property: "Casa resid. 2 dormitorios", code: "5708", value: 2200, status: "Visita agendada", channel: "Portal" },
];

export const adminAccesses = [
  { name: "Marina Costa", profile: "Locatario", contact: "marina@email.com", lastAccess: "Hoje, 09:42", status: "Ativo" },
  { name: "Roberto Almeida", profile: "Proprietario", contact: "roberto@email.com", lastAccess: "Ontem, 18:10", status: "Ativo" },
  { name: "Sindico Jardim Sul", profile: "Sindico", contact: "(51) 99999-2010", lastAccess: "23/07/2026, 14:02", status: "Pendente" },
  { name: "Patricia Moreira", profile: "Proprietario", contact: "patricia@email.com", lastAccess: "21/07/2026, 11:33", status: "Ativo" },
];

export function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
