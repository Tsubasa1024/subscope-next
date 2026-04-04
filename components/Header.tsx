"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Article } from "@/lib/utils";
import { normalizeCategory, getImageUrl } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";

interface HeaderProps {
  articles?: Article[];
}

const NAV_ITEMS = [
  { href: "/services",  label: "サービス" },
  { href: "/ranking",   label: "ランキング" },
  { href: "/compare",   label: "比較" },
  { href: "/diagnosis", label: "診断" },
  { href: "/articles",  label: "記事" },
];

export default function Header({ articles = [] }: HeaderProps) {
  const { user, ready, logout } = useAuth();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [query,       setQuery]       = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  // キーワードサジェスト（記事タイトルから最大5件）
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

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function openSearch() {
    setSearchOpen(true);
    setMenuOpen(false);
    setAccountOpen(false);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  // Enter キーまたはサジェスト下の「検索」行クリックで /services?q= へ遷移
  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/services?q=${encodeURIComponent(q)}`);
    closeSearch();
  }

  function handleSuggestionClick(id: string) {
    router.push(`/articles/${id}`);
    closeSearch();
  }

  function closeAll() {
    setMenuOpen(false);
    setAccountOpen(false);
    if (!query) setSearchOpen(false);
  }

  return (
    <>
      {/* ===== オーバーレイ ===== */}
      {(menuOpen || accountOpen || (searchOpen && query)) && (
        <div className="fixed inset-0 z-[120]" onClick={closeAll} />
      )}

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
          className="flex items-center relative"
          style={{
            maxWidth: "var(--container-width)",
            margin: "0 auto",
            padding: "0 24px",
            height: "var(--header-h)",
          }}
        >

          {/* ===== LEFT: 検索 ===== */}
          <div className="flex items-center" style={{ flex: "0 0 auto" }}>
            {searchOpen ? (
              /* 展開状態：入力フォーム */
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 w-full"
              >
                <div className="relative flex-1">
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
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="検索..."
                    className="w-full text-sm outline-none"
                    style={{
                      paddingLeft: "36px",
                      paddingRight: query ? "32px" : "12px",
                      paddingTop: "8px",
                      paddingBottom: "8px",
                      borderRadius: "999px",
                      border: "1.5px solid rgba(37,99,235,0.3)",
                      background: "#f8faff",
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
                <button
                  type="button"
                  onClick={closeSearch}
                  className="text-xs font-medium whitespace-nowrap hover:opacity-70 transition-opacity"
                  style={{ color: "#86868b" }}
                >
                  キャンセル
                </button>
              </form>
            ) : (
              /* 折りたたみ状態：検索ボタン */
              <button
                onClick={openSearch}
                aria-label="検索を開く"
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                style={{ color: "#86868b" }}
              >
                <svg
                  width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="hidden md:inline text-sm font-medium">検索</span>
              </button>
            )}
          </div>

          {/* ===== CENTER: ロゴ（absolute で中央固定）===== */}
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
            <Link
              href="/"
              className="pointer-events-auto"
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#1d1d1f",
              }}
            >
              SUBSCOPE
            </Link>
          </div>

          {/* ===== RIGHT: デスクトップナビ + ログイン + ハンバーガー ===== */}
          <div
            className="flex items-center gap-1 ml-auto"
            style={{ flex: "1 1 0", justifyContent: "flex-end", minWidth: 0 }}
          >
            {/* デスクトップ用ナビリンク（lg以上） */}
            <nav className="hidden lg:flex items-center gap-0 mr-2" style={{ flexShrink: 0 }}>
              {NAV_ITEMS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-2.5 py-1.5 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
                  style={{ color: "#1d1d1f" }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* ログインボタン / アバター */}
            {ready && (
              user ? (
                /* ログイン済：アバターボタン */
                <div className="relative">
                  <button
                    onClick={() => { setAccountOpen((v) => !v); setMenuOpen(false); }}
                    aria-label="アカウントメニュー"
                    style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      border: "2px solid rgba(0,0,0,0.08)",
                      background: user.photoURL ? "transparent" : user.color,
                      cursor: "pointer", overflow: "hidden", padding: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
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
                  </button>

                  {/* アカウントドロップダウン */}
                  {accountOpen && (
                    <div
                      className="absolute z-[9999]"
                      style={{
                        top: "calc(100% + 8px)", right: 0, minWidth: "200px",
                        background: "rgba(255,255,255,0.97)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: "20px",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
                        padding: "16px",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "2px" }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#86868b", marginBottom: "12px", wordBreak: "break-all" }}>
                        {user.email}
                      </div>
                      <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.08)", marginBottom: "10px" }} />
                      <Link
                        href="/mypage"
                        onClick={() => setAccountOpen(false)}
                        className="block px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                        style={{ color: "#1d1d1f" }}
                      >
                        マイページ
                      </Link>
                      <button
                        onClick={async () => { setAccountOpen(false); await logout(); }}
                        className="block w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                        style={{ color: "#c0392b", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* 未ログイン：ログイン＋会員登録ボタン */
                <div className="hidden lg:flex items-center gap-2" style={{ flexShrink: 0 }}>
                  <Link
                    href="/login"
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:bg-gray-100 whitespace-nowrap"
                    style={{ color: "#1d1d1f" }}
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-1.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 whitespace-nowrap"
                    style={{ background: "#1d1d1f" }}
                  >
                    会員登録
                  </Link>
                </div>
              )
            )}

            {/* ハンバーガーボタン（lg未満） */}
            <button
              onClick={() => { setMenuOpen((v) => !v); setAccountOpen(false); }}
              aria-label="メニューを開く"
              className="lg:hidden flex flex-col items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors gap-[5px]"
            >
              <span
                className="block h-[2px] rounded bg-gray-800 transition-all duration-200 origin-center"
                style={{
                  width: "18px",
                  transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block h-[2px] rounded bg-gray-800 transition-all duration-200"
                style={{ width: "14px", opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block h-[2px] rounded bg-gray-800 transition-all duration-200 origin-center"
                style={{
                  width: "18px",
                  transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ===== モバイルドロップダウンメニュー ===== */}
      <nav
        className="fixed z-[140] lg:hidden overflow-hidden transition-all duration-300"
        style={{
          top: "var(--header-h)",
          left: "12px",
          right: "12px",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          boxShadow: menuOpen ? "0 20px 60px rgba(0,0,0,0.14)" : "none",
          border: menuOpen ? "1px solid rgba(0,0,0,0.05)" : "1px solid transparent",
          maxHeight: menuOpen ? "480px" : "0",
          padding: menuOpen ? "12px" : "0 12px",
        }}
      >
        <ul>
          {NAV_ITEMS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                style={{ color: "#1d1d1f" }}
              >
                {label}
              </Link>
            </li>
          ))}
          <li className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            {user ? (
              <>
                <Link
                  href="/mypage"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  マイページ（{user.name}）
                </Link>
                <button
                  onClick={async () => { setMenuOpen(false); await logout(); }}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                  style={{ color: "#c0392b", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
                  style={{ color: "#2563eb" }}
                >
                  無料で始める →
                </Link>
              </>
            )}
          </li>
        </ul>
      </nav>

      {/* ===== 検索サジェストドロップダウン ===== */}
      {searchOpen && (suggestions.length > 0 || query.length >= 1) && (
        <div
          className="fixed z-[130]"
          style={{ top: "calc(var(--header-h) + 8px)", left: "24px", maxWidth: "460px" }}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}
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
                      width={44} height={44}
                      style={{ borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-gray-100 flex-shrink-0" />
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
            {/* 「〇〇でサービスを検索」行 */}
            {query.trim() && (
              <button
                onClick={() => handleSearch()}
                className="flex w-full items-center gap-2.5 px-4 py-3 hover:bg-blue-50 transition-colors"
                style={{ color: "#2563eb", borderTop: suggestions.length > 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="text-sm font-semibold">「{query}」でサービスを検索</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
