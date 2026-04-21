import type { Metadata } from "next";
import { getArticles } from "@/lib/microcms";
import { createClient } from "@/lib/supabase/server";
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
  // ログインチェック UI非表示のため無効化 — ロジックは保持
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();

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
