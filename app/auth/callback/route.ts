import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const createdAt = new Date(data.session.user.created_at);
      const isNewUser = Date.now() - createdAt.getTime() < 30_000; // 30秒以内なら新規登録

      if (isNewUser) {
        return NextResponse.redirect(`${origin}/welcome`);
      }
      const response = NextResponse.redirect(`${origin}/`);
      response.cookies.set("toast", "login_success", { maxAge: 10, path: "/" });
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
