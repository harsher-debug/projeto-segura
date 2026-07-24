import type { ImovelResumo } from "@/components/site/ImovelCard";

export type FavoriteContact = {
  email?: string;
  telefone?: string;
};

const FAVORITES_KEY = "segura_favorite_imoveis";
const CONTACT_COOKIE = "segura_favorite_contact";
const CONTACT_MAX_AGE = 60 * 60 * 24 * 180;

function canUseBrowser() {
  return typeof window !== "undefined";
}

function encodeCookieValue(value: unknown) {
  return encodeURIComponent(JSON.stringify(value));
}

function decodeCookieValue<T>(value: string): T | null {
  try {
    return JSON.parse(decodeURIComponent(value)) as T;
  } catch {
    return null;
  }
}

export function getFavoriteContact(): FavoriteContact | null {
  if (!canUseBrowser()) return null;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONTACT_COOKIE}=`));
  if (!cookie) return null;
  const contact = decodeCookieValue<FavoriteContact>(cookie.split("=").slice(1).join("="));
  if (!contact?.email && !contact?.telefone) return null;
  return contact;
}

export function saveFavoriteContact(contact: FavoriteContact) {
  if (!canUseBrowser()) return;
  const cleanContact = {
    email: contact.email?.trim() || undefined,
    telefone: contact.telefone?.trim() || undefined,
  };
  document.cookie = `${CONTACT_COOKIE}=${encodeCookieValue(cleanContact)}; max-age=${CONTACT_MAX_AGE}; path=/; SameSite=Lax`;
}

export function getFavoriteIds(): string[] {
  if (!canUseBrowser()) return [];
  try {
    const ids = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function saveFavoriteIds(ids: string[]) {
  if (!canUseBrowser()) return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(ids)]));
  window.dispatchEvent(new CustomEvent("segura:favorites-change"));
}

export function isFavorite(id: string) {
  return getFavoriteIds().includes(id);
}

export function toggleFavorite(id: string) {
  const ids = getFavoriteIds();
  const exists = ids.includes(id);
  saveFavoriteIds(exists ? ids.filter((item) => item !== id) : [...ids, id]);
  return !exists;
}

export async function shareImovel(imovel: Pick<ImovelResumo, "id" | "titulo">) {
  if (!canUseBrowser()) return;
  const url = `${window.location.origin}/imovel/${imovel.id}`;
  const title = imovel.titulo || "Imovel Segura";
  if (navigator.share) {
    await navigator.share({ title, text: title, url });
    return;
  }
  await navigator.clipboard?.writeText(url);
}
