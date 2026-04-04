import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          ダッシュボード
        </h1>
        <p style={{ color: "#86868b", marginTop: "4px", fontSize: "0.875rem" }}>
          ログイン中: {user?.email}
        </p>
      </div>

      {/* KPIカード */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        {[
          { label: "総ユーザー数",     value: "—",  color: "#5B8DEF" },
          { label: "登録サービス数",   value: "—",  color: "#4CAF82" },
          { label: "総レビュー数",     value: "—",  color: "#E8A23A" },
          { label: "今月の新規登録",   value: "—",  color: "#9B72CF" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              borderLeft: `4px solid ${color}`,
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "#86868b", marginBottom: "8px" }}>{label}</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* クイックリンク */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ fontWeight: 700, marginBottom: "16px", fontSize: "1rem" }}>クイックアクセス</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { label: "サービスを追加する",     href: "/admin/services/new" },
            { label: "ランキングを更新する",   href: "/admin/rankings" },
            { label: "診断を管理する",         href: "/admin/diagnosis" },
            { label: "ユーザーを管理する",     href: "/admin/users" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              style={{
                display: "block",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "#f5f5f7",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#1d1d1f",
              }}
            >
              {label} →
            </a>
          ))}
        </div>
      </div>

      {/* DBスキーマ概要 */}
      <div
        style={{
          marginTop: "24px",
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ fontWeight: 700, marginBottom: "16px", fontSize: "1rem" }}>DBスキーマ（17テーブル）</h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {[
            "users", "categories", "services", "plans", "tags",
            "service_tags", "reviews", "favorites", "comparisons",
            "rankings", "diagnosis_questions", "diagnosis_options",
            "diagnosis_results", "article_likes", "article_saves",
            "user_subscriptions",
          ].map((table) => (
            <span
              key={table}
              style={{
                padding: "4px 12px",
                borderRadius: "8px",
                background: "#f0f0f2",
                fontSize: "0.78rem",
                fontFamily: "monospace",
                color: "#1d1d1f",
              }}
            >
              {table}
            </span>
          ))}
        </div>
        <p style={{ fontSize: "0.8rem", color: "#86868b", marginTop: "16px" }}>
          Supabase ダッシュボードでスキーマを確認・管理してください。
        </p>
      </div>
    </div>
  );
}
