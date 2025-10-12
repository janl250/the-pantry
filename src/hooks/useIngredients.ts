import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getAllIngredients } from "@/data/dishes";

export function useIngredients() {
  const { user } = useAuth();
  const [userIngredients, setUserIngredients] = useState<string[]>([]);

  const load = async () => {
    if (!user) {
      setUserIngredients([]);
      return;
    }
    const { data, error } = await supabase
      .from("user_dishes")
      .select("tags")
      .eq("user_id", user.id);

    if (!error && data) {
      const set = new Set<string>();
      data.forEach((row: any) => {
        (row.tags || []).forEach((t: string) => set.add(t));
      });
      setUserIngredients(Array.from(set));
    }
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("ingredients-user-dishes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_dishes",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const ingredients = useMemo(() => {
    const base = new Set<string>(getAllIngredients());
    userIngredients.forEach((i) => base.add(i));
    return Array.from(base).sort();
  }, [userIngredients]);

  return { ingredients, refresh: load };
}
