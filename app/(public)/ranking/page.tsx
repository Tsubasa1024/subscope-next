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

type ViewCounts = Record<string, number>;

async function fetchViewCounts(since?: Date): Promise<ViewCounts> {
  const supabase = await createClient();
  let query = supabase.from("article_views" as never).select("article_id");
  if (since) {
    query = (query as ReturnType<typeof query.gte>).gte("viewed_at", since.toISOString());
  }
  const { data } = await query;
  const counts: ViewCounts = {};
  for (const row of (data ?? []) as { article_id: string }[]) {
    counts[row.article_id] = (counts[row.article_id] ?? 0) + 1;
  }
  return counts;
}

export default async function RankingPage() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [articles, allCounts, weeklyCounts, monthlyCounts] = await Promise.all([
    getArticles(50).catch(() => []),
    fetchViewCounts(),
    fetchViewCounts(weekAgo),
    fetchViewCounts(monthAgo),
  ]);

  const viewCounts = { all: allCounts, weekly: weeklyCounts, monthly: monthlyCounts };

  return <RankingClient articles={articles} viewCounts={viewCounts} />;
}
