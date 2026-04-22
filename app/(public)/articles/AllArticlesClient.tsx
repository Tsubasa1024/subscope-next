"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Article } from "@/lib/utils";
import { normalizeCategory } from "@/lib/utils";
import ArticleCard from "@/components/ArticleCard";

interface AllArticlesClientProps {
  articles: Article[];
  categories: string[];
  initialCategory?: string;
  initialSearch?: string;
  viewCounts?: Record<string, number>;
}

export default function AllArticlesClient({
  articles,
  categories,
  initialCategory = "すべて",
  initialSearch = "",
  viewCounts = {},
}: AllArticlesClientProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery,    setSearchQuery]    = useState(initialSearch);
  const [inputValue,     setInputValue]     = useState(initialSearch);

  // URL の ?category= / ?q= が変わったら追従（ブラウザバック対応）
  useEffect(() => {
    const cat = searchParams.get("category") ?? "すべて";
    const q   = searchParams.get("q") ?? "";
    setActiveCategory(cat);
    setSearchQuery(q);
    setInputValue(q);
  }, [searchParams]);

  // カテゴリ切替 → URL を更新
  function handleCategory(cat: string) {
    setActiveCategory(cat);
    setSearchQuery("");
    setInputValue("");
    const params = new URLSearchParams();
    if (cat !== "すべて") params.set("category", cat);
    router.push(`/articles${params.size ? `?${params}` : ""}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(inputValue);
    setActiveCategory("すべて");
    const params = new URLSearchParams();
    if (inputValue.trim()) params.set("q", inputValue.trim());
    router.push(`/articles${params.size ? `?${params}` : ""}`);
  }

  const filtered = articles.filter((a) => {
    const matchCategory =
      activeCategory === "すべて" ||
      normalizeCategory(a.category) === activeCategory;

    const matchSearch =
      searchQuery === "" ||
      [a.title, a.description, a.service, normalizeCategory(a.category)]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  return (
    <main style={{ paddingTop: "var(--header-h)" }}>

      {/* ===== スティッキーヘッダー（カテゴリタブ + 検索） ===== */}
      <div
        className="sticky z-30"
        style={{
          top: "var(--header-h)",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="container">
          {/* カテゴリタブ（横スクロール） */}
          <div
            className="flex justify-center gap-1 overflow-x-auto py-3"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {["すべて", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{
                  background: cat === activeCategory ? "#1d1d1f" : "transparent",
                  color:      cat === activeCategory ? "#fff"    : "#1d1d1f",
                  fontFamily: "inherit",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 検索フォーム */}
          <div className="pb-3">
            <form
              onSubmit={handleSearch}
              className="flex gap-2 items-center"
              style={{ maxWidth: "480px" }}
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
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="記事を検索..."
                  className="w-full text-sm outline-none"
                  style={{
                    paddingLeft: "36px",
                    paddingRight: inputValue ? "32px" : "12px",
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    borderRadius: "999px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    background: "#f5f5f7",
                  }}
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={() => { setInputValue(""); setSearchQuery(""); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-5 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: "#1d1d1f", fontFamily: "inherit", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                検索
              </button>
            </form>
            {searchQuery && (
              <p className="text-xs mt-2" style={{ color: "#86868b" }}>
                「{searchQuery}」の検索結果：{filtered.length}件
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ===== 記事グリッド ===== */}
      <div className="container" style={{ paddingTop: "32px", paddingBottom: "var(--spacing-section)" }}>

        {/* 見出し */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="font-bold" style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
            {activeCategory === "すべて" ? "すべての記事" : activeCategory}
          </h1>
          <span className="text-sm" style={{ color: "#86868b" }}>
            {filtered.length}件
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: "#86868b" }}>
            <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="font-semibold mb-2" style={{ color: "#1d1d1f" }}>記事が見つかりませんでした</p>
            <p className="text-sm">キーワードやカテゴリを変えてお試しください。</p>
          </div>
        ) : (
          <div className="articles-grid">
            {filtered.map((article, i) => (
              <ArticleCard key={article.id} article={article} priority={i < 3} viewCount={viewCounts[article.id] ?? 0} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
