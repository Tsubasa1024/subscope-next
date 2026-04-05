// ============================================================
// SUBSCOPE — Supabase Database 型定義
// 001_init.sql と同期して手動メンテナンス。
// 本番では: npx supabase gen types typescript --project-id ... で自動生成に切り替え可
// ============================================================

export type Plan = "free" | "standard" | "pro";
export type BillingCycle = "monthly" | "yearly" | "once";
export type RankingPeriod = "all" | "weekly" | "monthly";

// ============================================================
// テーブル行型
// ============================================================

export interface DbUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  plan_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface DbService {
  id: string;
  category_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  affiliate_url: string | null;
  avg_rating: number;
  review_count: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // JOIN 用
  category?: DbCategory;
  plans?: DbPlan[];
  tags?: DbTag[];
}

export interface DbPlan {
  id: string;
  service_id: string;
  name: string;
  price: number;
  billing_cycle: BillingCycle;
  features: string[] | null;
  is_popular: boolean;
  created_at: string;
}

export interface DbTag {
  id: number;
  name: string;
  slug: string;
}

export interface DbServiceTag {
  service_id: string;
  tag_id: number;
}

export interface DbReview {
  id: string;
  service_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  pros: string | null;
  cons: string | null;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  // JOIN 用
  user?: DbUser;
}

export interface DbFavorite {
  id: string;
  user_id: string;
  service_id: string;
  created_at: string;
  // JOIN 用
  service?: DbService;
}

export interface DbComparison {
  id: string;
  user_id: string;
  service_id: string;
  sort_order: number;
  created_at: string;
  // JOIN 用
  service?: DbService;
}

export interface DbRanking {
  id: string;
  period: RankingPeriod;
  service_id: string;
  rank: number;
  score: number;
  created_at: string;
  // JOIN 用
  service?: DbService;
}

export interface DbDiagnosisQuestion {
  id: number;
  diagnosis: string;
  question: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  // JOIN 用
  options?: DbDiagnosisOption[];
}

export interface DbDiagnosisOption {
  id: number;
  question_id: number;
  label: string;
  value: string;
  sort_order: number;
}

export interface DbDiagnosisResult {
  id: number;
  diagnosis: string;
  service_id: string;
  match_score: number;
  conditions: Record<string, string[]> | null;
  created_at: string;
}

export interface DbArticleLike {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface DbArticleSave {
  id: string;
  user_id: string;
  article_id: string;
  title: string | null;
  image_url: string | null;
  created_at: string;
}

export interface DbArticleComment {
  id: string;
  user_id: string;
  article_id: string;
  content: string;
  created_at: string;
  // JOIN 用
  users?: { display_name: string | null };
}

export interface DbUserSubscription {
  id: string;
  user_id: string;
  service_id: string;
  plan_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  is_active: boolean;
  memo: string | null;
  created_at: string;
  // JOIN 用
  service?: DbService;
  plan?: DbPlan;
}

// ============================================================
// Supabase クライアント用ジェネリック DB 型
// ============================================================
export type Database = {
  public: {
    Tables: {
      users:                { Row: DbUser;                 Insert: Partial<DbUser> & { id: string };                 Update: Partial<DbUser> };
      categories:           { Row: DbCategory;             Insert: Omit<DbCategory, "id" | "created_at">;           Update: Partial<DbCategory> };
      services:             { Row: DbService;              Insert: Omit<DbService, "id" | "created_at" | "updated_at">; Update: Partial<DbService> };
      plans:                { Row: DbPlan;                 Insert: Omit<DbPlan, "id" | "created_at">;                Update: Partial<DbPlan> };
      tags:                 { Row: DbTag;                  Insert: Omit<DbTag, "id">;                                Update: Partial<DbTag> };
      service_tags:         { Row: DbServiceTag;           Insert: DbServiceTag;                                     Update: Partial<DbServiceTag> };
      reviews:              { Row: DbReview;               Insert: Omit<DbReview, "id" | "created_at" | "updated_at">; Update: Partial<DbReview> };
      favorites:            { Row: DbFavorite;             Insert: Omit<DbFavorite, "id" | "created_at">;            Update: Partial<DbFavorite> };
      comparisons:          { Row: DbComparison;           Insert: Omit<DbComparison, "id" | "created_at">;          Update: Partial<DbComparison> };
      rankings:             { Row: DbRanking;              Insert: Omit<DbRanking, "id" | "created_at">;             Update: Partial<DbRanking> };
      diagnosis_questions:  { Row: DbDiagnosisQuestion;   Insert: Omit<DbDiagnosisQuestion, "id" | "created_at">;  Update: Partial<DbDiagnosisQuestion> };
      diagnosis_options:    { Row: DbDiagnosisOption;     Insert: Omit<DbDiagnosisOption, "id">;                   Update: Partial<DbDiagnosisOption> };
      diagnosis_results:    { Row: DbDiagnosisResult;     Insert: Omit<DbDiagnosisResult, "id" | "created_at">;    Update: Partial<DbDiagnosisResult> };
      article_likes:        { Row: DbArticleLike;         Insert: Omit<DbArticleLike, "id" | "created_at">;        Update: Partial<DbArticleLike> };
      article_saves:        { Row: DbArticleSave;         Insert: Omit<DbArticleSave, "id" | "created_at">;        Update: Partial<DbArticleSave> };
      article_comments:     { Row: DbArticleComment;      Insert: Omit<DbArticleComment, "id" | "created_at" | "users">; Update: Partial<DbArticleComment> };
      user_subscriptions:   { Row: DbUserSubscription;    Insert: Omit<DbUserSubscription, "id" | "created_at">;   Update: Partial<DbUserSubscription> };
    };
  };
};
