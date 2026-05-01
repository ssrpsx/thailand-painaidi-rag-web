"use client";

import { useEffect, useMemo, useState } from "react";
import { useFavorites } from "../../_components/FavoritesProvider";
import FilterBar from "../../_components/FilterBar";
import { directionsUrl } from "../../_lib/maps";
import Brand from "../../_components/Brand";
import { IconSearch, IconSparkles, IconMapPin, IconPaperclip, IconNavigation, IconHeart } from "../../_components/Icons";

export default function FavoritesPage() {
  const { favorites, remove, clearAll, setNote, loading } = useFavorites();

  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");
  const [type, setType] = useState("");

  const [editTarget, setEditTarget] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Filter chips are derived from the favorites (no extra API call).
  const provinces = useMemo(
    () => Array.from(new Set(favorites.map((f) => f.place.province).filter(Boolean) as string[])),
    [favorites],
  );
  const types = useMemo(
    () => Array.from(new Set(favorites.map((f) => f.place.type).filter(Boolean) as string[])),
    [favorites],
  );

  const filtered = favorites.filter((f) => {
    if (province && f.place.province !== province) return false;
    if (type && f.place.type !== type) return false;
    if (q) {
      const hay = `${f.place.nameTh} ${f.place.nameEn || ""} ${f.note || ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const openNote = (id: number, current: string | null) => {
    setEditTarget(id);
    setEditText(current || "");
  };
  const saveNote = async () => {
    if (editTarget === null) return;
    await setNote(editTarget, editText);
    setEditTarget(null);
  };

  return (
    <main className="page">
      <header className="app-header">
          <h1><Brand size="sm" /></h1>
          <div className="right flex gap-2 items-center">
            <span className="badge">{favorites.length} รายการ</span>
            <button 
              className="text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded"
              onClick={() => setShowConfirmClear(true)}
            >
              ล้างข้อมูล
            </button>
        </div>
      </header>

      <div className="search-row w-full">
        <div className="max-w-[480px] mx-auto w-full">
          <input
            type="search"
            placeholder="ค้นหาในรายการโปรด…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {(provinces.length > 0 || types.length > 0) && (
        <FilterBar
          provinces={provinces}
          types={types}
          province={province}
          type={type}
          onChange={(n) => {
            if (n.province !== undefined) setProvince(n.province);
            if (n.type !== undefined) setType(n.type);
          }}
        />
      )}

      <div className="max-w-[480px] mx-auto w-full">
        {loading ? (
          <div className="empty"><div className="big"><IconSparkles size={48} /></div><div>กำลังโหลด…</div></div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="big">{favorites.length === 0 ? <IconHeart size={48} /> : <IconSearch size={48} />}</div>
            <div>
              {favorites.length === 0
                ? "ยังไม่มีรายการโปรด — ลองปัดขวาในหน้า Discover"
                : "ไม่พบรายการที่ตรงกับการกรอง"}
            </div>
          </div>
        ) : (
          <ul className="fav-list">
            {filtered.map((f) => {
              const cover = f.place.cover || `https://source.unsplash.com/200x200/?thailand,${encodeURIComponent(f.place.type || "travel")},${f.place.id}`;
              return (
                <li key={f.favoriteId} className="fav-item">
                  <div className="thumb" style={{ backgroundImage: `url(${cover})` }} />
                  <div className="body">
                    <h3>{f.place.nameTh}</h3>
                    <div className="sub"><IconMapPin size={14} /> {f.place.province || "-"} · {f.place.type || "ไม่ระบุ"}</div>
                    {f.note && <div className="note"><IconPaperclip size={14} /> {f.note}</div>}
                    <div className="row space-x-2" style={{ marginTop: 6 }}>
                      {f.place.coords && (
                        <a
                          className="map-btn items-center flex gap-2"
                          href={directionsUrl(f.place.coords)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <IconNavigation size={16} /> นำทาง
                        </a>
                      )}
                      <button className="del-btn" onClick={() => remove(f.place.id)}>ลบ</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {editTarget !== null && (
        <div className="modal-back" onClick={() => setEditTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>บันทึกของคุณ</h3>
            <textarea
              autoFocus
              placeholder="เช่น ไปช่วงเช้า / มากับครอบครัว / ของกินอร่อย…"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full"
            />
            <div className="modal-actions">
              <button className="ghost" onClick={() => setEditTarget(null)}>ยกเลิก</button>
              <button className="chip active" onClick={saveNote}>บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmClear && (
        <div className="modal-back" onClick={() => setShowConfirmClear(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: 'var(--ink)' }}>ยืนยันการล้างข้อมูล</h3>
            <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--ink-soft)' }}>
              คุณต้องการลบรายการโปรดและประวัติการแชททั้งหมดใช่หรือไม่? (ไม่สามารถกู้คืนได้)
            </p>
            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button className="chip outline" onClick={() => setShowConfirmClear(false)}>ยกเลิก</button>
              <button 
                className="chip active" 
                style={{ background: 'var(--rose)', borderColor: 'var(--rose)', color: '#fff' }}
                onClick={() => {
                  clearAll();
                  localStorage.removeItem("chatHistory");
                  setShowConfirmClear(false);
                }}
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
