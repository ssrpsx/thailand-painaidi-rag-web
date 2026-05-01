# RAG integration guide (สำหรับคนที่ทำส่วน AI)

โฟลเดอร์นี้คือ "seam" สำหรับเชื่อม LLM/RAG เข้ากับเว็บ — ทั้งหมดที่คุณต้องแก้
มีแค่ไฟล์เดียว: [`index.ts`](./index.ts) (ฟังก์ชัน `callLLM`)

## Data flow

```
User types in /chat
        │
        ▼
POST /api/chat
  body: { messages: [...] }                ← ดูสคีมาที่ ../api/chat/route.ts
        │
        ▼
app/api/chat/route.ts
  - resolves user (cookie)
  - reads favorite place ids from MySQL
  - calls answer() in this folder
        │
        ▼
app/_rag/index.ts → answer()
  1. getPlacesByIds(favoriteIds)            ← จาก MySQL ตาราง `เเหล่งท่องเที่ยว`
  2. buildContext(places)                   ← prompts.ts (ภาษาไทย)
  3. callLLM({system, context, messages})   ← *** จุดที่คุณต้องแก้ ***
  4. return { reply, sources }
        │
        ▼
Frontend แสดงข้อความและ source pills
```

## สิ่งที่ต้องทำ

1. ติดตั้ง SDK ของ provider ที่ใช้ เช่น
   ```bash
   npm i @anthropic-ai/sdk         # หรือ openai, ollama, ฯลฯ
   ```
2. เปิดไฟล์ `index.ts` แล้วแก้ฟังก์ชัน `callLLM` —
   มี code ตัวอย่างคอมเมนต์ไว้ให้แล้วทั้ง Anthropic / OpenAI / Ollama
3. ใส่ key ใน `.env`:
   ```
   LLM_PROVIDER=anthropic
   LLM_MODEL=claude-haiku-4-5-20251001
   ANTHROPIC_API_KEY=sk-...
   ```
4. ถ้าต้องการ retrieval แบบ vector search:
   - เพิ่ม script ที่ embed คอลัมน์ `รายละเอียดเเหล่งท่องเที่ยว`
   - เก็บ vector ลงตาราง/ไฟล์ที่คุณถนัด
   - ในฟังก์ชัน `answer()` ให้เลือก top-k จาก embedding แล้วค่อยใส่ใน context
   (ตอนนี้ default คือ "ทั้งหมดที่ user favorite" ไม่ต้อง embedding ก็ใช้ได้
    เพราะจำนวนรายการโปรดของแต่ละคนปกติไม่เยอะ)

## สัญญาที่ห้ามแตก

- `answer()` ต้องคืน `{ reply: string, sources: {placeId, title}[] }`
- ห้าม throw — ถ้า LLM ล่ม ให้ catch แล้วคืน reply ที่อธิบายข้อผิดพลาด
- คอลัมน์ใน MySQL เป็นภาษาไทย — อย่าแก้ชื่อใน `places.ts` เพราะ DB schema
  ใช้ชื่อภาษาไทยตามสเปคจาก stakeholder

## Mock mode

ถ้ายังไม่ได้ใส่ key ระบบจะตอบแบบ mock โดยอัตโนมัติ (ดูใน `callLLM`)
ทำให้ frontend ทำงานได้ end-to-end ระหว่างที่คุณยังเขียน LLM ไม่เสร็จ
