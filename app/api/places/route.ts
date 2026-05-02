// GET /api/places         → list (filter by ?province, ?type, ?q)
// GET /api/places?facets  → returns province + type lists for filter UI

import { NextRequest } from "next/server";
import { listPlaces, listProvinces, listTypes } from "../../_lib/places";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  try {
    if (sp.has("facets")) {
      const [provinces, types] = await Promise.all([listProvinces(), listTypes()]);
      return Response.json({ provinces, types }, {
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    const places = await listPlaces({
      province: sp.get("province") || undefined,
      type: sp.get("type") || undefined,
      q: sp.get("q") || undefined,
    });
    return Response.json({ places }, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (err) {
    console.error("Database query failed:", err);
    if (sp.has("facets")) return Response.json({ provinces: [], types: [] }, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
    return Response.json({ places: [] }, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
