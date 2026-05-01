import type { RowDataPacket } from "mysql2";
import { execute, query } from "./db";
import { parseCoords } from "./maps";
import type { Favorite } from "./types";

interface FavoriteRow extends RowDataPacket {
  favorite_id: number;
  place_id: number;
  name_th: string;
  name_en: string | null;
  province: string | null;
  type: string | null;
  coords: string | null;
  cover: string | null;
  note: string | null;
  created_at: string;
}

export async function listFavorites(userId: string): Promise<Favorite[]> {
  const rows = await query<FavoriteRow[]>(
    `SELECT
       f.favorite_id,
       p.id          AS place_id,
       p.name_th,
       p.name_en,
       p.province,
       p.type,
       p.coords,
       (SELECT i.image_url FROM images i
          WHERE i.place_id = p.id
          ORDER BY i.sort_order ASC, i.image_id ASC LIMIT 1) AS cover,
       f.note,
       f.created_at
     FROM favorites f
     JOIN places p ON p.id = f.place_id
     WHERE f.user_id = :uid
     ORDER BY f.created_at DESC`,
    { uid: userId },
  );
  return rows.map((r) => ({
    favoriteId: r.favorite_id,
    place: {
      id: r.place_id,
      nameTh: r.name_th,
      nameEn: r.name_en,
      province: r.province,
      type: r.type,
      cover: r.cover,
      coords: parseCoords(r.coords),
    },
    note: r.note,
    createdAt: r.created_at,
  }));
}

export async function listFavoritePlaceIds(userId: string): Promise<number[]> {
  const rows = await query<(RowDataPacket & { place_id: number })[]>(
    "SELECT place_id FROM favorites WHERE user_id = :uid",
    { uid: userId },
  );
  return rows.map((r) => r.place_id);
}

export async function addFavorite(userId: string, placeId: number, note?: string | null): Promise<void> {
  const existing = await query<RowDataPacket[]>(
    "SELECT 1 FROM favorites WHERE user_id = :uid AND place_id = :pid",
    { uid: userId, pid: placeId }
  );
  
  if (existing.length === 0) {
    const countRow = await query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM favorites WHERE user_id = :uid",
      { uid: userId }
    );
    if (countRow[0].count >= 5) {
      throw new Error("LIMIT_EXCEEDED");
    }
  }

  await execute(
    "INSERT INTO favorites (user_id, place_id, note) VALUES (:uid, :pid, :note) " +
    "ON DUPLICATE KEY UPDATE note = COALESCE(VALUES(note), note)",
    { uid: userId, pid: placeId, note: note ?? null },
  );
}

export async function removeFavorite(userId: string, placeId: number): Promise<void> {
  await execute(
    "DELETE FROM favorites WHERE user_id = :uid AND place_id = :pid",
    { uid: userId, pid: placeId },
  );
}

export async function removeAllFavorites(userId: string): Promise<void> {
  await execute(
    "DELETE FROM favorites WHERE user_id = :uid",
    { uid: userId },
  );
}

export async function updateNote(userId: string, placeId: number, note: string | null): Promise<void> {
  await execute(
    "UPDATE favorites SET note = :note WHERE user_id = :uid AND place_id = :pid",
    { uid: userId, pid: placeId, note },
  );
}
