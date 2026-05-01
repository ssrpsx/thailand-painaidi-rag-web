// =====================================================================
// RAG seam.
//
//   ▸ Frontend  → POST /api/chat
//   ▸ Route     → app/api/chat/route.ts
//   ▸ Route handler calls `answer()` below.
//   ▸ This file is what the RAG developer should edit.
//
// The default implementation is a deterministic stub so the UI can be
// developed end-to-end before the LLM is wired up. Replace the body of
// `callLLM()` with your provider of choice (Anthropic / OpenAI /
// Typhoon / Ollama / etc.) and you're done — nothing else in the app
// needs to change.
// =====================================================================

import OpenAI from "openai";
import { getPlacesByIds } from "../_lib/places";
import type { ChatMessage, Place } from "../_lib/types";
import { SYSTEM_PROMPT, buildContext } from "./prompts";

export interface AnswerInput {
  /** Full chat transcript (oldest → newest), excluding the system message. */
  messages: ChatMessage[];
  /** Place ids the user has favorited. RAG context is built from these. */
  favoriteIds: number[];
}

export interface AnswerOutput {
  reply: string;
  sources: { placeId: number; title: string }[];
}

export async function answer(input: AnswerInput): Promise<AnswerOutput> {
  const places = await getPlacesByIds(input.favoriteIds);
  const context = buildContext(places);
  const reply = await callLLM({
    system: SYSTEM_PROMPT,
    context,
    messages: input.messages,
  });
  return {
    reply,
    sources: places.map((p) => ({ placeId: p.id, title: p.nameTh })),
  };
}

// ---------------------------------------------------------------------
// LLM provider — REPLACE this stub with a real call.
// Recommended: read process.env.LLM_PROVIDER and branch on it.
// ---------------------------------------------------------------------
interface LLMArgs {
  system: string;
  context: string;
  messages: ChatMessage[];
}

async function callLLM({ system, context, messages }: LLMArgs): Promise<string> {
  const provider = (process.env.LLM_PROVIDER ?? "typhoon").toLowerCase();

  if (provider === "typhoon" || provider === "openai") {
    const openai = new OpenAI({
      apiKey: process.env.TYPHOON_API_KEY || process.env.OPENAI_API_KEY || "dummy_key",
      baseURL: 'https://api.opentyphoon.ai/v1',
    });

    const typhoonSystemPrompt = 'You are an AI assistant named Typhoon created by SCB 10X to be helpful, harmless, and honest. Typhoon is happy to help with analysis, question answering, math, coding, creative writing, teaching, role-play, general discussion, and all sorts of other tasks. Typhoon responds directly to all human messages without unnecessary affirmations or filler phrases like "Certainly!", "Of course!", "Absolutely!", "Great!", "Sure!", etc. Specifically, Typhoon avoids starting responses with the word "Certainly" in any way. Typhoon follows this information in all languages, and always responds to the user in the language they use or request. Typhoon is now being connected with a human. Write in fluid, conversational prose, Show genuine interest in understanding requests, Express appropriate emotions and empathy.';

    const combinedSystemPrompt = `${typhoonSystemPrompt}\n\n---\n\n${system}`;

    // Get only the previous 5 chat history records + the current user prompt
    // So we slice the last 6 messages.
    const recentMessages = messages.slice(-6);

    if (recentMessages.length === 0) return "ขออภัย ไม่มีข้อความให้ตอบค่ะ";

    const openAiMessages: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [
      { role: 'system', content: combinedSystemPrompt },
      ...recentMessages.slice(0, -1).map(m => ({
        role: (m.role === 'user' || m.role === 'assistant') ? m.role : 'user',
        content: m.content
      })),
    ];

    const lastUserMessage = recentMessages[recentMessages.length - 1];

    openAiMessages.push({
      role: 'user',
      content: `บริบทรายการโปรดของผู้ใช้:\n${context}\n\nคำถามล่าสุด: ${lastUserMessage.content}`
    });

    try {
      const response = await openai.chat.completions.create({
        model: 'typhoon-v2.5-30b-a3b-instruct',
        messages: openAiMessages,
        temperature: 0.1,
        max_completion_tokens: 10000,
        top_p: 0.6,
        frequency_penalty: 0,
        stream: false, // API route does not stream currently, await the full response
      });

      return response.choices[0]?.message?.content || "";
    } catch (e: any) {
      console.error("[RAG Error]", e);
      return "ขออภัยด้วยค่ะ ไม่สามารถเชื่อมต่อกับ AI ได้ในขณะนี้ (" + (e.message || "Unknown error") + ")";
    }
  }

  // ------- MOCK fallback so the UI works without API keys ---------------
  if (provider !== "mock") {
    console.warn(`[RAG] Unknown LLjM_PROVIDER="${provider}", falling back to mock.`);
  }
  const last = messages[messages.length - 1]?.content || "";
  const hasContext = !context.startsWith("ผู้ใช้ยังไม่มี");
  if (!hasContext) {
    return "ตอนนี้คุณยังไม่มีสถานที่ในรายการโปรดเลยค่ะ ลองไปปัดขวาเลือกที่ที่ชอบในหน้า Discover ก่อนแล้วค่อยกลับมาคุยกันใหม่นะคะ 🙏";
  }
  return (
    `(ตอนนี้กำลังตอบแบบ mock — RAG developer ยังไม่ได้เชื่อม LLM)\n\n` +
    `คำถามของคุณ: "${last}"\n\n` +
    `บริบทที่ระบบจะส่งให้ LLM:\n${context}`
  );
}
