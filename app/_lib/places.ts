// Read-side helpers for `places`.
// Centralises the SQL so route handlers and the RAG layer share one view.

import type { RowDataPacket } from "mysql2";
import { query } from "./db";
import { parseCoords } from "./maps";
import type { Place, PlaceCardSummary, PlaceFilter } from "./types";

interface PlaceRow extends RowDataPacket {
  id: number;
  name_th: string;
  name_en: string | null;
  nearby: string | null;
  address: string | null;
  region: string | null;
  soi: string | null;
  road: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string | null;
  type: string | null;
  subtype: string | null;
  contact_info: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  line: string | null;
  tiktok: string | null;
  youtube: string | null;
  opening_hours: string | null;
  description: string | null;
  activities: string | null;
  best_time: string | null;
  fee_thai_adult: string | null;
  fee_thai_child: string | null;
  fee_foreign_adult: string | null;
  fee_foreign_child: string | null;
  notes: string | null;
  coords: string | null;
}

interface ImageRow extends RowDataPacket {
  place_id: number;
  image_url: string;
  sort_order: number;
}

const SELECT_FULL = `
  SELECT
    id, name_th, name_en, nearby, address, region, soi, road,
    subdistrict, district, province, type, subtype, contact_info,
    phone, email, website, facebook, instagram, line, tiktok, youtube,
    opening_hours, description, activities, best_time,
    fee_thai_adult, fee_thai_child, fee_foreign_adult, fee_foreign_child,
    notes, coords
  FROM places
`;

const SELECT_SUMMARY = `
  SELECT
    p.id, p.name_th, p.name_en, p.province, p.type, p.coords,
    (SELECT i.image_url FROM images i
       WHERE i.place_id = p.id
       ORDER BY i.sort_order ASC, i.image_id ASC
       LIMIT 1) AS cover
  FROM places p
`;

function rowToPlace(row: PlaceRow, images: string[]): Place {
  return {
    id: row.id,
    nameTh: row.name_th,
    nameEn: row.name_en,
    nearby: row.nearby,
    address: row.address,
    region: row.region,
    soi: row.soi,
    road: row.road,
    subdistrict: row.subdistrict,
    district: row.district,
    province: row.province,
    type: row.type,
    subtype: row.subtype,
    contactInfo: row.contact_info,
    phone: row.phone,
    email: row.email,
    website: row.website,
    facebook: row.facebook,
    instagram: row.instagram,
    line: row.line,
    tiktok: row.tiktok,
    youtube: row.youtube,
    openingHours: row.opening_hours,
    description: row.description,
    activities: row.activities,
    bestTime: row.best_time,
    feeThaiAdult: row.fee_thai_adult,
    feeThaiChild: row.fee_thai_child,
    feeForeignAdult: row.fee_foreign_adult,
    feeForeignChild: row.fee_foreign_child,
    notes: row.notes,
    coords: parseCoords(row.coords),
    images,
  };
}

export async function listPlaces(filter: PlaceFilter = {}): Promise<PlaceCardSummary[]> {
  const where: string[] = [];
  const params: Record<string, unknown> = {};
  if (filter.province) {
    where.push("p.province = :province");
    params.province = filter.province;
  }
  if (filter.type) {
    where.push("p.type = :type");
    params.type = filter.type;
  }
  if (filter.q) {
    where.push("(p.name_th LIKE :q OR p.name_en LIKE :q OR p.description LIKE :q)");
    params.q = `%${filter.q}%`;
  }
  const sql =
    SELECT_SUMMARY +
    (where.length ? " WHERE " + where.join(" AND ") : "") +
    " ORDER BY p.id DESC LIMIT 200";
  const rows = await query<(PlaceRow & { cover: string | null })[]>(sql, params);
  return rows.map((r) => ({
    id: r.id,
    nameTh: r.name_th,
    nameEn: r.name_en,
    province: r.province,
    type: r.type,
    cover: r.cover,
    coords: parseCoords(r.coords),
  }));
}

export async function getPlace(id: number): Promise<Place | null> {
  const rows = await query<PlaceRow[]>(SELECT_FULL + " WHERE id = :id LIMIT 1", { id });
  if (rows.length === 0) return null;
  const images = await query<ImageRow[]>(
    "SELECT place_id, image_url, sort_order FROM images WHERE place_id = :id ORDER BY sort_order ASC, image_id ASC",
    { id },
  );
  return rowToPlace(rows[0], images.map((i) => i.image_url));
}

export async function getPlacesByIds(ids: number[]): Promise<Place[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `:id${i}`).join(",");
  const params = Object.fromEntries(ids.map((id, i) => [`id${i}`, id]));
  const rows = await query<PlaceRow[]>(
    SELECT_FULL + ` WHERE id IN (${placeholders})`,
    params,
  );
  const imageRows = await query<ImageRow[]>(
    `SELECT place_id, image_url, sort_order FROM images
     WHERE place_id IN (${placeholders})
     ORDER BY sort_order ASC, image_id ASC`,
    params,
  );
  const imagesByPlace = new Map<number, string[]>();
  for (const img of imageRows) {
    const arr = imagesByPlace.get(img.place_id) || [];
    arr.push(img.image_url);
    imagesByPlace.set(img.place_id, arr);
  }
  return rows.map((r) => rowToPlace(r, imagesByPlace.get(r.id) || []));
}

// column is always a hardcoded string from this file — not user input.
async function listDistinct(column: string): Promise<string[]> {
  const rows = await query<(RowDataPacket & Record<string, string>)[]>(
    `SELECT DISTINCT \`${column}\` FROM places WHERE \`${column}\` IS NOT NULL ORDER BY \`${column}\``,
  );
  return rows.map((r) => r[column]).filter(Boolean);
}

export const listProvinces = () => listDistinct("province");
export const listTypes = () => listDistinct("type");
