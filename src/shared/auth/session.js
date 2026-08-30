import { normalizeRoleNames } from "../config/roleNames";

const SESSION_KEY = "pharmacy.auth.session.v1";
const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function readTokenRoles(accessToken) {
  try {
    const payloadPart = String(accessToken || "").split(".")[1];
    if (!payloadPart) return [];
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded));
    return [payload.role, payload.roles, payload[ROLE_CLAIM]]
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeSession(session) {
  const receivedRoles = Array.isArray(session?.user?.roles)
    ? session.user.roles
    : session?.user?.roles
      ? [session.user.roles]
      : [];
  const roles = normalizeRoleNames([
    ...receivedRoles,
    ...readTokenRoles(session?.accessToken),
  ]);
  return { ...session, user: { ...session.user, roles } };
}

function isValidSession(session) {
  return Boolean(
    session?.accessToken &&
      session?.expiresAtUtc &&
      session?.user &&
      new Date(session.expiresAtUtc).getTime() > Date.now(),
  );
}

function parseSession(value) {
  try {
    const session = JSON.parse(value);
    return isValidSession(session) ? normalizeSession(session) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function readSession() {
  const session =
    parseSession(sessionStorage.getItem(SESSION_KEY)) ||
    parseSession(localStorage.getItem(SESSION_KEY));
  if (!session) clearSession();
  return session;
}

export function writeSession(session, remember = false) {
  clearSession();
  (remember ? localStorage : sessionStorage).setItem(
    SESSION_KEY,
    JSON.stringify(normalizeSession(session)),
  );
}

export function updateSessionUser(user) {
  const current = readSession();
  if (!current) return null;
  const remember = Boolean(localStorage.getItem(SESSION_KEY));
  const updated = { ...current, user: { ...current.user, ...user } };
  writeSession(updated, remember);
  return updated;
}

export function getAccessToken() {
  return readSession()?.accessToken ?? null;
}
