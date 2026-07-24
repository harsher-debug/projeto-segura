const ADMIN_SESSION_KEY = "segura_site_admin_session";

type LocalAdminSession = {
  id: string;
  login: string;
  name: string;
  email: string;
};

const localAdmin: LocalAdminSession & { password: string } = {
  id: "local-adminsite",
  login: "adminsite",
  password: "123456",
  name: "Administrador do Site",
  email: "adminsite@segura.local",
};

export function authenticateLocalAdmin(login: string, password: string) {
  if (login.trim().toLowerCase() !== localAdmin.login || password !== localAdmin.password) {
    return null;
  }

  const { password: _password, ...session } = localAdmin;
  return session;
}

export function saveLocalAdminSession(session: LocalAdminSession) {
  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function getLocalAdminSession(): LocalAdminSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as LocalAdminSession;
    if (!session.id || !session.login) return null;
    return session;
  } catch {
    return null;
  }
}

export function clearLocalAdminSession() {
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}
