"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFavorites } from "./FavoritesProvider";
import { IconCompass, IconHeart, IconChat } from "./Icons";

const TABS = [
  { href: "/discover", label: "Discover", icon: <IconCompass size={18} /> },
  { href: "/favorites", label: "Favorites", icon: <IconHeart size={18} /> },
  { href: "/chat", label: "Ask AI", icon: <IconChat size={18} /> },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useFavorites();
  return (
    <nav className="tabbar" aria-label="primary">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link key={t.href} href={t.href} className={active ? "active" : ""}>
            <span className="ico" aria-hidden>{t.icon}</span>
            <span>{t.label}</span>
            {t.href === "/favorites" && count > 0 && (
              <span className="count">{count}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
