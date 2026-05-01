"use client";

// Single source of truth for favorites in the browser.
// Wraps the /api/favorites endpoints and broadcasts state to every page,
// so the badge in the bottom nav updates the moment a user swipes right.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Favorite } from "../_lib/types";

interface Ctx {
  favorites: Favorite[];
  count: number;
  loading: boolean;
  add: (placeId: number) => Promise<void>;
  remove: (placeId: number) => Promise<void>;
  clearAll: () => Promise<void>;
  setNote: (placeId: number, note: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<Ctx | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { favorites: Favorite[] };
        setFavorites(data.favorites);
      }
    } catch {
      // DB not available — show empty favorites rather than hanging forever
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (placeId: number) => {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId }),
      });
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (placeId: number) => {
      setFavorites((cur) => cur.filter((f) => f.place.id !== placeId));
      await fetch(`/api/favorites?placeId=${placeId}`, { method: "DELETE" });
      await refresh();
    },
    [refresh],
  );

  const clearAll = useCallback(
    async () => {
      setFavorites([]);
      await fetch(`/api/favorites?placeId=all`, { method: "DELETE" });
      await refresh();
    },
    [refresh],
  );

  const setNote = useCallback(
    async (placeId: number, note: string) => {
      await fetch("/api/favorites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId, note }),
      });
      await refresh();
    },
    [refresh],
  );

  const value = useMemo<Ctx>(
    () => ({ favorites, count: favorites.length, loading, add, remove, clearAll, setNote, refresh }),
    [favorites, loading, add, remove, clearAll, setNote, refresh],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): Ctx {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside <FavoritesProvider>");
  return ctx;
}
