"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/utils";
import { getImageUrl, normalizeCategory, formatViews } from "@/lib/utils";
import { formatDateJST } from "@/lib/date";

export type NewsDay = {
  dateStr: string; // "2026-06-27"
  label: string;   // "6/27（今日）"
  articles: Article[];
};

interface Props {
  days: NewsDay[];
  viewCounts?: Record<string, number>;
}

export default function NewsCarousel({ days, viewCounts = {} }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const multiPage = days.length > 1;

  // currentIndex から導出（別 state にすると scroll 非同期で食い違う）
  const atStart = currentIndex === 0;
  const atEnd   = currentIndex === days.length - 1;

  // getBoundingClientRect でビューポート基準の位置を使う
  // （offsetLeft は offsetParent 基準でコンテナ外のオフセットが混入するため不正確）
  const scrollToPage = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const col = track.children[index] as HTMLElement | undefined;
    if (!col) return;
    const scrollTarget =
      track.scrollLeft + col.getBoundingClientRect().left - track.getBoundingClientRect().left;
    track.scrollTo({ left: scrollTarget, behavior: "smooth" });
  }, []);

  // scroll → rAF throttle でドット同期 ＋ 現在列インデックス更新
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let rafId = 0;
    const handler = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const trackLeft = track.getBoundingClientRect().left;
        let closest = 0;
        let minDist = Infinity;
        for (let i = 0; i < track.children.length; i++) {
          const col = track.children[i] as HTMLElement;
          // 各列の「トラック左端からの視覚距離」= 0 に最も近い列が現在ページ
          const dist = Math.abs(col.getBoundingClientRect().left - trackLeft);
          if (dist < minDist) { minDist = dist; closest = i; }
        }
        setCurrentIndex(closest);
      });
    };
    track.addEventListener("scroll", handler, { passive: true });
    return () => {
      track.removeEventListener("scroll", handler);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Shift+ホイールで横移動（PC）
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const handler = (e: WheelEvent) => {
      if (!e.shiftKey) return;
      e.preventDefault();
      track.scrollBy({ left: e.deltaY });
    };
    track.addEventListener("wheel", handler, { passive: false });
    return () => track.removeEventListener("wheel", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight")
      scrollToPage(Math.min(currentIndex + 1, days.length - 1));
    else if (e.key === "ArrowLeft")
      scrollToPage(Math.max(currentIndex - 1, 0));
  };

  if (days.length === 0) return null;

  return (
    <div>
      {/* セクション見出し ＋ PC用矢印 */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="text-xs font-bold tracking-widest text-white bg-black px-3 py-1 rounded-full"
        >
          NEWS
        </span>
        <h2 className="text-xl font-bold flex-1">最新ニュース</h2>

        {/* 矢印（md 以上のみ表示。端では opacity:0 で隠してレイアウト確保） */}
        {multiPage && (
          <div className="hidden md:flex" style={{ gap: "6px" }}>
            <button
              onClick={() => scrollToPage(currentIndex - 1)}
              aria-label="前の日へ"
              aria-hidden={atStart || undefined}
              tabIndex={atStart ? -1 : 0}
              style={{ ...BASE_ARROW_STYLE, opacity: atStart ? 0 : 1, pointerEvents: atStart ? "none" : "auto" }}
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => scrollToPage(currentIndex + 1)}
              aria-label="次の日へ"
              aria-hidden={atEnd || undefined}
              tabIndex={atEnd ? -1 : 0}
              style={{ ...BASE_ARROW_STYLE, opacity: atEnd ? 0 : 1, pointerEvents: atEnd ? "none" : "auto" }}
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* カルーセルトラック */}
      <div
        role="region"
        aria-label="最新ニュース"
        ref={trackRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="no-scrollbar news-carousel-track"
        style={{ outline: "none" }}
      >
        {days.map((day, pageIdx) => (
          <div
            key={day.dateStr}
            aria-label={day.label}
            className="day-column"
          >
            {day.articles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                viewCount={viewCounts[article.id] ?? 0}
                eager={pageIdx === 0}
              />
            ))}
          </div>
        ))}
      </div>

      {/* ドットナビ */}
      {multiPage && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            marginTop: "16px",
          }}
        >
          {days.map((day, i) => (
            <button
              key={day.dateStr}
              onClick={() => scrollToPage(i)}
              aria-label={day.label}
              aria-current={i === currentIndex ? "true" : undefined}
              style={{
                width: i === currentIndex ? "18px" : "6px",
                height: "6px",
                borderRadius: "999px",
                background: i === currentIndex ? "#111" : "rgba(0,0,0,0.18)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "width 0.25s ease, background 0.25s ease",
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 矢印ボタン ベーススタイル（visibility は opacity で制御）
// ============================================================
const BASE_ARROW_STYLE: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  border: "1px solid rgba(0,0,0,0.12)",
  background: "#fff",
  color: "#111",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "opacity 0.2s ease",
};

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2L4 7l5 5" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 2l5 5-5 5" />
    </svg>
  );
}

// ============================================================
// NewsCard（page.tsx の ArticleCard と同一デザイン ＋ NEWS バッジ）
// ============================================================
function NewsCard({
  article,
  viewCount,
  eager,
}: {
  article: Article;
  viewCount: number;
  eager: boolean;
}) {
  const imgUrl = getImageUrl(article);
  const category = normalizeCategory(article.category);
  const date = article.publishedAt ? formatDateJST(article.publishedAt) : "";

  return (
    <Link
      href={`/articles/${article.id}`}
      className="hover:opacity-75 transition-opacity duration-150"
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "12px",
        padding: "12px 0",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* サムネ */}
      <div
        style={{
          width: "100px",
          height: "75px",
          borderRadius: "10px",
          background: "#f0f0f0",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={article.title ?? ""}
            fill
            sizes="100px"
            style={{ objectFit: "cover" }}
            loading={eager ? undefined : "lazy"}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#e5e5ea" }} />
        )}
      </div>

      {/* テキスト */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#111111",
              background: "#fff",
              border: "1px solid #111111",
              borderRadius: "4px",
              padding: "0px 4px",
              letterSpacing: "0.05em",
            }}
          >
            NEWS
          </span>
          {category && (
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#86868b",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: 0,
              }}
            >
              {category}
            </p>
          )}
        </div>
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: "6px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            color: "#1d1d1f",
          }}
        >
          {article.title}
        </h3>
        <div
          style={{
            display: "flex",
            gap: "8px",
            fontSize: "0.78rem",
            color: "#86868b",
            alignItems: "center",
          }}
        >
          {date && <span>{date}</span>}
          {viewCount > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {formatViews(viewCount)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
