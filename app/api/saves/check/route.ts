import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SAVE_LIMITS, PHASE1_SAVE_LIMIT } from "@/lib/constants";

const TIERED_SAVES = process.env.NEXT_PUBLIC_FEATURE_TIERED_SAVES === "true";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Phase1: 一律3件上限
  let limit: number | null;
  if (!TIERED_SAVES) {
    limit = PHASE1_SAVE_LIMIT;
  } else {
    const { data: profile } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();
    const plan = profile?.plan ?? "free";
    limit = SAVE_LIMITS[plan] ?? PHASE1_SAVE_LIMIT;
  }

  const { count } = await supabase
    .from("article_saves")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const currentCount = count ?? 0;
  const canSave = limit === null || currentCount < limit;

  return NextResponse.json({ count: currentCount, limit, canSave });
}
