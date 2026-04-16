import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateUsername } from "@/lib/profile-validation";

// GET /api/profile/check-username?username=xxx[&excludeId=uuid]
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username") ?? "";
  const excludeId = req.nextUrl.searchParams.get("excludeId") ?? null;

  if (!username) {
    return NextResponse.json({ available: false, error: "username is required" }, { status: 400 });
  }

  // バリデーション
  const validation = validateUsername(username);
  if (!validation.ok) {
    return NextResponse.json({ available: false, error: validation.error });
  }

  // 重複チェック
  const supabase = await createClient();
  let query = supabase
    .from("users")
    .select("id")
    .ilike("username", username.trim());

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data } = await query.maybeSingle();

  if (data) {
    return NextResponse.json({ available: false, error: "このユーザー名は既に使われています" });
  }

  return NextResponse.json({ available: true });
}
