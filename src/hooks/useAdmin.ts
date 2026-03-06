import { useAuth } from "@/hooks/useAuth";

const ADMIN_USER_ID = "f0c40ab8-de62-4662-8eb1-45c183b8d502";

export const useAdmin = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const isAdmin = isAuthenticated && user?.id === ADMIN_USER_ID;
  return { isAdmin, loading };
};
