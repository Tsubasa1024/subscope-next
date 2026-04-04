import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

/**
 * 管理者ガード：未ログインはログインページへリダイレクト。
 * TODO: ロールチェック（admin ロールのみ許可）
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* サイドバー */}
      <aside
        style={{
          width: "240px",
          background: "#1d1d1f",
          color: "#fff",
          padding: "24px 0",
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "0 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Link href="/" style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff" }}>
            SUBSCOPE
          </Link>
          <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "4px", letterSpacing: "0.1em" }}>
            ADMIN
          </p>
        </div>
        <nav style={{ padding: "16px 0" }}>
          {[
            { href: "/admin", label: "ダッシュボード" },
            { href: "/admin/services", label: "サービス管理" },
            { href: "/admin/rankings", label: "ランキング管理" },
            { href: "/admin/users", label: "ユーザー管理" },
            { href: "/admin/diagnosis", label: "診断管理" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "block",
                padding: "10px 24px",
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.7)",
                transition: "color 0.15s",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main style={{ marginLeft: "240px", flex: 1, padding: "40px", background: "#f5f5f7", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
