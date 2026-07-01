"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#111111" : "#9ca3af"} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#111111" : "#9ca3af"} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function TrophyIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#111111" : "#9ca3af"} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h12v6a6 6 0 01-12 0V2z" />
      <path d="M6 5H2v2a4 4 0 004 4" />
      <path d="M18 5h4v2a4 4 0 01-4 4" />
      <path d="M12 14v4" />
      <path d="M8 21h8" />
    </svg>
  );
}

function BookmarkIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#111111" : "#d1d5db"} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  function handleSearchTap() {
    window.dispatchEvent(new CustomEvent("open-header-search"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const isHome = pathname === "/";
  const isRanking = pathname === "/ranking";

  const itemStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    flex: 1,
    padding: "8px 0",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    color: active ? "#111111" : "#9ca3af",
    fontSize: "0.625rem",
    fontWeight: active ? 600 : 400,
    transition: "color 150ms ease-out",
    textDecoration: "none",
  });

  const iconWrap: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    transition: "transform 150ms ease-out",
  };

  return (
    <nav
      className="md:hidden bottom-nav-icon"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 140,
        display: "flex",
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
        height: "calc(var(--bottom-nav-h) + env(safe-area-inset-bottom))",
      }}
    >
      {/* ホーム */}
      <Link href="/" style={itemStyle(isHome)}
        onMouseDown={(e) => { (e.currentTarget.querySelector("div") as HTMLDivElement | null)?.style.setProperty("transform", "scale(0.88)"); }}
        onMouseUp={(e) => { (e.currentTarget.querySelector("div") as HTMLDivElement | null)?.style.setProperty("transform", "scale(1)"); }}
        onTouchStart={(e) => { (e.currentTarget.querySelector("div") as HTMLDivElement | null)?.style.setProperty("transform", "scale(0.88)"); }}
        onTouchEnd={(e) => { (e.currentTarget.querySelector("div") as HTMLDivElement | null)?.style.setProperty("transform", "scale(1)"); }}
      >
        <div style={iconWrap}>
          <HomeIcon active={isHome} />
        </div>
        ホーム
      </Link>

      {/* 検索 */}
      <button
        onClick={handleSearchTap}
        style={itemStyle(false)}
        aria-label="検索を開く"
      >
        <div style={iconWrap}>
          <SearchIcon active={false} />
        </div>
        検索
      </button>

      {/* ランキング */}
      <Link href="/ranking" style={itemStyle(isRanking)}
        onMouseDown={(e) => { (e.currentTarget.querySelector("div") as HTMLDivElement | null)?.style.setProperty("transform", "scale(0.88)"); }}
        onMouseUp={(e) => { (e.currentTarget.querySelector("div") as HTMLDivElement | null)?.style.setProperty("transform", "scale(1)"); }}
        onTouchStart={(e) => { (e.currentTarget.querySelector("div") as HTMLDivElement | null)?.style.setProperty("transform", "scale(0.88)"); }}
        onTouchEnd={(e) => { (e.currentTarget.querySelector("div") as HTMLDivElement | null)?.style.setProperty("transform", "scale(1)"); }}
      >
        <div style={iconWrap}>
          <TrophyIcon active={isRanking} />
        </div>
        ランキング
      </Link>

      {/* 保存（将来のブックマーク機能で有効化） */}
      <button
        disabled
        style={{ ...itemStyle(false), cursor: "not-allowed", opacity: 0.4 }}
        aria-label="保存（準備中）"
        title="準備中"
      >
        <div style={iconWrap}>
          <BookmarkIcon active={false} />
        </div>
        保存
      </button>
    </nav>
  );
}
