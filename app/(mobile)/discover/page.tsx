"use client";

import { useEffect, useState } from "react";
import FilterBar from "../../_components/FilterBar";
import SwipeDeck from "../../_components/SwipeDeck";
import Brand from "../../_components/Brand";
import { IconFilter, IconSparkles, IconSearch } from "../../_components/Icons";
import type { PlaceCardSummary } from "../../_lib/types";

export default function DiscoverPage() {
  const [provinces, setProvinces] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [province, setProvince] = useState("");
  const [type, setType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"types" | "provinces">("types");

  const [places, setPlaces] = useState<PlaceCardSummary[] | null>(null);

  useEffect(() => {
    fetch("/api/places?facets=1")
      .then((r) => r.json())
      .then((d) => { setProvinces(d.provinces || []); setTypes(d.types || []); })
      .catch(() => { /* ignore — empty filters fine */ });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (province) params.set("province", province);
    if (type)     params.set("type", type);
    fetch("/api/places?" + params.toString())
      .then((r) => r.json())
      .then((d) => {
        setPlaces(Array.isArray(d.places) ? d.places : []);
      })
      .catch(() => {
        setPlaces([]);
      });
  }, [province, type]);

  return (
    <main className="page">
      <header className="app-header">
        <h1><Brand /></h1>
        <div className="right">
          <button className="icon-btn primary" aria-label="Filter" onClick={() => setShowFilters((s) => !s)}>
            <IconFilter size={18} />
          </button>
        </div>
      </header>

      {/* Drawer that slides from right with filters */}
      <div className={`filter-drawer ${showFilters ? "open" : ""}`} role="dialog" aria-hidden={!showFilters}>
        <div className="drawer-header">
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`chip ${drawerTab === 'types' ? 'active' : 'outline'}`} onClick={() => setDrawerTab('types')}>ประเภท</button>
            <button className={`chip ${drawerTab === 'provinces' ? 'active' : 'outline'}`} onClick={() => setDrawerTab('provinces')}>จังหวัด</button>
          </div>
          <div>
            <button className="chip outline" onClick={() => { setProvince(""); setType(""); }}>
              ล้าง
            </button>
          </div>
        </div>
        <div style={{ padding: 12 }}>
          {/* show chips per internal tab */}
          {drawerTab === 'types' ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className={`chip ${!type ? 'active' : 'outline'}`} onClick={() => setType("")}>ทั้งหมด</button>
              {types.map((t) => (
                <button key={`t-${t}`} className={`chip ${type === t ? 'active' : 'outline'}`} onClick={() => setType(type === t ? "" : t)}>{t}</button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className={`chip ${!province ? 'active' : 'outline'}`} onClick={() => setProvince("")}>ทั้งหมด</button>
              {provinces.map((p) => (
                <button key={`p-${p}`} className={`chip ${province === p ? 'active' : 'outline'}`} onClick={() => setProvince(province === p ? "" : p)}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={`drawer-backdrop ${showFilters ? "show" : ""}`} onClick={() => setShowFilters(false)} />
      {places === null ? (
        <div className="empty"><div className="big"><IconSparkles size={48} /></div><div>กำลังโหลดสถานที่…</div></div>
      ) : places.length === 0 ? (
        <div className="empty">
          <div className="big"><IconSearch size={48} /></div>
          <div>ไม่พบสถานที่ตามตัวกรองนี้</div>
          <button className="chip active" onClick={() => { setProvince(""); setType(""); }}>ล้างตัวกรอง</button>
        </div>
      ) : (
        <SwipeDeck places={places} />
      )}
    </main>
  );
}
