-- Phase 6: ソフトデリート対応 RLS ポリシー更新
-- deleted_at が設定されたコンテンツを一般ユーザーから非表示にする。
-- 管理者は SUPABASE_SECRET_KEY（サービスロール）で RLS をバイパスするため、
-- ポリシー側に is_admin() 条件は不要。
--
-- 注意: Supabase 本番環境には手動で適用済み。
--       本ファイルは別環境構築時の再現用として記録する。

-- ============================================
-- reviews: 既存の公開ポリシーを削除して作り直し
-- 公開済み かつ 未削除 なら全員閲覧可
-- 「自分のレビューは下書きも読める」ポリシーは別途存在するため削除しない
-- ============================================
DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
DROP POLICY IF EXISTS "公開レビューは全員読み取り可" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_visible" ON public.reviews;

CREATE POLICY "reviews_select_visible"
ON public.reviews
FOR SELECT
USING (is_published = true AND deleted_at IS NULL);

-- ============================================
-- service_reviews: 既存ポリシーを削除して作り直し
-- service_reviews には is_published 列がないため deleted_at のみで判定
-- ============================================
DROP POLICY IF EXISTS "service_reviews_read" ON public.service_reviews;
DROP POLICY IF EXISTS "service_reviews_select_visible" ON public.service_reviews;

CREATE POLICY "service_reviews_select_visible"
ON public.service_reviews
FOR SELECT
USING (deleted_at IS NULL);
