"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Article } from "@/lib/utils";
import ArticleCard from "@/components/ArticleCard";

interface Review {
  user_id: string;
  score: number;
  good_points: string | null;
  bad_points: string | null;
  created_at: string;
  users: { display_name: string | null; username: string | null } | null;
}

interface ServiceData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  category: string | null;
}

interface Props {
  service: ServiceData;
  reviews: Review[];
  avgScore: number;
  reviewCount: number;
  relatedArticles: Article[];
  userId: string | null;
  userReview: Review | null;
}

function getLogoSrc(logoUrl: string): string {
  // Supabase StorageなどフルURLはそのまま使用
  if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
    // Supabase Storage URL かどうかを判定しない: Clearbit変換はドメイン名のみに適用
    try {
      const url = new URL(logoUrl);
      // storage系URLはそのまま返す
      if (url.pathname.includes("/storage/") || url.pathname.includes("/object/")) {
        return logoUrl;
      }
      // それ以外のhttps URLはClearbitへ
      return `https://logo.clearbit.com/${url.hostname}`;
    } catch {
      return logoUrl;
    }
  }
  // ドメイン文字列 → Clearbit
  return `https://logo.clearbit.com/${logoUrl}`;
}

const STAR_PATH =
  "M 8,1 L 9.646,5.735 L 14.658,5.837 L 10.663,8.865 L 12.115,13.663 L 8,10.8 L 3.885,13.663 L 5.337,8.865 L 1.342,5.837 L 6.354,5.735 Z";

function StarDisplay({
  score,
  uid,
  size = 16,
}: {
  score: number;
  uid: string;
  size?: number;
}) {
  const starValue = score / 2;
  const types = Array.from({ length: 5 }, (_, i) => {
    const filled = starValue - i;
    if (filled >= 1) return "full";
    if (filled >= 0.5) return "half";
    return "empty";
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {types.map((type, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 16 16">
          {type === "half" && (
            <defs>
              <linearGradient id={`hg-${uid}-${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#111111" />
                <stop offset="50%" stopColor="#e0e0e0" />
              </linearGradient>
            </defs>
          )}
          <path
            d={STAR_PATH}
            fill={
              type === "full"
                ? "#111111"
                : type === "half"
                ? `url(#hg-${uid}-${i})`
                : "#e0e0e0"
            }
          />
        </svg>
      ))}
    </div>
  );
}

export default function ServiceDetailClient({
  service,
  reviews,
  avgScore,
  reviewCount,
  relatedArticles,
  userId,
  userReview,
}: Props) {
  const router = useRouter();
  const [score, setScore] = useState(userReview?.score ?? 7);
  const [goodPoints, setGoodPoints] = useState(userReview?.good_points ?? "");
  const [badPoints, setBadPoints] = useState(userReview?.bad_points ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasExistingReview = !!userReview;
  const scoreColor = score >= 8 ? "#111111" : score >= 5 ? "#555555" : "#999999";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    const supabase = createClient();
    const { error: err } = await supabase.from("service_reviews").upsert(
      {
        user_id: userId,
        service_id: service.id,
        score,
        good_points: goodPoints || null,
        bad_points: badPoints || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,service_id" }
    );
    setSubmitting(false);
    if (err) {
      setError("送信に失敗しました。もう一度お試しください。");
    } else {
      setSuccess(true);
      router.refresh();
    }
  }

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      {/* ① サービスヘッダー */}
      <div
        className="flex items-start gap-5 p-6 rounded-3xl mb-8"
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          borderRadius: "20px",
        }}
      >
        {/* ロゴ */}
        <div
          className="flex-shrink-0 flex items-center justify-center font-bold text-white overflow-hidden"
          style={{
            width: 64,
            height: 64,
            borderRadius: "16px",
            background: service.logo_url ? "#f5f5f7" : "#333333",
            fontSize: "1.5rem",
          }}
        >
          {service.logo_url ? (
            <Image
              src={getLogoSrc(service.logo_url)}
              alt={service.name}
              width={64}
              height={64}
              style={{ objectFit: "contain" }}
              unoptimized={false}
            />
          ) : (
            service.name[0]
          )}
        </div>

        {/* 情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#111111",
              }}
            >
              {service.name}
            </h1>
            {service.category && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#f0f0f0", color: "#666666" }}
              >
                {service.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <StarDisplay
              score={reviewCount > 0 ? avgScore : 0}
              uid="header"
              size={18}
            />
            {reviewCount > 0 ? (
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#111111",
                  letterSpacing: "-0.02em",
                }}
              >
                {avgScore.toFixed(1)}
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#86868b",
                    fontWeight: 400,
                  }}
                >
                  /10
                </span>
              </span>
            ) : (
              <span style={{ fontSize: "0.85rem", color: "#86868b" }}>
                まだ評価なし
              </span>
            )}
            <span style={{ fontSize: "0.85rem", color: "#86868b" }}>
              {reviewCount}件のレビュー
            </span>
          </div>
        </div>
      </div>

      {/* ② レビュー投稿フォーム（ログイン済みのみ） */}
      {userId ? (
        <section className="mb-8">
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#1d1d1f",
              marginBottom: "12px",
            }}
          >
            {hasExistingReview ? "レビューを更新する" : "レビューを書く"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 p-6"
            style={{
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              borderRadius: "20px",
            }}
          >
            {/* スコア */}
            <div>
              <div className="flex items-end justify-between mb-3">
                <label
                  className="text-sm font-semibold"
                  style={{ color: "#1d1d1f" }}
                >
                  総合スコア
                </label>
                <span
                  className="font-bold tabular-nums"
                  style={{
                    fontSize: "2.8rem",
                    lineHeight: 1,
                    color: scoreColor,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {score}
                  <span
                    className="text-base font-medium ml-0.5"
                    style={{ color: "#86868b" }}
                  >
                    /10
                  </span>
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={score}
                onChange={(e) => {
                  setScore(Number(e.target.value));
                  setSuccess(false);
                }}
                className="w-full"
                style={{ accentColor: "#111111", cursor: "pointer" }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: "#86868b" }}>
                  1（低い）
                </span>
                <span className="text-xs" style={{ color: "#86868b" }}>
                  10（高い）
                </span>
              </div>
            </div>

            {/* 良い点 */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#1d1d1f" }}
              >
                良い点
                <span
                  className="ml-1 font-normal text-xs"
                  style={{ color: "#86868b" }}
                >
                  （任意）
                </span>
              </label>
              <textarea
                value={goodPoints}
                onChange={(e) => {
                  setGoodPoints(e.target.value);
                  setSuccess(false);
                }}
                placeholder="良かった点を教えてください"
                rows={3}
                className="w-full text-sm resize-none outline-none"
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(0,0,0,0.12)",
                  background: "#f5f5f7",
                  color: "#1d1d1f",
                  lineHeight: 1.6,
                }}
              />
            </div>

            {/* 悪い点 */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#1d1d1f" }}
              >
                改善してほしい点
                <span
                  className="ml-1 font-normal text-xs"
                  style={{ color: "#86868b" }}
                >
                  （任意）
                </span>
              </label>
              <textarea
                value={badPoints}
                onChange={(e) => {
                  setBadPoints(e.target.value);
                  setSuccess(false);
                }}
                placeholder="改善してほしい点を教えてください"
                rows={3}
                className="w-full text-sm resize-none outline-none"
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(0,0,0,0.12)",
                  background: "#f5f5f7",
                  color: "#1d1d1f",
                  lineHeight: 1.6,
                }}
              />
            </div>

            {error && (
              <p
                className="text-sm text-center"
                style={{ color: "#c0392b" }}
              >
                {error}
              </p>
            )}
            {success && (
              <p
                className="text-sm text-center"
                style={{ color: "#27ae60" }}
              >
                レビューを{hasExistingReview ? "更新" : "投稿"}しました！
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full font-semibold text-sm transition-opacity"
              style={{
                background: "#111111",
                color: "#fff",
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting
                ? "送信中..."
                : hasExistingReview
                ? "レビューを更新する"
                : "レビューを送信"}
            </button>
          </form>
        </section>
      ) : (
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 px-6 py-5"
          style={{
            background: "#f5f5f7",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: "20px",
          }}
        >
          <div>
            <p
              className="font-semibold text-sm"
              style={{ color: "#1d1d1f" }}
            >
              ログインするとレビューを投稿できます
            </p>
            <p className="text-xs mt-1" style={{ color: "#86868b" }}>
              会員登録は無料です。
            </p>
          </div>
          <a
            href="/login"
            className="flex-shrink-0 text-sm font-semibold px-5 py-2.5 rounded-full"
            style={{ background: "#111111", color: "#fff" }}
          >
            ログイン / 新規登録
          </a>
        </div>
      )}

      {/* ③ ユーザーレビュー一覧 */}
      <section className="mb-8">
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#1d1d1f",
            marginBottom: "12px",
          }}
        >
          ユーザーレビュー
          {reviewCount > 0 && (
            <span
              className="ml-2 text-sm font-normal"
              style={{ color: "#86868b" }}
            >
              {reviewCount}件
            </span>
          )}
        </h2>
        <div
          className="overflow-hidden bg-white"
          style={{
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            borderRadius: "20px",
          }}
        >
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <p
                className="font-semibold text-sm mb-1"
                style={{ color: "#1d1d1f" }}
              >
                まだレビューがありません
              </p>
              <p
                className="text-xs"
                style={{ color: "#86868b", lineHeight: 1.7 }}
              >
                最初のレビューを投稿しましょう。
              </p>
            </div>
          ) : (
            reviews.map((review, i) => {
              const displayName =
                review.users?.display_name ?? "匿名ユーザー";
              const profileHref = `/u/${review.users?.username ?? review.user_id}`;
              const date = review.created_at.slice(0, 10);
              return (
                <div
                  key={`${review.user_id}-${i}`}
                  className="px-5 py-5"
                  style={{
                    borderBottom:
                      i < reviews.length - 1
                        ? "1px solid rgba(0,0,0,0.05)"
                        : "none",
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <Link
                        href={profileHref}
                        className="font-semibold text-sm hover:underline"
                        style={{ color: "#1d1d1f", textDecoration: "none" }}
                      >
                        {displayName}
                      </Link>
                      <span
                        className="ml-3 text-xs"
                        style={{ color: "#86868b" }}
                      >
                        {date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <StarDisplay
                        score={review.score}
                        uid={`review-${review.user_id}-${i}`}
                        size={14}
                      />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "#111111" }}
                      >
                        {review.score.toFixed(1)}
                        <span style={{ color: "#86868b" }}>/10</span>
                      </span>
                    </div>
                  </div>
                  {review.good_points && (
                    <div className="mt-2">
                      <span
                        className="text-xs font-semibold mr-1"
                        style={{ color: "#27ae60" }}
                      >
                        良い点:
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: "#333333", lineHeight: 1.7 }}
                      >
                        {review.good_points}
                      </span>
                    </div>
                  )}
                  {review.bad_points && (
                    <div className="mt-1">
                      <span
                        className="text-xs font-semibold mr-1"
                        style={{ color: "#c0392b" }}
                      >
                        改善点:
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: "#333333", lineHeight: 1.7 }}
                      >
                        {review.bad_points}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ④ 関連記事（あれば） */}
      {relatedArticles.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#1d1d1f",
              marginBottom: "12px",
            }}
          >
            関連記事
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {relatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
