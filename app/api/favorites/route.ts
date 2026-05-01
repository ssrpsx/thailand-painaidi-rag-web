// /api/favorites
//   GET    → list current user's favorites (full card data + note)
//   POST   → { placeId, note? }   add (or upsert note)
//   PATCH  → { placeId, note }    update note only
//   DELETE → ?placeId=42          remove a favorite

import { NextRequest } from "next/server";
import { addFavorite, listFavorites, removeFavorite, removeAllFavorites, updateNote } from "../../_lib/favorites";
import { getOrCreateUserId } from "../../_lib/userId";

function parsePlaceId(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const DB_ERROR = Response.json({ error: "database unavailable" }, { status: 503 });

export async function GET() {
  try {
    const userId = await getOrCreateUserId();
    const favorites = await listFavorites(userId);
    return Response.json({ favorites }, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch {
    return Response.json({ favorites: [] }, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getOrCreateUserId();
    const body = await request.json().catch(() => ({}));
    const placeId = parsePlaceId(body.placeId);
    if (placeId === null) return Response.json({ error: "placeId required" }, { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } });
    await addFavorite(userId, placeId, typeof body.note === "string" ? body.note : null);
    return Response.json({ ok: true }, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (err) {
    console.error("POST /api/favorites error:", err);
    return Response.json({ error: "database unavailable" }, { status: 503, headers: { "Content-Type": "application/json; charset=utf-8" } });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getOrCreateUserId();
    const body = await request.json().catch(() => ({}));
    const placeId = parsePlaceId(body.placeId);
    if (placeId === null) return Response.json({ error: "placeId required" }, { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } });
    await updateNote(userId, placeId, typeof body.note === "string" ? body.note : null);
    return Response.json({ ok: true }, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch {
    return Response.json({ error: "database unavailable" }, { status: 503, headers: { "Content-Type": "application/json; charset=utf-8" } });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getOrCreateUserId();
    const placeIdParam = request.nextUrl.searchParams.get("placeId");
    
    if (placeIdParam === "all") {
      await removeAllFavorites(userId);
      return Response.json({ ok: true }, {
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    const placeId = parsePlaceId(placeIdParam);
    if (placeId === null) return Response.json({ error: "placeId required" }, { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } });
    await removeFavorite(userId, placeId);
    return Response.json({ ok: true }, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch {
    return Response.json({ error: "database unavailable" }, { status: 503, headers: { "Content-Type": "application/json; charset=utf-8" } });
  }
}
