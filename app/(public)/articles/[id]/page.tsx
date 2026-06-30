import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticle, getAllArticleIds, getImageUrl, normalizeCategory, getArticles, getNewsList } from "@/lib/microcms";
import { createClient } from "@/lib/supabase/server";
import ArticleActions from "./ArticleActions";
import ArticleComments from "./ArticleComments";
import ArticleViewTracker from "./ArticleViewTracker";
import PRLabel from "@/components/PRLabel";
import ArticleCard from "@/components/ArticleCard";
import { FEATURES } from "@/lib/features";
import { transformContent } from "@/lib/transformContent";
import { formatViews } from "@/lib/utils";
import type { Article } from "@/lib/utils";
import { fetchAllViewCounts, fetchWeeklyViewCounts } from "@/lib/viewCounts";
import { formatDateJST, todayJST, yesterdayJST } from "@/lib/date";
import NewsCarousel, { type NewsDay } from "@/components/NewsCarousel";

// 認証状態を読むため動的レンダリング（記事本文はfetchキャッシュで高速）
export const dynamic = "force-dynamic";
export const dynamicParams = true;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const article = await getArticle(id);
    const imgUrl = getImageUrl(article);
    return {
      title: article.title,
      description: article.description,
      alternates: { canonical: `https://www.subscope.jp/articles/${id}` },
      openGraph: {
        title: article.title,
        description: article.description,
        type: "article",
        publishedTime: article.publishedAt,
        images: imgUrl ? [{ url: imgUrl, width: 1200, height: 630 }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description: article.description,
        images: imgUrl ? [imgUrl] : [],
      },
    };
  } catch {
    return { title: "記事が見つかりません" };
  }
}

export async function generateStaticParams() {
  if (!process.env.MICROCMS_API_KEY || process.env.MICROCMS_API_KEY === "your_api_key_here") {
    return [];
  }
  try {
    const ids = await getAllArticleIds();
    return ids.map((id) => ({ id }));
  } catch {
    return [];
  }
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;

  let article;
  try {
    article = await getArticle(id);
  } catch {
    notFound();
  }

  const imgUrl     = getImageUrl(article);
  const category   = normalizeCategory(article.category);
  const date       = article.publishedAt ? formatDateJST(article.publishedAt) : "";
  const articleUrl = `https://www.subscope.jp/articles/${id}`;
  const content    = article.content ? await transformContent(article.content) : null;

  // サーバー側でユーザーの保存済み・いいね状態・views を取得（ちらつき防止）
  let initialSaved: boolean | undefined;
  let initialLiked: boolean | undefined;
  let initialLikeCount: number | undefined;
  let articleViewCount = 0;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [likesResult, viewsResult, ...userResults] = await Promise.all([
      supabase.from("article_likes").select("*", { count: "exact", head: true }).eq("article_id", id),
      supabase.from("article_views" as never).select("*", { count: "exact", head: true }).eq("article_id", id),
      ...(user ? [
        supabase.from("article_saves").select("user_id").eq("article_id", id).eq("user_id", user.id).maybeSingle(),
        supabase.from("article_likes").select("user_id").eq("article_id", id).eq("user_id", user.id).maybeSingle(),
      ] : []),
    ]);
    initialLikeCount = likesResult.count ?? 0;
    articleViewCount = (viewsResult as { count: number | null }).count ?? 0;
    if (user) {
      initialSaved = !!(userResults[0] as { data: unknown }).data;
      initialLiked = !!(userResults[1] as { data: unknown }).data;
    }
  } catch {
    // 取得失敗時はクライアント側のuseEffectにフォールバック
  }

  // 関連記事・ランキング・ニュース用データ取得
  const [allArticles, viewCounts, weeklyViewCounts, newsRes] = await Promise.all([
    getArticles(100).then(r => r.contents).catch((): Article[] => []),
    fetchAllViewCounts().catch((): Record<string, number> => ({})),
    fetchWeeklyViewCounts().catch((): Record<string, number> => ({})),
    getNewsList(21).catch(() => ({ contents: [] as Article[] })),
  ]);

  // 関連記事: 同カテゴリ優先、不足分は最新記事で補完（常に3〜4件確保）
  const sameCategory = allArticles.filter(
    (a) => a.id !== id && normalizeCategory(a.category) === category
  );
  const otherArticles = allArticles.filter(
    (a) => a.id !== id && normalizeCategory(a.category) !== category
  );
  const relatedArticles = [
    ...sameCategory,
    ...otherArticles,
  ].slice(0, 4);

  // 週間PVランキング（自記事除外・データあり記事のみ・上位5件）
  const rankingArticles = [...allArticles]
    .filter((a) => a.id !== id && (weeklyViewCounts[a.id] ?? 0) > 0)
    .sort((a, b) => (weeklyViewCounts[b.id] ?? 0) - (weeklyViewCounts[a.id] ?? 0))
    .slice(0, 5);

  // ニュースを日付ごとにグルーピング（最大7日・1日3件）
  const newsItems = newsRes.contents;
  const _today = todayJST();
  const _yesterday = yesterdayJST();
  function makeDateLabel(d: string): string {
    if (d === _today)     return `${d.slice(5).replace("-", "/")}（今日）`;
    if (d === _yesterday) return `${d.slice(5).replace("-", "/")}（昨日）`;
    return d.slice(5).replace("-", "/");
  }
  const _byDay: Record<string, Article[]> = {};
  for (const a of newsItems) {
    const d = a.publishedAt ? formatDateJST(a.publishedAt) : "unknown";
    if (!_byDay[d]) _byDay[d] = [];
    if (_byDay[d].length < 3) _byDay[d].push(a);
  }
  const newsGroups: NewsDay[] = Object.entries(_byDay)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7)
    .map(([dateStr, articles]) => ({ dateStr, label: makeDateLabel(dateStr), articles }));

  // viewCounts は allViewCounts（記事カード・NewsCarousel 共用）
  const relatedViewCounts = viewCounts;

  return (
    <main style={{ paddingTop: "var(--header-h)" }}>
      <ArticleViewTracker articleId={id} />
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px 48px" }}>

        {/* メタ情報 */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          {category && (
            <Link
              href={`/articles?category=${encodeURIComponent(category)}`}
              className="rounded-full text-xs font-medium px-3 py-1 hover:opacity-70 transition-opacity"
              style={{ background: "#f0f0f0", color: "#555555", textDecoration: "none" }}
            >
              {category}
            </Link>
          )}
          {date && (
            <span className="text-sm" style={{ color: "#aaaaaa" }}>{date}</span>
          )}
          {articleViewCount > 0 && (
            <span className="flex items-center gap-1 text-sm" style={{ color: "#aaaaaa" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {formatViews(articleViewCount)}
            </span>
          )}
        </div>

        {/* タイトル */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            lineHeight: 1.5,
            letterSpacing: "-0.02em",
            marginBottom: "24px",
            color: "#111111",
          }}
        >
          {article.title}
        </h1>

        {/* PR表記（ステマ規制対応） */}
        {article.isPR && <PRLabel />}

        {/* ===== アクション（上部バー + コンテンツ + 下部バー を内包）===== */}
        <ArticleActions
          articleId={id}
          articleTitle={article.title ?? ""}
          articleUrl={articleUrl}
          articleImageUrl={imgUrl ?? undefined}
          initialSaved={initialSaved}
          initialLiked={initialLiked}
          initialLikeCount={initialLikeCount}
        >
          {/* サムネイル */}
          {imgUrl && (
            <div
              className="overflow-hidden mb-8"
              style={{ position: "relative", aspectRatio: "16/9", background: "#f0f0f0" }}
            >
              <Image
                src={imgUrl}
                alt={article.title ?? ""}
                fill
                sizes="(max-width: 680px) 100vw, 680px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          )}

          {/* 本文 */}
          {content && (
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}

          {/* タグ */}
          {article.tags && article.tags.length > 0 && (
            <div
              className="flex flex-wrap gap-2 mt-10 pt-6"
              style={{ borderTop: "1px solid #e5e5e5" }}
            >
              {article.tags.map((tag, i) => {
                const tagName = typeof tag === "string" ? tag : tag.name || tag.id;
                return (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ background: "#f0f0f0", color: "#666666" }}
                  >
                    #{tagName}
                  </span>
                );
              })}
            </div>
          )}
        </ArticleActions>

        {/* コメントセクション（FEATURES.comments が true のときのみ表示）*/}
        {FEATURES.comments && <ArticleComments articleId={id} />}

        {/* 関連記事 */}
        {relatedArticles.length > 0 && (
          <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1px solid rgba(0,0,0,0.07)" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                marginBottom: "16px",
                color: "#1d1d1f",
              }}
            >
              関連記事
            </h2>
            <div className="flex flex-col">
              {relatedArticles.map((a, i) => (
                <ArticleCard key={a.id} article={a} viewCount={relatedViewCounts[a.id] ?? 0} index={i} />
              ))}
            </div>
          </div>
        )}

      </div>{/* /680px */}

      {/* ============================================================
          週間PVランキング
      ============================================================ */}
      {rankingArticles.length > 0 && (
        <section style={{ borderTop: "1px solid rgba(0,0,0,0.06)", marginTop: "0" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "#fff", background: "#111", borderRadius: "4px", padding: "3px 7px" }}>
                WEEKLY
              </span>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.01em" }}>
                今週よく読まれている
              </h2>
            </div>
            <div>
              {rankingArticles.map((a, i) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 0",
                    borderBottom: i < rankingArticles.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                  className="hover:opacity-75 transition-opacity"
                >
                  {/* 順位番号 */}
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      width: "28px",
                      flexShrink: 0,
                      lineHeight: 1,
                      color: i === 0 ? "#111" : i === 1 ? "#555" : "#ccc",
                      textAlign: "center",
                    }}
                  >
                    {i + 1}
                  </span>
                  {/* サムネ */}
                  <div
                    style={{
                      width: "72px",
                      height: "54px",
                      borderRadius: "8px",
                      background: "#f0f0f0",
                      flexShrink: 0,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {getImageUrl(a) && (
                      <Image
                        src={getImageUrl(a)}
                        alt={a.title ?? ""}
                        fill
                        sizes="72px"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>
                  {/* テキスト */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        lineHeight: 1.4,
                        color: "#1d1d1f",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        marginBottom: "4px",
                      }}
                    >
                      {a.title}
                    </p>
                    <span style={{ fontSize: "0.72rem", color: "#86868b", display: "flex", alignItems: "center", gap: "3px" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {formatViews(weeklyViewCounts[a.id] ?? 0)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          最新ニュース（NewsCarousel 再利用）
      ============================================================ */}
      {newsGroups.length > 0 && (
        <section style={{ background: "#f5f5f7", padding: "40px 0" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "#fff", background: "#111", borderRadius: "4px", padding: "3px 7px" }}>
                NEWS
              </span>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.01em" }}>
                最新ニュース
              </h2>
              <span style={{ fontSize: "11px", color: "#86868b" }}>毎日更新</span>
            </div>
            <NewsCarousel days={newsGroups} viewCounts={viewCounts} />
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Link href="/news" style={{ fontSize: "0.85rem", color: "#555", textDecoration: "none" }}>
                ニュースをもっと見る →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          SUBSCOPEとは + カテゴリ導線
      ============================================================ */}
      <section style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: "32px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <p style={{ fontSize: "0.875rem", color: "#555", lineHeight: 1.75, marginBottom: "16px" }}>
            <Link href="/" style={{ fontWeight: 700, color: "#111", textDecoration: "none" }}>SUBSCOPE</Link>
            {" "}は、ChatGPT・Claude・Gemini・GrokなどのAI最新ニュースを毎日お届けするメディアです。
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              { label: "ChatGPT", href: "/articles?category=ChatGPT" },
              { label: "Claude",  href: "/articles?category=Claude" },
              { label: "Gemini",  href: "/articles?category=Gemini" },
              { label: "xAI",     href: "/articles?category=xAI" },
              { label: "その他",  href: "/articles?category=その他" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "5px 14px",
                  borderRadius: "999px",
                  border: "1.5px solid rgba(0,0,0,0.15)",
                  color: "#333",
                  textDecoration: "none",
                }}
                className="hover:opacity-70 transition-opacity"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/articles"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                padding: "5px 14px",
                borderRadius: "999px",
                background: "#111",
                color: "#fff",
                textDecoration: "none",
              }}
              className="hover:opacity-70 transition-opacity"
            >
              記事一覧 →
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
