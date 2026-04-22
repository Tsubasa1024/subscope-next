import { createClient } from "./supabase/server";

export type ViewCounts = Record<string, number>;

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

export async function fetchAllViewCounts(): Promise<ViewCounts> {
  return fetchViewCounts();
}

export async function fetchWeeklyViewCounts(): Promise<ViewCounts> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return fetchViewCounts(since);
}
