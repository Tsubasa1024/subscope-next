import type { Metadata } from "next";
import { getArticles } from "@/lib/microcms";
import { createClient } from "@/lib/supabase/server";
import RankingClient from "./RankingClient";
import { fetchAllViewCounts, fetchWeeklyViewCounts, fetchMonthlyViewCounts } from "@/lib/viewCounts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ランキング",
  description:
    "SUBSCOPEで人気の記事をランキング形式でまとめるページ。迷ったらまずここから。",
  alternates: { canonical: "https://www.subscope.jp/ranking" },
};

type Counts = Record<string, number>;

async function fetchLikeCounts(): Promise<Counts> {
  const supabase = await createClient();
  const { data } = await supabase.from("article_likes").select("article_id");
  const counts: Counts = {};
  for (const row of (data ?? [])) {
    counts[row.article_id] = (counts[row.article_id] ?? 0) + 1;
  }
  return counts;
}

export default async function RankingPage() {
  const [articles, allCounts, weeklyCounts, monthlyCounts, likeCounts] = await Promise.all([
    getArticles(50).catch(() => []),
    fetchAllViewCounts().catch(() => ({})),
    fetchWeeklyViewCounts().catch(() => ({})),
    fetchMonthlyViewCounts().catch(() => ({})),
    fetchLikeCounts().catch(() => ({})),
  ]);

  const viewCounts = { all: allCounts, weekly: weeklyCounts, monthly: monthlyCounts };

  return <RankingClient articles={articles} viewCounts={viewCounts} likeCounts={likeCounts} />;
}
