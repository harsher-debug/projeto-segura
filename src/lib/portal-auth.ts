export type PortalPermission = "locatario" | "proprietario" | "sindico";

export type LocalPortalUser = {
  id: string;
  login: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  document?: string;
  address?: string;
  permissions: PortalPermission[];
  defaultPath: string;
};

const LOCAL_USERS: Record<string, LocalPortalUser & { password: string }> = {
  admin1: {
    id: "local-admin1",
    login: "admin1",
    password: "123456",
    name: "Admin Locatario",
    fullName: "Marina Costa",
    email: "admin1@segura.local",
    phone: "(51) 99821-4100",
    document: "CPF 123.456.789-10",
    address: "Apartamento 703 - Centro, Canoas",
    permissions: ["locatario"],
    defaultPath: "/portal/locatario",
  },
  admin2: {
    id: "local-admin2",
    login: "admin2",
    password: "123456",
    name: "Admin Proprietario",
    fullName: "Roberto Almeida",
    email: "admin2@segura.local",
    phone: "(51) 99140-2200",
    document: "CPF 234.567.890-11",
    address: "Centro, Canoas",
    permissions: ["proprietario"],
    defaultPath: "/portal/proprietario",
  },
  admin3: {
    id: "local-admin3",
    login: "admin3",
    password: "123456",
    name: "Admin Completo",
    fullName: "Cliente Completo Segura",
    email: "admin3@segura.local",
    phone: "(51) 99200-3300",
    document: "CPF 345.678.901-22",
    address: "Marechal Rondon, Canoas",
    permissions: ["locatario", "proprietario"],
    defaultPath: "/portal/locatario",
  },
  admin4: {
    id: "local-admin4",
    login: "admin4",
    password: "123456",
    name: "Admin Sindico",
    fullName: "Joao Henrique Martins",
    email: "admin4@segura.local",
    phone: "(51) 99344-1900",
    document: "CPF 456.789.012-33",
    address: "Condominio Residencial Centro - Canoas",
    permissions: ["sindico"],
    defaultPath: "/portal/sindico",
  },
};

const SESSION_KEY = "segura_portal_local_user";

export function authenticateLocalPortalUser(login: string, password: string) {
  const user = LOCAL_USERS[login.trim().toLowerCase()];

  if (!user || user.password !== password) return null;

  const { password: _password, ...session } = user;
  return session;
}

export function saveLocalPortalSession(user: LocalPortalUser) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.localStorage.setItem("segura_cliente_nome", user.name);
  window.localStorage.setItem("segura_cliente_tipo", user.permissions.join(","));
}

export function getLocalPortalSession(): LocalPortalUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as LocalPortalUser;
    if (!session.id || !session.login || !Array.isArray(session.permissions)) return null;
    return session;
  } catch {
    return null;
  }
}

export function clearLocalPortalSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem("segura_cliente_nome");
  window.localStorage.removeItem("segura_cliente_tipo");
}

export function canAccessPortalPath(pathname: string, permissions: PortalPermission[]) {
  if (pathname === "/portal" || pathname === "/portal/") return true;
  if (pathname.startsWith("/portal/locatario")) return permissions.includes("locatario");
  if (pathname.startsWith("/portal/proprietario")) return permissions.includes("proprietario");
  if (pathname.startsWith("/portal/sindico")) return permissions.includes("sindico");
  return true;
}

export function firstPortalPath(permissions: PortalPermission[]) {
  if (permissions.includes("locatario")) return "/portal/locatario";
  if (permissions.includes("proprietario")) return "/portal/proprietario";
  if (permissions.includes("sindico")) return "/portal/sindico";
  return "/entrar";
}
