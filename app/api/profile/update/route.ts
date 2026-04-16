import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateUsername, canChangeUsername } from "@/lib/profile-validation";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { username?: string; bio?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  // ── username 更新 ────────────────────────────────────────
  if (body.username !== undefined) {
    const username = body.username.trim();

    // 文字種・長さ・予約語・NGワード
    const validation = validateUsername(username);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    // 月1回制限
    const { data: current } = await supabase
      .from("users")
      .select("username, username_changed_at")
      .eq("id", user.id)
      .single();

    const { canChange, nextChangeAt } = canChangeUsername(
      current?.username_changed_at ?? null
    );
    if (!canChange) {
      return NextResponse.json(
        {
          error: "ユーザー名の変更は月1回までです",
          nextChangeAt,
        },
        { status: 422 }
      );
    }

    // 重複チェック（自分以外）
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .ilike("username", username)
      .neq("id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "このユーザー名は既に使われています" },
        { status: 409 }
      );
    }

    updates.username = username;
    updates.username_changed_at = new Date().toISOString();
  }

  // ── bio 更新 ─────────────────────────────────────────────
  if (body.bio !== undefined) {
    const bio = body.bio.trim();
    if (bio.length > 200) {
      return NextResponse.json(
        { error: "自己紹介は200文字以内で入力してください" },
        { status: 422 }
      );
    }
    updates.bio = bio || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "更新するフィールドがありません" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id);

  if (updateError) {
    if (updateError.code === "23505") {
      return NextResponse.json(
        { error: "このユーザー名は既に使われています" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, updates });
}
