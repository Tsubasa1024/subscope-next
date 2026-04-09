export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import MypageClient from "./MypageClient";

export default async function MypagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // layout の認証ガードで user は必ず存在するが型安全のため確認
  if (!user) return null;

  const [{ data: profile }, { data: savedArticles }] = await Promise.all([
    supabase.from("users").select("plan").eq("id", user.id).single(),
    supabase
      .from("article_saves")
      .select("user_id, article_id, title, image_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <MypageClient
      userId={user.id}
      email={user.email ?? ""}
      name={user.user_metadata?.full_name ?? ""}
      currentPlan={(profile?.plan ?? "free") as "free" | "standard" | "pro"}
      savedArticles={savedArticles ?? []}
    />
  );
}
