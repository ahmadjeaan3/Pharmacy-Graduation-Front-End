import { useEffect, useMemo, useState } from "react";
import { queryClient } from "../../../shared/lib/queryClient";
import {
  clearSession,
  readSession,
  updateSessionUser,
  writeSession,
} from "../../../shared/auth/session";
import { AuthContext } from "./AuthContext";
import { hasRole as userHasRole } from "../../../shared/config/roles";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession());

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
      setSession(null);
      queryClient.clear();
    };
    window.addEventListener("pharmacy:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("pharmacy:unauthorized", handleUnauthorized);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      signIn(authResponse, remember) {
        writeSession(authResponse, remember);
        setSession(authResponse);
      },
      signOut() {
        clearSession();
        setSession(null);
        queryClient.clear();
      },
      updateUser(user) {
        setSession(updateSessionUser(user));
      },
      hasRole(role) {
        return userHasRole(session?.user?.roles, role);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
