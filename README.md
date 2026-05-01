# ไปไหนดี · Thailand Tourist RAG Web

เว็บแอปแนะนำสถานที่ท่องเที่ยวไทย แบบ "ปัดซ้าย-ปัดขวา" เหมือน Tinder
+ แชทบอท RAG ที่ตอบจาก "รายการโปรด" ของผู้ใช้

> 📐 อ่านโครงสร้าง / API / RAG seam เต็มๆ ได้ที่ [`PLAN.md`](./PLAN.md)
> 🤖 คนทำส่วน RAG เริ่มที่ [`app/_rag/README.md`](./app/_rag/README.md)

---

## Stack

- **Next.js 16** (App Router, Turbopack ดีฟอลต์)
- **React 19.2** + **framer-motion** (การ์ดปัด)
- **MySQL 8** + **mysql2** (ชื่อตาราง/คอลัมน์เป็นภาษาไทยตามสเปค)
- **TypeScript 5**
- mobile-first CSS, max-width 480px, ใช้ใน desktop ก็ได้

---

## ขั้นตอนรันครั้งแรก

### 1) ติดตั้ง dependencies

```bash
npm install
```

(เพิ่ม `mysql2` ลง `package.json` ไว้ให้แล้ว — ครั้งแรกหลัง pull ต้องรัน install)

### 2) ตั้ง MySQL

ติดตั้ง MySQL 8 ในเครื่อง (หรือใช้ Docker, XAMPP, MAMP ก็ได้) แล้วรันสคีมา:

```bash
# จากโฟลเดอร์โปรเจค
mysql -u root -p < db/schema.sql
```

จะได้ schema ชื่อ `pai_nai_di` พร้อมตาราง:

- `ผู้ใช้`
- `เเหล่งท่องเที่ยว`
- `รูปภาพ`
- `รายการโปรด`
- `ประวัติเเชท`

ตอนนี้ตารางว่าง — ถ้าจะเทสต์ FE ให้เพิ่ม row อย่างน้อย 2-3 แถว
หรือรอให้ทีม data import dataset จริง

### 3) ตั้งค่า environment

```bash
cp .env.example .env.local
```

แล้วแก้ `.env.local`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=pai_nai_di

# จะเชื่อม LLM ทีหลังก็ได้ — ระบบจะ fallback เป็น mock อัตโนมัติ
LLM_PROVIDER=mock
```

### 4) รันเว็บ (เป็นทั้ง backend + frontend ในตัวเดียว)

```bash
npm run dev
```

เปิด <http://localhost:3000> — จะ redirect ไป `/discover`
ถ้าจะลองในมือถือ ให้ใช้ DevTools mobile mode หรือเข้าจาก IP เครื่อง:

```bash
# เครื่อง dev อยู่ที่ 192.168.1.10 → จากมือถือเข้า
http://192.168.1.10:3000
```

> **Tip**: Next 16 ใช้ Turbopack แล้ว — ครั้งแรก compile ช้านิด แต่ hot reload เร็วมาก

### 5) รัน production

```bash
npm run build
npm run start
```

---

## โครงสร้างหน้า

| URL          | คำอธิบาย                                                                  |
| ------------ | ------------------------------------------------------------------------- |
| `/`          | redirect → `/discover`                                                    |
| `/discover`  | ปัดซ้าย-ขวาเลือกสถานที่ (กรอง: ประเภท / จังหวัด)                            |
| `/favorites` | รายการที่ปัดขวา + ค้นหา + กรอง + บันทึกโน้ต + ปุ่มเปิด Google Maps         |
| `/chat`      | RAG แชทบอท ตอบจาก "รายการโปรด" ของ user เท่านั้น                           |

---

## สำหรับนักพัฒนาแต่ละบทบาท

### 🎨 Frontend
แก้ที่ `app/(mobile)/**` และ `app/_components/**`
state กลาง = `useFavorites()` hook ใน `_components/FavoritesProvider.tsx`

### 🛠 Backend / API
- API endpoints อยู่ใน `app/api/**`
- DB helpers อยู่ใน `app/_lib/**`
- เพิ่มคอลัมน์ใหม่ → แก้ `db/schema.sql` + `_lib/places.ts` + `_lib/types.ts`

### 🤖 RAG / AI
- จุดเดียวที่ต้องแก้: `app/_rag/index.ts` (ฟังก์ชัน `callLLM()`)
- ดูคู่มือเต็มที่ [`app/_rag/README.md`](./app/_rag/README.md)
- ระบบจะ fallback ไปโหมด mock ถ้ายังไม่ได้ใส่ API key

---

## Troubleshooting

**`Error: Access denied for user 'root'@'localhost'`**
ตั้ง `DB_USER` / `DB_PASSWORD` ใน `.env.local` ให้ตรง ทดสอบใน mysql client ก่อน

**`Unknown database 'pai_nai_di'`**
ยังไม่ได้รัน `db/schema.sql` — ทำตามขั้นตอนที่ 2

**Cookie ไม่บันทึก / favorite หาย**
ถ้าใช้งานข้าม device จะนับเป็นคนละ user (เพราะไม่มี login)
ตั้ง `DEV_USER_ID=some-uuid` ใน `.env.local` ระหว่าง dev จะใช้ id เดียวตลอด


