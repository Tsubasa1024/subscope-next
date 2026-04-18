import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const display_name: string = (body.display_name ?? "").trim();
  const username: string     = (body.username ?? "").trim();

  if (!display_name || display_name.length > 30) {
    return NextResponse.json({ error: "ニックネームは1〜30文字で入力してください" }, { status: 400 });
  }
  if (!username || !USERNAME_RE.test(username) || username.length < 3 || username.length > 20) {
    return NextResponse.json({ error: "ユーザーネームは英数字・アンダースコアで3〜20文字にしてください" }, { status: 400 });
  }

  // 重複チェック（自分以外）
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "このユーザーネームは使用済みです" }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .upsert({
      id: user.id,
      email: user.email,
      display_name,
      username,
      username_changed_at: new Date().toISOString(),
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
