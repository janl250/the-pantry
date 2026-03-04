import { useAuth } from "@/hooks/useAuth";

const ADMIN_EMAIL = "jan.j.leonhardt@gmail.com";

export const useAdmin = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const isAdmin = isAuthenticated && user?.email === ADMIN_EMAIL;
  return { isAdmin, loading };
};
