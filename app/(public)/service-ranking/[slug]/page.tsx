export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getArticlesByService } from "@/lib/microcms";
import type { Article } from "@/lib/utils";
import ServiceDetailClient from "./ServiceDetailClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("name")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return { title: "サービス詳細" };
  return {
    title: `${data.name} レビュー・評価`,
    description: `${data.name}のユーザーレビューと評価スコアを確認できます。`,
    alternates: { canonical: `https://www.subscope.jp/service-ranking/${slug}` },
  };
}

type ReviewRow = {
  user_id: string;
  score: number;
  good_points: string | null;
  bad_points: string | null;
  created_at: string;
  users: { display_name: string | null; username: string | null } | null;
};

type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  categories: { name: string } | null;
};

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // サービス取得
  const { data: serviceData } = await supabase
    .from("services")
    .select("id, name, slug, logo_url, categories(name)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!serviceData) notFound();

  const service = serviceData as unknown as ServiceRow;

  // レビュー取得（users をjoin）
  const { data: reviewRows } = await supabase
    .from("service_reviews")
    .select("user_id, score, good_points, bad_points, created_at, users(display_name, username)")
    .eq("service_id", service.id)
    .order("created_at", { ascending: false });

  const reviews = (reviewRows ?? []) as unknown as ReviewRow[];

  // 平均スコア・件数
  const reviewCount = reviews.length;
  const avgScore =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.score, 0) / reviewCount
      : 0;

  // ログインユーザーの既存レビュー
  const userReview = user ? (reviews.find((r) => r.user_id === user.id) ?? null) : null;

  // 関連記事
  let relatedArticles: Article[] = [];
  try {
    const result = await getArticlesByService(service.name);
    relatedArticles = result.contents;
  } catch {
    relatedArticles = [];
  }

  return (
    <main style={{ paddingTop: "96px" }}>
      <div className="container" style={{ paddingBottom: "var(--spacing-section)" }}>
        {/* 戻るリンク */}
        <div style={{ marginBottom: "24px" }}>
          <a
            href="/service-ranking"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
              color: "#86868b",
              textDecoration: "none",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11.5 7h-9M5 2.5L.5 7 5 11.5" />
            </svg>
            ランキングへ戻る
          </a>
        </div>

        <ServiceDetailClient
          service={{
            id: service.id,
            name: service.name,
            slug: service.slug,
            logo_url: service.logo_url,
            category: service.categories?.name ?? null,
          }}
          reviews={reviews}
          avgScore={avgScore}
          reviewCount={reviewCount}
          relatedArticles={relatedArticles}
          userId={user?.id ?? null}
          userReview={userReview}
        />
      </div>
    </main>
  );
}
