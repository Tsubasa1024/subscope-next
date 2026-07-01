"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

// グループ1: 主要ページへの入口
const GROUP_NAV = [
  { key: "top",     label: "TOP",       href: "/",        color: null },
  { key: "ranking", label: "ランキング", href: "/ranking", color: null },
] as const;

// グループ2: 記事一覧の絞り込み
const GROUP_ARTICLES = [
  { key: "all",     label: "すべて",   href: "/articles",                  color: null },
  { key: "news",    label: "ニュース",  href: "/articles?type=news",        color: null },
  { key: "article", label: "記事",      href: "/articles?type=article",     color: null },
  { key: "ChatGPT", label: "ChatGPT",  href: "/articles?category=ChatGPT", color: "#10a37f" },
  { key: "Claude",  label: "Claude",   href: "/articles?category=Claude",  color: "#da7756" },
  { key: "Gemini",  label: "Gemini",   href: "/articles?category=Gemini",  color: "#4285f4" },
  { key: "xAI",     label: "xAI",      href: "/articles?category=xAI",     color: "#111111" },
  { key: "その他",  label: "その他",   href: "/articles?category=その他",  color: "#9ca3af" },
] as const;

const ALL_TABS = [...GROUP_NAV, ...GROUP_ARTICLES];

function getActiveKey(pathname: string, searchParams: URLSearchParams): string | null {
  if (pathname === "/")        return "top";
  if (pathname === "/ranking") return "ranking";
  if (pathname !== "/articles") return null;

  const category = searchParams.get("category");
  const type     = searchParams.get("type");

  if (category)          return category;
  if (type === "news")   return "news";
  if (type === "article") return "article";
  return "all";
}

export default function NavTabBar() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const activeKey    = getActiveKey(pathname, searchParams);

  const tabRefs     = useRef<(HTMLAnchorElement | null)[]>([]);
  const underlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeIdx = ALL_TABS.findIndex((t) => t.key === activeKey);
    if (activeIdx === -1 || !underlineRef.current) {
      if (underlineRef.current) underlineRef.current.style.opacity = "0";
      return;
    }
    const tab = tabRefs.current[activeIdx];
    if (!tab) return;

    underlineRef.current.style.opacity    = "1";
    underlineRef.current.style.transform  = `translateX(${tab.offsetLeft}px)`;
    underlineRef.current.style.width      = `${tab.offsetWidth}px`;

    tab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeKey]);

  const activeTab    = ALL_TABS.find((t) => t.key === activeKey);
  const underlineColor = activeTab?.color ?? "#111111";

  const tabLink = (
    tab: (typeof ALL_TABS)[number],
    idx: number
  ) => {
    const isActive = tab.key === activeKey;
    return (
      <Link
        key={tab.key}
        href={tab.href}
        ref={(el) => { tabRefs.current[idx] = el; }}
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
        }}
      >
        {tab.label}
      </Link>
    );
  };

  return (
    <div
      className="relative hide-scrollbar"
      style={{
        display: "flex",
        alignItems: "center",
        overflowX: "auto",
        scrollbarWidth: "none",
        height: "var(--header-tab-h)",
        paddingLeft: "12px",
        paddingRight: "12px",
      }}
    >
      {/* グループ1: TOP / ランキング */}
      {GROUP_NAV.map((tab, i) => tabLink(tab, i))}

      {/* グループ区切り */}
      <div
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: "1px",
          height: "14px",
          background: "rgba(0,0,0,0.14)",
          margin: "0 6px",
        }}
      />

      {/* グループ2: すべて〜その他 */}
      {GROUP_ARTICLES.map((tab, i) => tabLink(tab, GROUP_NAV.length + i))}

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
          transition:
            "transform 200ms ease-out, width 200ms ease-out, background 200ms ease-out, opacity 150ms ease-out",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
