export function formatBRL(value?: number | null): string {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatArea(value?: number | null): string {
  const n = Number(value ?? 0);
  if (!n) return "—";
  return `${n.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} m²`;
}

export const WHATSAPP_NUMBER = "555121024000";

export function whatsappLink(message?: string): string {
  const base = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`;
  return message ? `${base}&text=${encodeURIComponent(message)}` : base;
}

export function titleCase(s?: string | null): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}