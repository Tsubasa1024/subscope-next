export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ServiceRankingClient, { type ServiceWithStats, type ServiceNoReview } from "./ServiceRankingClient";

export const metadata: Metadata = {
  title: "サブスクランキング",
  description:
    "ユーザーの評価スコアをもとにサブスクリプションサービスをランキング形式で紹介。レビューを投稿してランキングを育てよう。",
  alternates: { canonical: "https://www.subscope.jp/service-ranking" },
};

export default async function ServiceRankingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // service_reviews を全件取得
  const { data: reviewRows } = await supabase
    .from("service_reviews")
    .select("service_id, score");

  // services を全件取得（categories と join）
  const { data: serviceRows } = await supabase
    .from("services")
    .select("id, name, slug, logo_url, category_id, categories(name)")
    .eq("is_active", true);

  // サービスIDごとに集計
  type ReviewRow = { service_id: string; score: number };
  const statsMap: Record<string, { total: number; count: number }> = {};
  for (const row of (reviewRows ?? []) as ReviewRow[]) {
    if (!statsMap[row.service_id]) {
      statsMap[row.service_id] = { total: 0, count: 0 };
    }
    statsMap[row.service_id].total += row.score;
    statsMap[row.service_id].count += 1;
  }

  type ServiceRow = {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    category_id: number | null;
    categories: { name: string } | null;
  };

  const allServices = (serviceRows ?? []) as unknown as ServiceRow[];

  // レビューあり → スコア降順
  const rankedServices: ServiceWithStats[] = allServices
    .filter((s) => statsMap[s.id])
    .map((s) => {
      const stats = statsMap[s.id];
      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        logo_url: s.logo_url,
        category: s.categories?.name ?? null,
        avgScore: stats.total / stats.count,
        reviewCount: stats.count,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore || b.reviewCount - a.reviewCount);

  // レビューなし
  const unreviewedServices: ServiceNoReview[] = allServices
    .filter((s) => !statsMap[s.id])
    .map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      logo_url: s.logo_url,
      category: s.categories?.name ?? null,
    }));

  return (
    <main style={{ paddingTop: "96px" }}>
      <div className="container" style={{ paddingBottom: "var(--spacing-section)" }}>

        {/* 未ログイン時バナー */}
        {!user && (
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 px-6 py-5 rounded-2xl"
            style={{ background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.06)" }}
          >
            <div>
              <p className="font-semibold text-sm" style={{ color: "#1d1d1f" }}>
                ログインするとレビューを投稿できます
              </p>
              <p className="text-xs mt-1" style={{ color: "#86868b" }}>
                会員登録は無料です。レビューでランキングを育てましょう。
              </p>
            </div>
            <a
              href="/login"
              className="flex-shrink-0 text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
              style={{ background: "#111111", color: "#fff" }}
            >
              ログイン / 新規登録
            </a>
          </div>
        )}

        <ServiceRankingClient
          rankedServices={rankedServices}
          unreviewedServices={unreviewedServices}
          userId={user?.id ?? null}
        />
      </div>
    </main>
  );
}
