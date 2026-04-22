import { createClient } from "./supabase/server";

export type ViewCounts = Record<string, number>;

export async function fetchAllViewCounts(): Promise<ViewCounts> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("article_views" as never)
    .select("article_id");
  const counts: ViewCounts = {};
  for (const row of (data ?? []) as { article_id: string }[]) {
    counts[row.article_id] = (counts[row.article_id] ?? 0) + 1;
  }
  return counts;
}
