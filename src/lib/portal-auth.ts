export type PortalPermission = "locatario" | "proprietario" | "sindico";

export type LocalPortalUser = {
  id: string;
  login: string;
  name: string;
  email: string;
  permissions: PortalPermission[];
  defaultPath: string;
};

const LOCAL_USERS: Record<string, LocalPortalUser & { password: string }> = {
  admin1: {
    id: "local-admin1",
    login: "admin1",
    password: "123456",
    name: "Admin Locatario",
    email: "admin1@segura.local",
    permissions: ["locatario"],
    defaultPath: "/portal/locatario",
  },
  admin2: {
    id: "local-admin2",
    login: "admin2",
    password: "123456",
    name: "Admin Proprietario",
    email: "admin2@segura.local",
    permissions: ["proprietario"],
    defaultPath: "/portal/proprietario",
  },
  admin3: {
    id: "local-admin3",
    login: "admin3",
    password: "123456",
    name: "Admin Completo",
    email: "admin3@segura.local",
    permissions: ["locatario", "proprietario"],
    defaultPath: "/portal/locatario",
  },
  admin4: {
    id: "local-admin4",
    login: "admin4",
    password: "123456",
    name: "Admin Sindico",
    email: "admin4@segura.local",
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
