"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const TABS = [
  { key: "all",     label: "すべて",    href: "/articles",                   color: null },
  { key: "news",    label: "ニュース",  href: "/articles?type=news",         color: null },
  { key: "article", label: "記事",      href: "/articles?type=article",      color: null },
  { key: "ChatGPT", label: "ChatGPT",   href: "/articles?category=ChatGPT",  color: "#10a37f" },
  { key: "Claude",  label: "Claude",    href: "/articles?category=Claude",   color: "#da7756" },
  { key: "Gemini",  label: "Gemini",    href: "/articles?category=Gemini",   color: "#4285f4" },
  { key: "xAI",     label: "xAI",       href: "/articles?category=xAI",      color: "#111111" },
  { key: "その他",  label: "その他",    href: "/articles?category=その他",   color: "#9ca3af" },
  { key: "ranking", label: "ランキング", href: "/ranking",                    color: null },
] as const;

function getActiveKey(pathname: string, searchParams: URLSearchParams): string | null {
  if (pathname === "/ranking") return "ranking";
  if (pathname !== "/articles") return null;

  const category = searchParams.get("category");
  const type = searchParams.get("type");

  if (category) return category;
  if (type === "news") return "news";
  if (type === "article") return "article";
  return "all";
}

export default function NavTabBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeKey = getActiveKey(pathname, searchParams);

  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const underlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeIdx = TABS.findIndex((t) => t.key === activeKey);
    if (activeIdx === -1 || !underlineRef.current) {
      if (underlineRef.current) underlineRef.current.style.opacity = "0";
      return;
    }
    const tab = tabRefs.current[activeIdx];
    if (!tab) return;

    underlineRef.current.style.opacity = "1";
    underlineRef.current.style.transform = `translateX(${tab.offsetLeft}px)`;
    underlineRef.current.style.width = `${tab.offsetWidth}px`;

    tab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeKey]);

  const activeTab = TABS.find((t) => t.key === activeKey);
  const underlineColor = activeTab?.color ?? "#111111";

  return (
    <div
      className="relative hide-scrollbar"
      style={{
        display: "flex",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
        scrollbarWidth: "none",
        height: "var(--header-tab-h)",
        paddingLeft: "12px",
        paddingRight: "12px",
      }}
    >
      {TABS.map((tab, i) => {
        const isActive = tab.key === activeKey;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            ref={(el) => { tabRefs.current[i] = el; }}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              padding: "0 14px",
              fontSize: "0.8125rem",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? (tab.color ?? "#111111") : "#6b7280",
              whiteSpace: "nowrap",
              transition: "color 150ms ease-out",
              position: "relative",
            }}
          >
            {tab.label}
          </Link>
        );
      })}

      {/* スライド下線 */}
      <div
        ref={underlineRef}
        className="nav-tab-underline"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "2px",
          borderRadius: "1px",
          background: underlineColor,
          transition: "transform 200ms ease-out, width 200ms ease-out, background 200ms ease-out, opacity 150ms ease-out",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
