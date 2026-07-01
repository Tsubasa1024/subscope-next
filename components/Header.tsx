"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Article } from "@/lib/utils";
import { normalizeCategory, getImageUrl } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import NavTabBar from "./NavTabBar";

interface HeaderProps {
  articles?: Article[];
}

export default function Header({ articles = [] }: HeaderProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
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

  // スマホ検索展開時フォーカス
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => mobileSearchRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [searchOpen]);

  // BottomNav からの検索起動イベント
  useEffect(() => {
    const handler = () => {
      // PC は PC 入力にフォーカス、スマホは展開してフォーカス
      if (window.innerWidth >= 768) {
        searchInputRef.current?.focus();
      } else {
        setSearchOpen(true);
      }
    };
    window.addEventListener("open-header-search", handler);
    return () => window.removeEventListener("open-header-search", handler);
  }, []);

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/articles?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery("");
  }

  function handleSuggestionClick(id: string) {
    router.push(`/articles/${id}`);
    setSearchOpen(false);
    setQuery("");
  }

  function closeMobileSearch() {
    setSearchOpen(false);
  }

  const SearchIcon = () => (
    <svg
      width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ color: "#86868b", flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const SuggestionDropdown = () => (
    <>
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
                style={{ borderBottom: i < suggestions.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}
              >
                {imgUrl ? (
                  <Image
                    src={imgUrl} alt={a.title ?? ""}
                    width={36} height={36}
                    style={{ borderRadius: "6px", objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: "6px", background: "#f0f0f0", flexShrink: 0 }} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: "#1d1d1f" }}>{a.title}</p>
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
              onClick={() => handleSearch()}
              className="flex w-full items-center gap-2.5 px-4 py-3 hover:bg-gray-50 transition-colors"
              style={{
                color: "#111111",
                background: "none",
                border: "none",
                borderTop: suggestions.length > 0 ? "1px solid rgba(0,0,0,0.05)" : "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <SearchIcon />
              <span className="text-sm font-semibold">「{query}」で記事を検索</span>
            </button>
          )}
        </div>
      )}
    </>
  );

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 150,
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.08)" : "none",
        transition: "box-shadow 200ms ease-out",
      }}
    >
      {/* ===== 1段目: ロゴ + 検索 ===== */}
      <div
        style={{
          maxWidth: "var(--container-width)",
          margin: "0 auto",
          padding: "0 16px",
          height: "var(--header-row1-h)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        {/* ロゴ */}
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

        {/* ===== PC 検索（常時展開） ===== */}
        <form
          onSubmit={handleSearch}
          className="hidden md:block"
          style={{ position: "relative", width: "240px" }}
        >
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
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
                paddingLeft: "32px",
                paddingRight: query ? "28px" : "12px",
                paddingTop: "7px",
                paddingBottom: "7px",
                borderRadius: "999px",
                border: "1.5px solid rgba(0,0,0,0.12)",
                background: "#f5f5f7",
                fontSize: "0.8125rem",
                outline: "none",
                transition: "border-color 150ms ease-out",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.25)"; }}
              onBlur={(e) => { if (!query) { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; } }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                style={{
                  position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#9ca3af", fontSize: "16px", lineHeight: 1, padding: "2px",
                }}
              >
                ×
              </button>
            )}
          </div>
          <Suspense>
            <SuggestionDropdown />
          </Suspense>
        </form>

        {/* ===== スマホ 検索トグル ===== */}
        <div className="flex md:hidden" style={{ position: "relative" }}>
          {/* 検索アイコンボタン（閉じているとき） */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="検索を開く"
            style={{
              display: searchOpen ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            <SearchIcon />
          </button>

          {/* 検索入力フォーム（展開時） */}
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              width: searchOpen ? "200px" : "0px",
              opacity: searchOpen ? 1 : 0,
              overflow: "hidden",
              transition: "width 200ms ease-out, opacity 200ms ease-out",
            }}
            className="header-search-expand"
          >
            <span style={{ flexShrink: 0, marginLeft: "2px" }}>
              <SearchIcon />
            </span>
            <input
              ref={mobileSearchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="検索..."
              style={{
                flex: 1,
                minWidth: 0,
                paddingTop: "6px",
                paddingBottom: "6px",
                paddingLeft: "4px",
                paddingRight: "4px",
                border: "none",
                borderBottom: "1.5px solid rgba(0,0,0,0.2)",
                background: "transparent",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={closeMobileSearch}
              aria-label="検索を閉じる"
              style={{
                flexShrink: 0,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                fontSize: "18px",
                lineHeight: 1,
                padding: "2px",
              }}
            >
              ×
            </button>
          </form>

          {/* スマホ用サジェスト */}
          {searchOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, left: "-120px", zIndex: 200 }}>
              {(suggestions.length > 0 || query.trim()) && (
                <div
                  style={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                >
                  {suggestions.map((a, i) => {
                    const imgUrl = getImageUrl(a);
                    return (
                      <div
                        key={a.id}
                        onClick={() => handleSuggestionClick(a.id)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                        style={{ borderBottom: i < suggestions.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}
                      >
                        {imgUrl ? (
                          <Image src={imgUrl} alt={a.title ?? ""} width={32} height={32}
                            style={{ borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: "6px", background: "#f0f0f0", flexShrink: 0 }} />
                        )}
                        <p className="text-sm font-medium truncate" style={{ color: "#1d1d1f" }}>{a.title}</p>
                      </div>
                    );
                  })}
                  {query.trim() && (
                    <button
                      type="submit"
                      onClick={() => handleSearch()}
                      className="flex w-full items-center gap-2.5 px-4 py-3 hover:bg-gray-50"
                      style={{
                        background: "none",
                        border: "none",
                        borderTop: suggestions.length > 0 ? "1px solid rgba(0,0,0,0.05)" : "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <SearchIcon />
                      <span className="text-sm font-semibold" style={{ color: "#111111" }}>
                        「{query}」で検索
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== 2段目: タブバー ===== */}
      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.04)",
          maxWidth: "var(--container-width)",
          margin: "0 auto",
        }}
      >
        <Suspense>
          <NavTabBar />
        </Suspense>
      </div>
    </header>
  );
}
