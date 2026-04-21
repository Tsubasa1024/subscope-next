"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Article } from "@/lib/utils";
import { normalizeCategory, getImageUrl } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import { ChevronRight, X } from "lucide-react";
import { FEATURES } from "@/lib/features";

interface HeaderProps {
  articles?: Article[];
}

const NAV_ITEMS_BASE = [
  { href: "/ranking",         label: "記事ランキング" },
  // { href: "/service-ranking", label: "サブスクランキング" }, // UI非表示
];

const NAV_ITEMS_DIAGNOSIS = { href: "/diagnosis", label: "診断" };

const NAV_ITEMS = FEATURES.aiDiagnosis
  ? [...NAV_ITEMS_BASE, NAV_ITEMS_DIAGNOSIS]
  : NAV_ITEMS_BASE;


const ARTICLE_CATEGORIES = [
  { label: "AI",           href: "/articles?category=AI" },
  { label: "動画",         href: "/articles?category=動画" },
  { label: "音楽",         href: "/articles?category=音楽" },
  { label: "読書",         href: "/articles?category=読書" },
  { label: "フィットネス", href: "/articles?category=フィットネス" },
  { label: "学習",         href: "/articles?category=学習" },
  { label: "ビジネス",     href: "/articles?category=ビジネス" },
  { label: "その他",       href: "/articles?category=その他" },
];

export default function Header({ articles = [] }: HeaderProps) {
  const { user, ready, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // サジェスト（記事タイトルから最大5件）
  const suggestions =
    query.length >= 1
      ? articles
          .filter((a) => {
            const hay = [a.title, a.description, a.service, normalizeCategory(a.category)]
              .join(" ")
              .toLowerCase();
            return hay.includes(query.toLowerCase());
          })
          .slice(0, 5)
      : [];

  // ドロワーが開いたら検索ボックスにフォーカス
  useEffect(() => {
    if (drawerOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 300);
    } else {
      setQuery("");
    }
  }, [drawerOpen]);

  // スクロールロック
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  function openDrawer() {
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/articles?q=${encodeURIComponent(q)}`);
    closeDrawer();
  }

  function handleSuggestionClick(id: string) {
    router.push(`/articles/${id}`);
    closeDrawer();
  }

  return (
    <>
      {/* ===== ヘッダー本体 ===== */}
      <header
        className="fixed top-0 left-0 w-full z-[150]"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{
            maxWidth: "var(--container-width)",
            margin: "0 auto",
            padding: "0 24px",
            height: "var(--header-h)",
          }}
        >
          {/* ===== LEFT: スペーサー（ハンバーガーと同幅）===== */}
          <div className="w-10 flex-shrink-0" />

          {/* ===== CENTER: ロゴ ===== */}
          <Link
            href="/"
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#1d1d1f",
            }}
          >
            SUBSCOPE
          </Link>

          {/* ===== RIGHT: ハンバーガーボタン ===== */}
          <button
            onClick={openDrawer}
            aria-label="メニューを開く"
            className="flex flex-col items-center justify-center w-10 h-10 flex-shrink-0 rounded-full hover:bg-gray-100 transition-colors gap-[5px]"
          >
            <span className="block w-[18px] h-[2px] rounded bg-gray-800" />
            <span className="block w-[14px] h-[2px] rounded bg-gray-800" />
            <span className="block w-[18px] h-[2px] rounded bg-gray-800" />
          </button>
        </div>
      </header>

      {/* ===== オーバーレイ ===== */}
      <div
        className="fixed inset-0 z-[160] transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.6)",
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* ===== ドロワー ===== */}
      <div
        className="fixed top-0 right-0 h-full z-[170] bg-white flex flex-col"
        style={{
          width: "600px",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* ドロワーヘッダー：閉じるボタン */}
        <div
          className="flex items-center justify-end px-4"
          style={{ height: "var(--header-h)", borderBottom: "1px solid rgba(0,0,0,0.06)", flexShrink: 0 }}
        >
          <button
            onClick={closeDrawer}
            aria-label="メニューを閉じる"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* ドロワー本体（スクロール可能） */}
        <div className="flex-1 overflow-y-auto px-4 py-4">

          {/* 検索ボックス */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "#86868b" }}
                width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="検索..."
                className="w-full text-sm outline-none"
                style={{
                  paddingLeft: "36px",
                  paddingRight: query ? "32px" : "12px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  borderRadius: "999px",
                  border: "1.5px solid rgba(0,0,0,0.15)",
                  background: "#f5f5f5",
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>

            {/* サジェスト */}
            {(suggestions.length > 0 || query.trim()) && (
              <div
                className="mt-2 rounded-2xl overflow-hidden bg-white"
                style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
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
                          width={40} height={40}
                          style={{ borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: "#1d1d1f" }}>{a.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#86868b" }}>
                          {normalizeCategory(a.category)}{a.service ? ` · ${a.service}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {query.trim() && (
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 px-4 py-3 hover:bg-blue-50 transition-colors"
                    style={{
                      color: "#111111",
                      borderTop: suggestions.length > 0 ? "1px solid rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span className="text-sm font-semibold">「{query}」で記事を検索</span>
                  </button>
                )}
              </div>
            )}
          </form>

          {/* カテゴリグリッド */}
          <div className="mb-4">
            {/* 「すべての記事 →」リンク見出し */}
            <Link
              href="/articles"
              onClick={closeDrawer}
              className="flex justify-between items-center w-full px-4 py-3 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors mb-1"
              style={{ color: "#1d1d1f" }}
            >
              すべての記事
              <ChevronRight size={16} className="text-gray-400" />
            </Link>

            {/* 2列グリッド（8項目 = 4行×2列） */}
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <div className="grid grid-cols-2">
                {ARTICLE_CATEGORIES.map(({ label, href }, i) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeDrawer}
                    className="flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors"
                    style={{
                      color: "#111111",
                      borderRight: i % 2 === 0 ? "1px solid #e5e7eb" : "none",
                      borderBottom: i < ARTICLE_CATEGORIES.length - 2 ? "1px solid #e5e7eb" : "none",
                    }}
                  >
                    <span className="text-base font-medium">{label}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ナビリンク */}
          <nav>
            <ul className="space-y-1">
              {NAV_ITEMS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeDrawer}
                    className="flex justify-between items-center w-full px-4 py-3 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors"
                    style={{ color: "#1d1d1f" }}
                  >
                    {label}
                    <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 区切り線 */}
          <hr className="my-4" style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.07)" }} />

          {/* ログイン / アカウント */}
          {ready && (
            user ? (
              <ul className="space-y-1">
                <li>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div
                      style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        border: "2px solid rgba(0,0,0,0.08)",
                        background: user.photoURL ? "transparent" : user.color,
                        overflow: "hidden", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL} alt={user.name}
                          width={36} height={36}
                          style={{ borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>
                          {user.name[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#1d1d1f" }}>{user.name}</p>
                      <p className="text-xs truncate" style={{ color: "#86868b" }}>{user.email}</p>
                    </div>
                  </div>
                </li>
                <li>
                  <Link
                    href="/mypage"
                    onClick={closeDrawer}
                    className="block px-4 py-3 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors"
                    style={{ color: "#1d1d1f" }}
                  >
                    マイページ
                  </Link>
                </li>
                <li>
                  <button
                    onClick={async () => { closeDrawer(); await logout(); }}
                    className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors"
                    style={{ color: "#111111", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    ログアウト
                  </button>
                </li>
              </ul>
            ) : (
              // ログイン・会員登録ボタン UI非表示
              null
            )
          )}
        </div>
      </div>
    </>
  );
}
