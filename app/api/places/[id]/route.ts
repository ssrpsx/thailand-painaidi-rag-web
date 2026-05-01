// GET /api/places/:id  → full Place row + images

import type { NextRequest } from "next/server";
import { getPlace } from "../../../_lib/places";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return Response.json({ error: "invalid id" }, { status: 400 });
  }
  const place = await getPlace(numId);
  if (!place) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ place });
}
