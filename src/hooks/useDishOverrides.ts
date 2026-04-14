import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Dish } from "@/data/dishes";

interface DishOverride {
  dish_id: string;
  cooking_time?: string;
  difficulty?: string;
  cuisine?: string;
  category?: string;
  tags?: string[];
}

export function useDishOverrides() {
  const { user } = useAuth();
  const [overrides, setOverrides] = useState<Map<string, DishOverride>>(new Map());
  const [loading, setLoading] = useState(false);

  const loadOverrides = useCallback(async () => {
    if (!user) {
      setOverrides(new Map());
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("dish_overrides" as any)
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const map = new Map<string, DishOverride>();
      (data as any[])?.forEach((row) => {
        map.set(row.dish_id, {
          dish_id: row.dish_id,
          cooking_time: row.cooking_time,
          difficulty: row.difficulty,
          cuisine: row.cuisine,
          category: row.category,
          tags: row.tags,
        });
      });
      setOverrides(map);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error loading overrides:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadOverrides();
  }, [loadOverrides]);

  const saveOverride = async (dishId: string, overrideData: Partial<Omit<DishOverride, "dish_id">>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("dish_overrides" as any)
        .upsert({
          user_id: user.id,
          dish_id: dishId,
          ...overrideData,
        } as any, { onConflict: "user_id,dish_id" });

      if (error) throw error;
      await loadOverrides();
      return true;
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error saving override:", error);
      return false;
    }
  };

  const deleteOverride = async (dishId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("dish_overrides" as any)
        .delete()
        .eq("user_id", user.id)
        .eq("dish_id", dishId);

      if (error) throw error;
      await loadOverrides();
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error deleting override:", error);
    }
  };

  // Apply overrides to a dish, returning the user's personalized version
  const applyOverride = useCallback((dish: Dish): Dish => {
    const override = overrides.get(dish.id);
    if (!override) return dish;

    return {
      ...dish,
      cookingTime: (override.cooking_time as Dish["cookingTime"]) || dish.cookingTime,
      difficulty: (override.difficulty as Dish["difficulty"]) || dish.difficulty,
      cuisine: override.cuisine || dish.cuisine,
      category: override.category || dish.category,
      tags: override.tags && override.tags.length > 0 ? override.tags : dish.tags,
    };
  }, [overrides]);

  return { overrides, loading, saveOverride, deleteOverride, applyOverride, refresh: loadOverrides };
}
