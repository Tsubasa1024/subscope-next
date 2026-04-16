import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SAVE_LIMITS } from "@/lib/constants";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan ?? "free";
  const limit = SAVE_LIMITS[plan] ?? 3;

  const { count } = await supabase
    .from("article_saves")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const currentCount = count ?? 0;
  const canSave = limit === null || currentCount < limit;

  return NextResponse.json({ count: currentCount, limit, canSave });
}
