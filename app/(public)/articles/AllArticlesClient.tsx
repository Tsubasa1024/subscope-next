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
  initialType?: string;
  viewCounts?: Record<string, number>;
}

const TYPE_TABS = [
  { label: "ALL",     value: "all" },
  { label: "NEWS",    value: "news" },
  { label: "ARTICLE", value: "article" },
];

export default function AllArticlesClient({
  articles,
  categories,
  initialCategory = "すべて",
  initialSearch = "",
  initialType = "all",
  viewCounts = {},
}: AllArticlesClientProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [activeType,     setActiveType]     = useState(initialType);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery,    setSearchQuery]    = useState(initialSearch);
  const [inputValue,     setInputValue]     = useState(initialSearch);

  useEffect(() => {
    const cat  = searchParams.get("category") ?? "すべて";
    const q    = searchParams.get("q")        ?? "";
    const type = searchParams.get("type")     ?? "all";
    setActiveType(type);
    setActiveCategory(cat);
    setSearchQuery(q);
    setInputValue(q);
  }, [searchParams]);

  function buildQS(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = {
      type: activeType,
      category: activeCategory !== "すべて" ? activeCategory : "",
      q: searchQuery,
      ...overrides,
    };
    if (merged.type && merged.type !== "all") params.set("type", merged.type);
    if (merged.category) params.set("category", merged.category);
    if (merged.q)        params.set("q", merged.q);
    return params.toString() ? `?${params.toString()}` : "";
  }

  function handleType(type: string) {
    setActiveType(type);
    setActiveCategory("すべて");
    setSearchQuery("");
    setInputValue("");
    const qs = type !== "all" ? `?type=${type}` : "";
    router.push(`/articles${qs}`);
  }

  function handleCategory(cat: string) {
    setActiveCategory(cat);
    setSearchQuery("");
    setInputValue("");
    router.push(`/articles${buildQS({ category: cat !== "すべて" ? cat : "", q: "" })}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setSearchQuery(trimmed);
    setActiveCategory("すべて");
    router.push(`/articles${buildQS({ q: trimmed, category: "" })}`);
  }

  const filtered = articles.filter((a) => {
    const matchCategory =
      activeCategory === "すべて" ||
      normalizeCategory(a.category) === activeCategory;

    const matchSearch =
      searchQuery === "" ||
      [a.title, a.description, normalizeCategory(a.category)]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  const tabStyle = (active: boolean) => ({
    padding: "6px 16px",
    borderRadius: "999px",
    fontSize: "0.875rem",
    background: active ? "#111111" : "#fff",
    color:      active ? "#fff"    : "#1d1d1f",
    fontWeight: active ? 600       : 400,
    border:     active ? "1px solid #111111" : "1px solid #d2d2d7",
    fontFamily: "inherit",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
    transition: "all 0.2s ease",
  });

  return (
    <main style={{ paddingTop: "var(--header-h)" }}>

      {/* ===== 大タイトル ===== */}
      <div className="container" style={{ paddingTop: "32px" }}>
        <section style={{ paddingBottom: "32px" }}>
          <p style={{ fontSize: "0.85rem", color: "#86868b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Articles
          </p>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 700, letterSpacing: "-0.03em", marginTop: "10px" }}>
            記事一覧
          </h1>
        </section>
      </div>

      {/* ===== スティッキーヘッダー ===== */}
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

          {/* 検索フォーム */}
          <div className="pt-3">
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

          {/* タイプタブ */}
          <div className="pt-2 pb-1" style={{ display: "flex", gap: "8px" }}>
            {TYPE_TABS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleType(value)}
                style={tabStyle(activeType === value)}
                onMouseEnter={(e) => {
                  if (activeType !== value) e.currentTarget.style.background = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  if (activeType !== value) e.currentTarget.style.background = "#fff";
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* カテゴリタブ */}
          <div
            className="hide-scrollbar py-3"
            style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" }}
          >
            {["すべて", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "0.875rem",
                  background: cat === activeCategory ? "#111111" : "#fff",
                  color:      cat === activeCategory ? "#fff"    : "#1d1d1f",
                  fontWeight:  cat === activeCategory ? 600       : 400,
                  border:     cat === activeCategory ? "1px solid #111111" : "1px solid #d2d2d7",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (cat !== activeCategory) {
                    e.currentTarget.style.background = "#f5f5f5";
                    e.currentTarget.style.transform = "scale(1.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (cat !== activeCategory) {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.transform = "scale(1.0)";
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 記事グリッド ===== */}
      <div className="container" style={{ paddingTop: "32px", paddingBottom: "var(--spacing-section)" }}>

        {activeCategory !== "すべて" && (
          <h2 className="font-bold mb-6" style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
            {activeCategory}
          </h2>
        )}

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
              <ArticleCard key={article.id} article={article} priority={i < 3} viewCount={viewCounts[article.id] ?? 0} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
