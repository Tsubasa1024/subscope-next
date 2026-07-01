"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Article } from "@/lib/utils";
import { normalizeCategory, getImageUrl } from "@/lib/utils";
import Image from "next/image";
import NavTabBar from "./NavTabBar";

interface HeaderProps {
  articles?: Article[];
}

export default function Header({ articles = [] }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // サジェスト
  const suggestions =
    query.length >= 1
      ? articles
          .filter((a) => {
            const hay = [a.title, a.description, normalizeCategory(a.category)]
              .join(" ")
              .toLowerCase();
            return hay.includes(query.toLowerCase());
          })
          .slice(0, 5)
      : [];

  // スクロール時シャドウ
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/articles?q=${encodeURIComponent(q)}`);
    setQuery("");
  }

  function handleSuggestionClick(id: string) {
    router.push(`/articles/${id}`);
    setQuery("");
  }

  const SearchIcon = () => (
    <svg
      width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ color: "#86868b" }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  return (
    <header
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 150,
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.08)" : "none",
        transition: "box-shadow 200ms ease-out",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-width)",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        {/* ===== Row 1: ロゴ ===== */}
        <div
          style={{
            height: "var(--header-row1-h)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ flexShrink: 0 }}>
            <Image
              src="/logo.svg"
              alt="SUBSCOPE"
              width={140}
              height={28}
              unoptimized
              priority
              style={{ height: "28px", width: "auto" }}
            />
          </Link>

          {/* 将来のマイページ/会員登録ボタン用スペース（現在は空） */}
          <div style={{ width: "120px", flexShrink: 0 }} aria-hidden="true" />
        </div>

        {/* ===== Row 2: 検索バー（常時表示） ===== */}
        <div
          style={{
            height: "var(--header-search-h)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{ position: "relative", width: "100%", maxWidth: "680px" }}
          >
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  display: "flex",
                }}
              >
                <SearchIcon />
              </span>
              <input
                ref={searchInputRef}
                id="header-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="記事を検索..."
                style={{
                  width: "100%",
                  paddingLeft: "36px",
                  paddingRight: query ? "36px" : "14px",
                  paddingTop: "9px",
                  paddingBottom: "9px",
                  borderRadius: "999px",
                  border: "1.5px solid rgba(0,0,0,0.12)",
                  background: "#f5f5f7",
                  fontSize: "0.875rem",
                  outline: "none",
                  transition: "border-color 150ms ease-out",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.28)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="検索をクリア"
                  style={{
                    position: "absolute", right: "10px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#9ca3af", fontSize: "18px", lineHeight: 1, padding: "2px",
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* サジェストドロップダウン */}
            {(suggestions.length > 0 || query.trim()) && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  zIndex: 200,
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                }}
              >
                {suggestions.map((a, i) => {
                  const imgUrl = getImageUrl(a);
                  return (
                    <div
                      key={a.id}
                      onClick={() => handleSuggestionClick(a.id)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      style={{
                        borderBottom:
                          i < suggestions.length - 1
                            ? "1px solid rgba(0,0,0,0.04)"
                            : "none",
                      }}
                    >
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={a.title ?? ""}
                          width={36}
                          height={36}
                          style={{
                            borderRadius: "6px",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 36, height: 36,
                            borderRadius: "6px",
                            background: "#f0f0f0",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "#1d1d1f" }}
                        >
                          {a.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#86868b" }}>
                          {normalizeCategory(a.category)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {query.trim() && (
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 px-4 py-3 hover:bg-gray-50 transition-colors"
                    style={{
                      background: "none",
                      border: "none",
                      borderTop:
                        suggestions.length > 0
                          ? "1px solid rgba(0,0,0,0.05)"
                          : "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <SearchIcon />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#111111" }}
                    >
                      「{query}」で記事を検索
                    </span>
                  </button>
                )}
              </div>
            )}
          </form>
        </div>

        {/* ===== Row 3: タブバー ===== */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.04)", margin: "0 -16px" }}>
          <Suspense>
            <NavTabBar />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
