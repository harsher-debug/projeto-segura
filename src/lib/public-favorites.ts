import type { ImovelResumo } from "@/components/site/ImovelCard";

export type FavoriteContact = {
  email?: string;
  telefone?: string;
};

type FavoriteAccount = FavoriteContact & {
  id: string;
  passwordHash: string;
  createdAt: string;
};

type FavoriteSession = {
  accountId: string;
  authenticatedAt: string;
  source: "favoritos" | "cliente";
};

const FAVORITES_KEY = "segura_favorite_imoveis";
const FAVORITE_ITEMS_KEY = "segura_favorite_imoveis_data";
const CONTACT_COOKIE = "segura_favorite_contact";
const FAVORITE_ACCOUNTS_KEY = "segura_favorite_accounts";
const FAVORITE_SESSION_KEY = "segura_favorite_session";
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

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() || "";
}

function normalizePhone(phone?: string) {
  return phone?.replace(/\D/g, "") || "";
}

function contactId(contact: FavoriteContact) {
  return `${normalizeEmail(contact.email)}|${normalizePhone(contact.telefone)}`;
}

function getFavoriteAccounts(): FavoriteAccount[] {
  if (!canUseBrowser()) return [];
  try {
    const accounts = JSON.parse(window.localStorage.getItem(FAVORITE_ACCOUNTS_KEY) || "[]");
    return Array.isArray(accounts) ? accounts.filter((account) => account?.id && account?.passwordHash) : [];
  } catch {
    return [];
  }
}

function saveFavoriteAccounts(accounts: FavoriteAccount[]) {
  window.localStorage.setItem(FAVORITE_ACCOUNTS_KEY, JSON.stringify(accounts));
}

async function hashPassword(password: string) {
  const encoded = new TextEncoder().encode(password);
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function authenticateFavoriteAccount(contact: FavoriteContact, password: string) {
  if (!canUseBrowser() || !window.crypto?.subtle) return { ok: false as const, reason: "unsupported" as const };

  const accountId = contactId(contact);
  const passwordHash = await hashPassword(password);
  const accounts = getFavoriteAccounts();
  const account = accounts.find((item) => item.id === accountId);

  if (account && account.passwordHash !== passwordHash) return { ok: false as const, reason: "invalid-password" as const };

  if (!account) {
    accounts.push({
      id: accountId,
      email: normalizeEmail(contact.email) || undefined,
      telefone: contact.telefone?.trim() || undefined,
      passwordHash,
      createdAt: new Date().toISOString(),
    });
    saveFavoriteAccounts(accounts);
  }

  saveFavoriteContact(contact);
  const session: FavoriteSession = { accountId, authenticatedAt: new Date().toISOString(), source: "favoritos" };
  window.localStorage.setItem(FAVORITE_SESSION_KEY, JSON.stringify(session));
  return { ok: true as const, created: !account };
}

export function hasFavoriteSessionToday() {
  if (!canUseBrowser()) return false;
  try {
    const session = JSON.parse(window.localStorage.getItem(FAVORITE_SESSION_KEY) || "null") as FavoriteSession | null;
    if (!session?.accountId || !session.authenticatedAt) return false;
    const authenticated = new Date(session.authenticatedAt);
    if (Number.isNaN(authenticated.getTime())) return false;
    return authenticated.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }) ===
      new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  } catch {
    return false;
  }
}

export function saveClientFavoriteSession(contact: FavoriteContact) {
  if (!canUseBrowser()) return;
  saveFavoriteContact(contact);
  const session: FavoriteSession = {
    accountId: contactId(contact),
    authenticatedAt: new Date().toISOString(),
    source: "cliente",
  };
  window.localStorage.setItem(FAVORITE_SESSION_KEY, JSON.stringify(session));
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

export function getFavoriteItems(): ImovelResumo[] {
  if (!canUseBrowser()) return [];
  try {
    const items = JSON.parse(window.localStorage.getItem(FAVORITE_ITEMS_KEY) || "[]");
    if (!Array.isArray(items)) return [];
    return items.filter((item) => item && typeof item.id === "string" && typeof item.titulo === "string");
  } catch {
    return [];
  }
}

function saveFavoriteIds(ids: string[]) {
  if (!canUseBrowser()) return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(ids)]));
  window.dispatchEvent(new CustomEvent("segura:favorites-change"));
}

function saveFavoriteItems(items: ImovelResumo[]) {
  if (!canUseBrowser()) return;
  const unique = new Map<string, ImovelResumo>();
  for (const item of items) unique.set(item.id, item);
  window.localStorage.setItem(FAVORITE_ITEMS_KEY, JSON.stringify([...unique.values()]));
}

export function isFavorite(id: string) {
  return getFavoriteIds().includes(id);
}

export function toggleFavorite(id: string, imovel?: ImovelResumo) {
  const ids = getFavoriteIds();
  const items = getFavoriteItems();
  const exists = ids.includes(id);
  if (exists) {
    saveFavoriteItems(items.filter((item) => item.id !== id));
    saveFavoriteIds(ids.filter((item) => item !== id));
  } else {
    if (imovel) saveFavoriteItems([...items, imovel]);
    saveFavoriteIds([...ids, id]);
  }
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
