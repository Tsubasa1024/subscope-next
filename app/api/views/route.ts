import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { article_id } = await req.json().catch(() => ({}));

  if (!article_id || typeof article_id !== "string") {
    return NextResponse.json({ error: "invalid article_id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("article_views" as never)
    .insert({ article_id });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
