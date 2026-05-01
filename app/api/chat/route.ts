// POST /api/chat   →  RAG-backed reply, grounded on the user's favorites.
//
// Request body:
//   { messages: [{role:"user"|"assistant", content:string}, ...] }
//
// Response:
//   { reply: string, sources: [{placeId, title}, ...] }
//
// All LLM-specific logic lives in app/_rag/index.ts — see that file's README.

import { NextRequest } from "next/server";
import { listFavoritePlaceIds } from "../../_lib/favorites";
import { execute } from "../../_lib/db";
import { getOrCreateUserId } from "../../_lib/userId";
import { answer } from "../../_rag";
import type { ChatMessage } from "../../_lib/types";

export async function POST(request: NextRequest) {
  let userId = "anonymous";
  try { userId = await getOrCreateUserId(); } catch { /* DB not available */ }

  const body = await request.json().catch(() => ({}));
  const incoming: unknown[] = Array.isArray(body.messages) ? body.messages : [];

  const messages: ChatMessage[] = incoming
    .map((m) => {
      const obj = m as { role?: string; content?: string };
      if (obj.role !== "user" && obj.role !== "assistant") return null;
      if (typeof obj.content !== "string" || !obj.content.trim()) return null;
      return { role: obj.role, content: obj.content };
    })
    .filter((x): x is ChatMessage => x !== null);

  if (messages.length === 0) {
    return Response.json({ error: "messages required" }, { status: 400 });
  }

  let favoriteIds: number[] = [];
  try {
    favoriteIds = await listFavoritePlaceIds(userId);
  } catch {
    // DB not available — answer without favorites context
  }

  const result = await answer({ messages, favoriteIds });
  
  // Strip Markdown characters because the UI doesn't support them
  result.reply = result.reply
    .replace(/\*\*/g, '')      // Remove bold
    .replace(/_{2}/g, '')      // Remove underline/bold
    .replace(/#{1,3}\s/g, '')  // Remove headers
    .replace(/---/g, '');      // Remove horizontal rules

  // Persist transcript — fire-and-forget, never block the response.
  const lastUser = messages[messages.length - 1];
  Promise.all([
    execute(
      "INSERT INTO `chat_history` (`user_id`,`role`,`content`,`sources`) VALUES (:uid,'user',:content,NULL)",
      { uid: userId, content: lastUser.content },
    ),
    execute(
      "INSERT INTO `chat_history` (`user_id`,`role`,`content`,`sources`) VALUES (:uid,'assistant',:content,:sources)",
      { uid: userId, content: result.reply, sources: JSON.stringify(result.sources) },
    ),
  ]).catch(() => { /* DB not available — skip history */ });

  return Response.json(result);
}
