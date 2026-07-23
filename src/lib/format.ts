const mojibakeMap: Record<string, string> = {
  "Ã¡": "á",
  "Ã ": "à",
  "Ã¢": "â",
  "Ã£": "ã",
  "Ã¤": "ä",
  "Ã©": "é",
  "Ãª": "ê",
  "Ã­": "í",
  "Ã³": "ó",
  "Ã´": "ô",
  "Ãµ": "õ",
  "Ãº": "ú",
  "Ã¼": "ü",
  "Ã§": "ç",
  "Ã": "Á",
  "Ã€": "À",
  "Ã‚": "Â",
  "Ãƒ": "Ã",
  "Ã‰": "É",
  "ÃŠ": "Ê",
  "Ã": "Í",
  "Ã“": "Ó",
  "Ã”": "Ô",
  "Ã•": "Õ",
  "Ãš": "Ú",
  "Ã‡": "Ç",
  "Â²": "²",
  "Â©": "©",
  "â€”": "—",
  "â€“": "–",
};

export function normalizeText(value?: string | null): string {
  if (!value) return "";

  let text = String(value);
  for (const [broken, fixed] of Object.entries(mojibakeMap)) {
    text = text.split(broken).join(fixed);
  }

  return text.replace(/\s+/g, " ").trim();
}

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

export function titleCase(value?: string | null): string {
  return normalizeText(value)
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|\s|[-/])(\p{L})/gu, (match, prefix, letter) => `${prefix}${letter.toLocaleUpperCase("pt-BR")}`);
}

export const WHATSAPP_NUMBER = "555121024000";

export function whatsappLink(message?: string): string {
  const base = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`;

  return message ? `${base}&text=${encodeURIComponent(normalizeText(message))}` : base;
}
