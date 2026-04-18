-- 緊急修正: service_reviews の SELECT ポリシー欠落を修復
--
-- 原因: 007 で DROP した後、CREATE POLICY が is_admin() 未定義エラーで失敗。
--       結果として service_reviews に SELECT ポリシーが存在しなくなり、
--       RLS が全件ブロックしていた（一般ユーザーには 0 件表示）。
--
-- 修正方針: 管理者は SUPABASE_SECRET_KEY（サービスロール）で RLS をバイパスするため、
--           ポリシーに is_admin() 条件は不要。deleted_at IS NULL のみで十分。

-- service_reviews: ポリシーを確実に再作成
DROP POLICY IF EXISTS "service_reviews_read" ON public.service_reviews;
DROP POLICY IF EXISTS "service_reviews_select_visible" ON public.service_reviews;

CREATE POLICY "service_reviews_select_visible"
ON public.service_reviews
FOR SELECT
USING (deleted_at IS NULL);

-- reviews: 同様に is_admin() なしで再作成
DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
DROP POLICY IF EXISTS "公開レビューは全員読み取り可" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_visible" ON public.reviews;

CREATE POLICY "reviews_select_visible"
ON public.reviews
FOR SELECT
USING (is_published = true AND deleted_at IS NULL);
