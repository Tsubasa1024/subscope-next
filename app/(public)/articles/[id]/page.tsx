import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticle, getAllArticleIds, getImageUrl, normalizeCategory } from "@/lib/microcms";
import ArticleActions from "./ArticleActions";
import ArticleComments from "./ArticleComments";
import ArticleViewTracker from "./ArticleViewTracker";

// ISR: 60秒ごとに再検証
export const revalidate = 60;
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

  const imgUrl   = getImageUrl(article);
  const category = normalizeCategory(article.category);
  const date     = article.publishedAt ? article.publishedAt.slice(0, 10) : "";
  const articleUrl = `https://www.subscope.jp/articles/${id}`;

  return (
    <main style={{ paddingTop: "var(--header-h)", paddingBottom: "60px" }}>
      <ArticleViewTracker articleId={id} />
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px 0" }}>

        {/* メタ情報 */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          {category && (
            <span
              className="rounded-full text-xs font-medium px-3 py-1"
              style={{ background: "#f0f0f0", color: "#555555" }}
            >
              {category}
            </span>
          )}
          {article.service && (
            <span className="text-sm" style={{ color: "#888888" }}>{article.service}</span>
          )}
          {date && (
            <span className="text-sm" style={{ color: "#aaaaaa" }}>{date}</span>
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

        {/* ===== アクション（上部バー + コンテンツ + 下部バー を内包）===== */}
        <ArticleActions
          articleId={id}
          articleTitle={article.title ?? ""}
          articleUrl={articleUrl}
          articleImageUrl={imgUrl ?? undefined}
        >
          {/* サムネイル */}
          {imgUrl && (
            <div
              className="rounded-lg overflow-hidden mb-10"
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
          {article.content && (
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{ fontSize: "17px", lineHeight: 2.0, color: "#1f2937" }}
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

        {/* コメントセクション */}
        <ArticleComments articleId={id} />

        {/* 戻るリンク */}
        <div className="mt-10 mb-4">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: "#666666" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.5 7h-9M5 2.5L.5 7 5 11.5" />
            </svg>
            記事一覧へ戻る
          </Link>
        </div>

      </div>
    </main>
  );
}
