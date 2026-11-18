import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "./api.js";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the httpOnly cookie on first load.
  useEffect(() => {
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = {
    user,
    loading,
    async login(body) {
      const r = await api.login(body);
      setUser(r.user);
      return r.user;
    },
    async register(body) {
      const r = await api.register(body);
      setUser(r.user);
      return r.user;
    },
    async logout() {
      await api.logout().catch(() => {});
      setUser(null);
    }
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// Route guard: requires login and (optionally) a specific role.
export function Protected({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loading"><span className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
