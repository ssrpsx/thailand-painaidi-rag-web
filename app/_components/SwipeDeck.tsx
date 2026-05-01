"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { PlaceCardSummary } from "../_lib/types";
import { useFavorites } from "./FavoritesProvider";
import { IconX, IconUndo, IconHeart, IconSparkles, IconMapPin, IconNavigation } from "./Icons";
import { placeUrl } from "../_lib/maps";

interface Props {
  places: PlaceCardSummary[];
}

export default function SwipeDeck({ places }: Props) {
  const { add } = useFavorites();
  const [deck, setDeck] = useState<PlaceCardSummary[]>(places);
  const [history, setHistory] = useState<{ place: PlaceCardSummary; dir: "left" | "right" }[]>([]);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [dragX, setDragX] = useState(0);
  const [detailPlace, setDetailPlace] = useState<PlaceCardSummary | null>(null);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    setDeck(places);
    setHistory([]);
    setDetailPlace(null);
  }, [places]);

  const top = deck[0];
  const second = deck[1];
  const third = deck[2];

  const swipe = async (dir: "left" | "right") => {
    if (!top || exitDir) return;
    setExitDir(dir);
    if (dir === "right") {
      try { await add(top.id); } catch { /* network drop — let it slide */ }
    }
    setTimeout(() => {
      setHistory((h) => [...h, { place: top, dir }]);
      setDeck((d) => d.slice(1));
      setExitDir(null);
      setDragX(0);
    }, 280);
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setDeck((d) => [last.place, ...d]);
  };

  // Pointer handlers
  const onDown = (e: React.PointerEvent) => {
    if (exitDir) return;
    dragStart.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    setDragX(e.clientX - dragStart.current);
  };
  const onUp = () => {
    if (dragStart.current === null) return;
    if (Math.abs(dragX) > 100) {
      swipe(dragX > 0 ? "right" : "left");
    } else {
      setDragX(0);
    }
    dragStart.current = null;
  };

  const toggleDetails = (place: PlaceCardSummary, e?: React.MouseEvent | React.PointerEvent) => {
    e?.stopPropagation();
    setDetailPlace(detailPlace?.id === place.id ? null : place);
  };

  const openMap = (place: PlaceCardSummary, e?: React.MouseEvent | React.PointerEvent) => {
    e?.stopPropagation();
    const url = place.coords
      ? placeUrl(place.coords, place.nameTh)
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([place.nameTh, place.province].filter(Boolean).join(" ") || "Thailand")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const stopSwipeStart = (e: React.PointerEvent) => {
    // Prevent button taps inside the card from starting drag gestures.
    e.stopPropagation();
  };

  if (deck.length === 0) {
    return (
      <div className="deck">
        <div className="deck-empty">
          <div className="big"><IconSparkles size={44} /></div>
          <div>คุณดูครบทุกที่แล้ว!</div>
          <button className="chip active" onClick={() => setDeck(places)}>เริ่มใหม่</button>
        </div>
      </div>
    );
  }

  return (
    <div className="deck">
      <div className="deck-stage">
        <AnimatePresence>
          {third && (
            <motion.div
              key={`bg2-${third.id}`}
              className="swipe-card"
              initial={{ scale: 0.88, y: 28, opacity: 0.6 }}
              animate={{ scale: 0.88, y: 28, opacity: 0.6 }}
              transition={{ duration: 0.2 }}
            >
              <CardArt place={third} />
            </motion.div>
          )}
          {second && (
            <motion.div
              key={`bg1-${second.id}`}
              className="swipe-card"
              initial={{ scale: 0.94, y: 14, opacity: 0.85 }}
              animate={{ scale: 0.94, y: 14, opacity: 0.85 }}
              transition={{ duration: 0.2 }}
            >
              <CardArt place={second} />
              <div className="card-bottom" onPointerDown={stopSwipeStart}>
                <div className="meta">
                  <div className="meta-head">
                    <h2>{second.nameTh}</h2>
                    <button className="meta-link" onClick={(e) => toggleDetails(second, e)}>รายละเอียดเพิ่มเติม</button>
                  </div>
                  {second.nameEn && <div className="name-en">{second.nameEn}</div>}
                  <div className="row" style={{ marginBottom: 10 }}>
                    {second.province && <span className="pill"><IconMapPin size={14} /> {second.province}</span>}
                    {second.type && <span className="pill">{second.type}</span>}
                  </div>
                  <div className="row">
                    <button className="pill map-pill" onClick={(e) => openMap(second, e)}>
                      <IconNavigation size={14} /> เปิด Google Maps
                    </button>
                  </div>
                </div>
                {detailPlace?.id === second.id && (
                  <div className="card-accordion">
                    <div className="accordion-body">
                      {detailPlace.nameEn && <div className="accordion-line"><strong>English:</strong> {detailPlace.nameEn}</div>}
                      {detailPlace.province && <div className="accordion-line"><strong>จังหวัด:</strong> {detailPlace.province}</div>}
                      {detailPlace.type && <div className="accordion-line"><strong>ประเภท:</strong> {detailPlace.type}</div>}
                      {detailPlace.coords && (
                        <div className="accordion-line">
                          <strong>พิกัด:</strong> {detailPlace.coords.lat.toFixed(5)}, {detailPlace.coords.lng.toFixed(5)}
                        </div>
                      )}
                      <div className="accordion-line"><strong>รหัสสถานที่:</strong> #{detailPlace.id}</div>
                    </div>
                  </div>
                )}
                <div className="card-actions">
                  <button className="action-btn skip" onClick={() => swipe("left")} aria-label="ข้าม"><IconX size={18} /></button>
                  <button className="action-btn undo" onClick={undo} disabled={history.length === 0} aria-label="ย้อนกลับ"><IconUndo size={18} /></button>
                  <button className="action-btn fav" onClick={() => swipe("right")} aria-label="ถูกใจ"><IconHeart size={20} /></button>
                </div>
              </div>
            </motion.div>
          )}
          {top && (
            <motion.div
              key={`top-${top.id}`}
              className="swipe-card"
              initial={{ x: 0, rotate: 0 }}
              animate={
                exitDir
                  ? { x: exitDir === "right" ? 600 : -600, rotate: exitDir === "right" ? 18 : -18, opacity: 0 }
                  : { x: dragX, rotate: dragX * 0.05 }
              }
              transition={
                exitDir
                  ? { duration: 0.28, ease: [0.4, 0.0, 0.2, 1] }
                  : { type: "spring", stiffness: 320, damping: 28 }
              }
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            >
              <CardArt place={top} />
              <div className="stamp like" style={{ opacity: dragX > 60 ? Math.min(1, dragX / 140) : 0 }}>LIKE</div>
              <div className="stamp nope" style={{ opacity: dragX < -60 ? Math.min(1, -dragX / 140) : 0 }}>NOPE</div>
              <div className="card-bottom" onPointerDown={stopSwipeStart}>
                <div className="meta">
                  <div className="meta-head">
                    <h2>{top.nameTh}</h2>
                    <button className="meta-link" onClick={(e) => toggleDetails(top, e)}>รายละเอียดเพิ่มเติม</button>
                  </div>
                  {top.nameEn && <div className="name-en">{top.nameEn}</div>}
                  <div className="row" style={{ marginBottom: 10 }}>
                    {top.province && <span className="pill"><IconMapPin size={14} /> {top.province}</span>}
                    {top.type && <span className="pill">{top.type}</span>}
                  </div>
                  <div className="row">
                    <button className="pill map-pill" onClick={(e) => openMap(top, e)}>
                      <IconNavigation size={14} /> เปิด Google Maps
                    </button>
                  </div>
                </div>
                {detailPlace?.id === top.id && (
                  <div className="card-accordion">
                    <div className="accordion-body">
                      {detailPlace.nameEn && <div className="accordion-line"><strong>English:</strong> {detailPlace.nameEn}</div>}
                      {detailPlace.province && <div className="accordion-line"><strong>จังหวัด:</strong> {detailPlace.province}</div>}
                      {detailPlace.type && <div className="accordion-line"><strong>ประเภท:</strong> {detailPlace.type}</div>}
                      {detailPlace.coords && (
                        <div className="accordion-line">
                          <strong>พิกัด:</strong> {detailPlace.coords.lat.toFixed(5)}, {detailPlace.coords.lng.toFixed(5)}
                        </div>
                      )}
                      <div className="accordion-line"><strong>รหัสสถานที่:</strong> #{detailPlace.id}</div>
                    </div>
                  </div>
                )}
                <div className="card-actions">
                  <button className="action-btn skip" onClick={() => swipe("left")} aria-label="ข้าม"><IconX size={18} /></button>
                  <button className="action-btn undo" onClick={undo} disabled={history.length === 0} aria-label="ย้อนกลับ"><IconUndo size={18} /></button>
                  <button className="action-btn fav" onClick={() => swipe("right")} aria-label="ถูกใจ"><IconHeart size={20} /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

function CardArt({ place }: { place: PlaceCardSummary }) {
  const cover = place.cover || `https://source.unsplash.com/800x1200/?thailand,${encodeURIComponent(place.type || "travel")},${place.id}`;
  return (
    <>
      <div className="photo" style={{ backgroundImage: `url(${cover})` }} />
      <div className="meta">
        <div className="meta-head">
          <h2>{place.nameTh}</h2>
        </div>
        {place.nameEn && <div className="name-en">{place.nameEn}</div>}
        <div className="row" style={{ marginBottom: 10 }}>
          {place.province && <span className="pill"><IconMapPin size={14} /> {place.province}</span>}
          {place.type && <span className="pill">{place.type}</span>}
        </div>
      </div>
    </>
  );
}

