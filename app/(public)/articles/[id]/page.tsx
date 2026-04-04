import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticle, getAllArticleIds, getImageUrl, normalizeCategory } from "@/lib/microcms";

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

  const imgUrl = getImageUrl(article);
  const category = normalizeCategory(article.category);
  const date = article.publishedAt ? article.publishedAt.slice(0, 10) : "";

  return (
    <main style={{ paddingTop: "80px" }}>
      {/* ヒーロー画像 */}
      {imgUrl && (
        <div
          style={{
            width: "100%",
            maxWidth: "var(--container-width)",
            margin: "0 auto",
            padding: "24px 24px 0",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: "24px",
              overflow: "hidden",
              background: "#f0f0f0",
            }}
          >
            <Image
              src={imgUrl}
              alt={article.title ?? ""}
              fill
              sizes="(max-width: 1080px) 100vw, 1080px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      )}

      {/* 記事本文 */}
      <article
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        {/* メタ情報 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          {category && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                padding: "4px 12px",
                borderRadius: "99px",
                background: "#ebebef",
                color: "#1d1d1f",
              }}
            >
              {category}
            </span>
          )}
          {article.service && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#86868b",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              {article.service}
            </span>
          )}
          {date && (
            <span style={{ fontSize: "11px", color: "#86868b", marginLeft: "auto" }}>
              {date}
            </span>
          )}
        </div>

        {/* タイトル */}
        <h1
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            marginBottom: "24px",
          }}
        >
          {article.title}
        </h1>

        {/* 本文 HTML */}
        {article.content && (
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{
              lineHeight: 1.8,
              fontSize: "1rem",
              color: "#1d1d1f",
            }}
          />
        )}

        {/* タグ */}
        {article.tags && article.tags.length > 0 && (
          <div
            style={{
              marginTop: "40px",
              paddingTop: "24px",
              borderTop: "1px solid #d2d2d7",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {article.tags.map((tag, i) => {
              const tagName = typeof tag === "string" ? tag : tag.name || tag.id;
              return (
                <span
                  key={i}
                  style={{
                    fontSize: "12px",
                    padding: "4px 12px",
                    borderRadius: "99px",
                    background: "#f5f5f7",
                    color: "#86868b",
                  }}
                >
                  #{tagName}
                </span>
              );
            })}
          </div>
        )}

        {/* 戻るボタン */}
        <div style={{ marginTop: "48px" }}>
          <Link
            href="/articles"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#1d1d1f",
              padding: "10px 24px",
              borderRadius: "40px",
              border: "1px solid rgba(0,0,0,0.12)",
            }}
          >
            ← 記事一覧へ戻る
          </Link>
        </div>
      </article>
    </main>
  );
}
