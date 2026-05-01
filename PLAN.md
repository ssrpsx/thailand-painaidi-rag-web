# PLAN — ไปไหนดี · Thailand Tourist RAG Web

เอกสารนี้เป็น "สัญญา" ระหว่างคนทำ frontend / backend / RAG
ใครจะแก้ตรงไหน ดูที่นี่ก่อน

---

## 1. ภาพรวม

แอปเหมือน Tinder แต่สำหรับสถานที่ท่องเที่ยวในไทย ไม่มีระบบล็อกอิน
ผู้ใช้เปิดเว็บแล้วใช้งานได้เลย — ตัวตนถูกผูกกับ cookie (UUID v4)

มีแค่ 3 หน้า ทุกหน้าใช้ shell / bottom-nav ร่วมกัน:

| URL          | หน้าที่                                                                  |
| ------------ | ------------------------------------------------------------------------ |
| `/discover`  | ปัดซ้าย-ขวาเลือกสถานที่ (กรอง: ประเภท / จังหวัด)                          |
| `/favorites` | รายการที่ปัดขวา (กรอง + ค้นหา + บันทึกโน้ต + ปุ่มเปิด Google Maps)        |
| `/chat`      | RAG แชทบอท ตอบจาก "รายการโปรด" ของ user เท่านั้น                          |

`/` redirect ไป `/discover`

---

## 2. โครงสร้างโฟลเดอร์

```
thailand-tourist-rag-web/
├── app/                                    # Next.js 16 App Router
│   ├── layout.tsx                          # root layout (mobile viewport, fonts)
│   ├── page.tsx                            # redirect → /discover
│   ├── globals.css                         # ทั้งแอป mobile-first ใช้ไฟล์เดียว
│   │
│   ├── (mobile)/                           # route group — shared shell + bottom nav
│   │   ├── layout.tsx                      # ครอบด้วย <FavoritesProvider> + <BottomNav>
│   │   ├── discover/page.tsx               # หน้าปัดการ์ด
│   │   ├── favorites/page.tsx              # หน้ารายการโปรด
│   │   └── chat/page.tsx                   # หน้าแชท RAG
│   │
│   ├── _components/                        # React components (private — ไม่เป็น route)
│   │   ├── BottomNav.tsx
│   │   ├── FavoritesProvider.tsx           # client store + ครอบ /api/favorites
│   │   ├── FilterBar.tsx
│   │   └── SwipeDeck.tsx                   # การ์ดปัด + ปุ่มซ้าย/ขวา/undo
│   │
│   ├── _lib/                               # backend utilities (server-only)
│   │   ├── db.ts                           # mysql2 connection pool
│   │   ├── userId.ts                       # cookie + ตาราง `ผู้ใช้`
│   │   ├── places.ts                       # query ตาราง `เเหล่งท่องเที่ยว`
│   │   ├── favorites.ts                    # CRUD ตาราง `รายการโปรด`
│   │   ├── maps.ts                         # Google Maps URL helper
│   │   └── types.ts                        # TS types (FE/BE สัญญา)
│   │
│   ├── _rag/                               # ★ RAG seam — ที่คนทำ AI มาแก้ ★
│   │   ├── README.md                       # คู่มือสำหรับ RAG developer
│   │   ├── prompts.ts                      # system prompt + buildContext()
│   │   └── index.ts                        # answer() + callLLM()  ← แก้ตรงนี้
│   │
│   └── api/                                # Next route handlers (= backend)
│       ├── places/
│       │   ├── route.ts                    # GET list + ?facets=1
│       │   └── [id]/route.ts               # GET single
│       ├── favorites/route.ts              # GET / POST / PATCH / DELETE
│       └── chat/route.ts                   # POST → เรียก _rag/answer()
│
├── db/
│   └── schema.sql                          # CREATE SCHEMA + TABLES (รันด้วย mysql client)
│
├── public/                                 # static assets / รูปสถานที่
├── .env.example                            # template — copy เป็น .env.local แล้วกรอกเอง
├── PLAN.md                                 # เอกสารนี้
└── README.md                               # วิธีรัน
```

หลักการ:

- โฟลเดอร์ขึ้นต้นด้วย `_` = ไม่กลายเป็น URL (private folder ของ Next 16)
- โฟลเดอร์ในวงเล็บ `(mobile)` = route group, ไม่อยู่ใน URL
- ทุกอย่างที่ขึ้น `_lib`, `_rag`, `api/` คือ **Server-only** —
  ห้าม `import` จาก client component ตรงๆ ยกเว้น `_lib/types.ts`
  และ `_lib/maps.ts` (pure functions ไม่มี DB)

---

## 3. Database — schema `pai_nai_di`

ดู [`db/schema.sql`](./db/schema.sql) — รันคำสั่งเดียวด้วย MySQL client

ตาราง:

| ตาราง               | จุดประสงค์                                                  |
| ------------------- | ----------------------------------------------------------- |
| `ผู้ใช้`            | anonymous user (UUID v4 จาก cookie)                         |
| `เเหล่งท่องเที่ยว`  | ตารางหลัก — ชื่อคอลัมน์ภาษาไทยตามสเปคเป๊ะๆ                   |
| `รูปภาพ`            | 1 สถานที่ → หลายรูป (cover = sort_order ต่ำสุด)              |
| `รายการโปรด`        | (user_id, _id) UNIQUE                                       |
| `ประวัติเเชท`       | เก็บข้อความเป็นรายการ (ใช้ทำ memory ของบอทในอนาคต)            |

### หมายเหตุชื่อคอลัมน์

ชื่อคอลัมน์ในตาราง `เเหล่งท่องเที่ยว` ใช้ภาษาไทยตามที่ระบุในเอกสารต้นฉบับ
(รวมถึงคอลัมน์อย่าง `อัตราค่าเข้าชมชาวไทย(เด็ก)` ที่มีวงเล็บ — MySQL อนุญาต
ถ้าใช้ backtick ครอบ) ใน `_lib/places.ts` ทุก query จะ alias เป็นชื่ออังกฤษ
ก่อนตอบกลับเป็น JSON เพื่อให้ frontend อ่านสะดวก

`พิกัด` เก็บเป็น `"lat,lng"` string — backend แปลงเป็น `{lat, lng}`
ผ่าน `parseCoords()` ใน `_lib/maps.ts`

---

## 4. API spec

ทุก endpoint ตอบ JSON ไม่ต้องส่ง header อะไรนอกจาก `Content-Type` ตอน POST

### `GET /api/places`

Query params (optional):
- `province` — จังหวัด (ตรงเป๊ะ)
- `type` — ประเภทเเหล่งท่องเที่ยว (ตรงเป๊ะ)
- `q` — substring ใน ชื่อ/รายละเอียด
- `facets=1` — return `{ provinces, types }` แทน

Response (ปกติ): `{ places: PlaceCardSummary[] }`

### `GET /api/places/:id`

Response: `{ place: Place }` (รวมรูปภาพ + พิกัดที่ parse แล้ว)

### `GET /api/favorites`

Response: `{ favorites: Favorite[] }` — เฉพาะ user ปัจจุบัน
ถ้า user ยังไม่เคยมี cookie จะออก cookie ใหม่ + insert `ผู้ใช้`

### `POST /api/favorites`

Body: `{ placeId: number, note?: string }`
ใช้ตอนปัดขวาในหน้า Discover (FavoritesProvider เรียกให้)

### `PATCH /api/favorites`

Body: `{ placeId: number, note: string }` — แก้โน้ตอย่างเดียว

### `DELETE /api/favorites?placeId=42`

ลบ favorite

### `POST /api/chat`

Body:
```json
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

Response:
```json
{
  "reply": "ตอบเป็นภาษาไทย…",
  "sources": [{ "placeId": 42, "title": "วัดพระแก้ว" }]
}
```

หมายเหตุ: server จะดึง favorite ids ของ user จาก DB เอง — frontend ไม่ต้องส่ง

---

## 5. RAG — จุดต่อ AI

**สำหรับคนทำ RAG: เปิดดู [`app/_rag/README.md`](./app/_rag/README.md)**

จุดต่อจริงๆ มีไฟล์เดียว: [`app/_rag/index.ts`](./app/_rag/index.ts)
ฟังก์ชัน `callLLM()` — ปัจจุบันคืน mock ตอบเป็นข้อความเตือนว่ายังไม่เชื่อม LLM

ขั้นตอนเชื่อม:

1. `npm i @anthropic-ai/sdk` (หรือ `openai`, `ollama-node`, ฯลฯ)
2. แก้ `callLLM()` — มีตัวอย่าง code คอมเมนต์ไว้ครบทั้ง Anthropic / OpenAI / Ollama
3. ใส่ key ใน `.env.local`:
   ```
   LLM_PROVIDER=anthropic
   LLM_MODEL=claude-haiku-4-5-20251001
   ANTHROPIC_API_KEY=sk-ant-...
   ```
4. **ห้าม** แก้:
   - `app/api/chat/route.ts` (request/response shape) — frontend จะพัง
   - ชื่อคอลัมน์ภาษาไทยใน DB หรือใน `_lib/places.ts`
   - signature ของ `answer({ messages, favoriteIds })`

ถ้าต้อง vector search ก็ทำเพิ่มได้ภายในไฟล์ `_rag/` —
เช่น สร้าง `_rag/embeddings.ts` แล้ว import เข้าไปใน `answer()`

---

## 6. Frontend conventions

- ทุก state ที่เกี่ยวกับ favorites → ผ่าน `useFavorites()` hook เท่านั้น
  อย่าเรียก `/api/favorites` ตรงๆ จาก component อื่น
- การ์ดในหน้า Discover ใช้ `framer-motion` กับ pointer events
  (ทำงานทั้งเม้าส์ + นิ้วบนมือถือ)
- ปุ่ม "นำทาง" → `directionsUrl(coords)` ใน `_lib/maps.ts` —
  เปิด tab ใหม่ ระบบจะ deep-link เข้า Google Maps app บนมือถือเอง
- รูปภาพ: ตอนนี้ใช้ `images[]` จาก DB — ถ้ายังไม่มี fallback Unsplash
- ทั้งหมดออกแบบ mobile-first; max-width 480px กลางจอใน desktop

---

## 7. Workflow แบ่งงาน

| ส่วน    | คนรับผิดชอบ           | ไฟล์หลัก                                                       |
| ------- | --------------------- | -------------------------------------------------------------- |
| FE      | UI / UX               | `app/(mobile)/**`, `app/_components/**`, `globals.css`         |
| BE      | API + DB              | `app/api/**`, `app/_lib/**`, `db/schema.sql`                   |
| RAG/AI  | LLM integration       | `app/_rag/**` เท่านั้น                                          |

ถ้าต้องเพิ่มคอลัมน์ใหม่: BE แก้ `schema.sql` + `_lib/places.ts` + `_lib/types.ts`
แล้วบอก FE ด้วย (commit เดียวให้ครบ)

---

## 8. ที่ยังไม่ได้ทำ (TODO ในอนาคต)

- อัปโหลดรูป (เพิ่ม `app/api/places/[id]/images/route.ts` + form admin)
- หน้ารายละเอียดสถานที่ `app/(mobile)/place/[id]/page.tsx`
- vector search สำหรับ RAG
- export favorites เป็น .ics หรือลิงก์รวมใน Google Maps
