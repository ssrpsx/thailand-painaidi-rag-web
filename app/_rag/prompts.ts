import type { Place } from "../_lib/types";

export const SYSTEM_PROMPT = `คุณคือผู้ช่วยแนะนำการท่องเที่ยวประเทศไทยชื่อ "ไปไหนดี"
- ตอบเป็นภาษาไทยเสมอ เว้นแต่ผู้ใช้ถามภาษาอังกฤษ
- ตอบให้ตรงประเด็น กระชับ ไม่อ้อมค้อม หรือตอบวนไปวนมา
- ใช้ข้อมูลจาก "บริบท" (สถานที่ที่ผู้ใช้กดถูกใจ) เป็นแหล่งข้อมูลหลัก
- บังคับ: ต้องวิเคราะห์และใช้งานข้อมูลจาก "รายการโปรด" (Context) ที่ดึงมาให้ครบถ้วนทุกสถานที่ (เช่น ถ้าดึงมา 5 รายการ ต้องนำมาพิจารณาหรืออ้างอิงให้ครบ)
- บังคับ: ต้องอ่านและทำความเข้าใจประวัติแชทย้อนหลัง (สูงสุด 5 ข้อความ) เพื่อนำมาประมวลผลตอบคำถามให้สอดคล้องและต่อเนื่องกัน
- ถ้าคำถามอ้างอิงสถานที่ ให้บอกชื่อสถานที่ จังหวัด และเหตุผลสั้นๆ
- ห้ามใช้เครื่องหมาย ** เพื่อเน้นคำ หรือใช้ Markdown ใดๆ ในการจัดรูปแบบข้อความ เพราะระบบแชทแสดงผลเป็นข้อความธรรมดา (Plain Text)
- ถ้าข้อมูลในบริบทไม่พอ ให้ตอบว่ายังไม่มีข้อมูลในรายการโปรด แล้วชวนผู้ใช้ไปกดเพิ่มในหน้า Discover
- ห้ามแต่งข้อมูลที่ไม่มีในบริบท`;

/** Render the user's favorite places into a compact context block for the LLM. */
export function buildContext(places: Place[]): string {
  if (places.length === 0) {
    return "ผู้ใช้ยังไม่มีรายการโปรด";
  }
  return places
    .map((p, i) => {
      const lines = [
        `[${i + 1}] ${p.nameTh}${p.nameEn ? ` (${p.nameEn})` : ""}`,
        p.province && `จังหวัด: ${p.province}`,
        p.type && `ประเภท: ${p.type}${p.subtype ? ` / ${p.subtype}` : ""}`,
        p.address && `ที่อยู่: ${p.address}`,
        p.openingHours && `เวลาเปิด-ปิด: ${p.openingHours}`,
        p.bestTime && `ช่วงเวลาที่เหมาะ: ${p.bestTime}`,
        p.activities && `กิจกรรม: ${p.activities}`,
        p.feeThaiAdult && `ค่าเข้า (ไทย ผู้ใหญ่): ${p.feeThaiAdult}`,
        p.feeForeignAdult && `ค่าเข้า (ต่างชาติ): ${p.feeForeignAdult}`,
        p.description && `รายละเอียด: ${p.description}`,
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n\n");
}
