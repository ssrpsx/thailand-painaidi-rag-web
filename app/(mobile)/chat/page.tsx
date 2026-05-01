"use client";

import { useEffect, useRef, useState } from "react";
import { useFavorites } from "../../_components/FavoritesProvider";
import Brand from "../../_components/Brand";
import { IconSend, IconMapPin } from "../../_components/Icons";

import type { ChatMessage } from "../../_lib/types";

const QUICK = [
  "เปรียบเทียบสองที่ที่ฉันชอบให้หน่อย",
  "วางแผนทริป 1 วันจากรายการโปรด",
  "ที่ไหนเหมาะไปหน้าฝน?",
  "อันไหนเหมาะพาครอบครัวไป?",
];

export default function ChatPage() {
  const { count } = useFavorites();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const stream = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // Fallback if parsing fails
        setMessages([
          {
            role: "assistant",
            content: "สวัสดีค่ะ ลองถามอะไรเกี่ยวกับ \"รายการโปรด\" ของคุณได้เลย เช่น วางแผนทริป เปรียบเทียบ หรืออยากรู้ค่าเข้าชม",
            timestamp: Date.now(),
          },
        ]);
      }
    } else {
      setMessages([
        {
          role: "assistant",
          content: "สวัสดีค่ะ ลองถามอะไรเกี่ยวกับ \"รายการโปรด\" ของคุณได้เลย เช่น วางแผนทริป เปรียบเทียบ หรืออยากรู้ค่าเข้าชม",
          timestamp: Date.now(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
    stream.current?.scrollTo({ top: stream.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || busy) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: text, timestamp: Date.now() }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m.role !== "system") }),
      });
      const data = await res.json();
      setMessages((cur) => [
        ...cur,
        { role: "assistant", content: data.reply || "ขออภัย ตอบไม่ได้ในตอนนี้", sources: data.sources || [], timestamp: Date.now() },
      ]);
    } catch {
      setMessages((cur) => [
        ...cur,
        { role: "assistant", content: "เครือข่ายมีปัญหา ลองใหม่อีกครั้งนะคะ", timestamp: Date.now() },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page chat">
      <header className="app-header">
        <h1><Brand size="sm" /></h1>
        <div className="right">
          <span className="badge">{count} รายการ</span>
        </div>
      </header>

      <div className="chat-context w-full">
        <span className="badge">RAG</span>
        <span>คำตอบอ้างอิงจากรายการโปรดของคุณเท่านั้น</span>
      </div>

      <div className="chat-stream" ref={stream}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "contents" }}>
            <div className={`bubble ${m.role === "user" ? "user" : "bot"}`}>{m.content}</div>
            {m.timestamp && (
              <div style={{ fontSize: "10px", color: "gray", alignSelf: m.role === "user" ? "flex-end" : "flex-start", marginTop: "-4px", marginBottom: "8px" }}>
                {new Date(m.timestamp).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
            {m.role === "assistant" && m.sources && m.sources.length > 0 && (
              <div className="sources">
                {m.sources.map((s) => (
                  <span key={s.placeId} className="source"><IconMapPin size={14} /> {s.title}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="typing"><span /><span /><span /></div>
        )}
      </div>

      <div className="composer">
        <div className="quick-row">
          {QUICK.map((q) => (
            <button key={q} className="quick" onClick={() => send(q)} disabled={busy}>
              {q}
            </button>
          ))}
        </div>
        <div className="composer-row">
          <textarea
            rows={1}
            placeholder="พิมพ์คำถามเลย..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            className="w-full"
          />
          <button className="send-btn" onClick={() => send()} disabled={busy || !input.trim()}>
            <IconSend size={16} />
          </button>
        </div>
      </div>
    </main>
  );
}

