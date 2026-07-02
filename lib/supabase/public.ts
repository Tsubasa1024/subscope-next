import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * cookie に依存しない匿名（publishable key）クライアント。
 * 閲覧数・いいね数・ランキングなど公開集計データの取得専用。
 * cookies() を呼ばないため ISR（静的レンダリング）ページから安全に使える。
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
