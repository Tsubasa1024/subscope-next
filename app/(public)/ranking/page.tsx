import type { Metadata } from "next";
import { getArticles } from "@/lib/microcms";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import RankingClient from "./RankingClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ランキング",
  description:
    "SUBSCOPEで人気の記事をランキング形式でまとめるページ。迷ったらまずここから。",
  alternates: { canonical: "https://www.subscope.jp/ranking" },
};

type Counts = Record<string, number>;

async function fetchViewCounts(since?: Date): Promise<Counts> {
  const supabase = await createClient();
  let query = supabase.from("article_views" as never).select("article_id");
  if (since) {
    query = (query as ReturnType<typeof query.gte>).gte("viewed_at", since.toISOString());
  }
  const { data } = await query;
  const counts: Counts = {};
  for (const row of (data ?? []) as { article_id: string }[]) {
    counts[row.article_id] = (counts[row.article_id] ?? 0) + 1;
  }
  return counts;
}

async function fetchLikeCounts(): Promise<Counts> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("article_likes")
    .select("article_id");
  const counts: Counts = {};
  for (const row of (data ?? [])) {
    counts[row.article_id] = (counts[row.article_id] ?? 0) + 1;
  }
  return counts;
}

export default async function RankingPage() {
  // セッションチェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main style={{ paddingTop: "96px" }}>
        <div className="container">
          <section style={{ paddingBottom: "40px" }}>
            <p style={{ fontSize: "0.85rem", color: "#86868b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Ranking
            </p>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 700, letterSpacing: "-0.03em", marginTop: "10px" }}>
              ランキング
            </h1>
          </section>
          <div
            className="flex flex-col items-center justify-center text-center rounded-3xl"
            style={{ padding: "80px 24px", background: "#f5f5f7", border: "1px solid #e5e5ea" }}
          >
            <div
              className="flex items-center justify-center rounded-full mb-6"
              style={{ width: "72px", height: "72px", background: "#111", color: "#fff", fontSize: "2rem" }}
            >
              🏆
            </div>
            <h2 className="font-bold mb-3" style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
              ランキングの閲覧にはログインが必要です
            </h2>
            <p className="text-sm mb-8" style={{ color: "#86868b", maxWidth: "340px" }}>
              会員登録（無料）またはログインすると、人気記事ランキングを閲覧できます。
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="flex items-center justify-center px-8 py-3 rounded-full font-semibold text-sm"
                style={{ background: "#111", color: "#fff" }}
              >
                ログインする
              </Link>
              <Link
                href="/signup"
                className="flex items-center justify-center px-8 py-3 rounded-full font-semibold text-sm"
                style={{ background: "#fff", color: "#111", border: "1.5px solid #d1d5db" }}
              >
                無料で会員登録
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [articles, allCounts, weeklyCounts, monthlyCounts, likeCounts] = await Promise.all([
    getArticles(50).catch(() => []),
    fetchViewCounts(),
    fetchViewCounts(weekAgo),
    fetchViewCounts(monthAgo),
    fetchLikeCounts().catch(() => ({})),
  ]);

  const viewCounts = { all: allCounts, weekly: weeklyCounts, monthly: monthlyCounts };

  return <RankingClient articles={articles} viewCounts={viewCounts} likeCounts={likeCounts} />;
}
