"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  email: string;
  name: string;
}

export default function MypageClient({ userId, email, name: initialName }: Props) {
  const router = useRouter();
  const [name, setName]       = useState(initialName);
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // アバターカラー（uid ベース）
  const palette = ["#5B8DEF","#E8685A","#4CAF82","#9B72CF","#E8A23A","#4CB8C4","#E86891","#7CB56C"];
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (Math.imul(31, h) + userId.charCodeAt(i)) | 0;
  }
  const avatarColor = palette[Math.abs(h) % palette.length];
  const displayName = name || email.split("@")[0] || "ユーザー";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: "error", text: "ニックネームを入力してください" });
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });
    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "プロフィールを更新しました" });
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>
      <main style={{ display: "flex", justifyContent: "center", padding: "40px 16px 60px" }}>
        <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* アバターカード */}
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#86868b", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 4px" }}>
            プロフィール
          </p>
          <div style={{
            background: "#fff", borderRadius: "20px", padding: "32px 24px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
          }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: avatarColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", fontWeight: 700, color: "#fff",
            }}>
              {displayName[0]?.toUpperCase()}
            </div>
            <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>{displayName}</p>
            <p style={{ fontSize: "0.85rem", color: "#86868b" }}>{email}</p>
          </div>

          {/* アカウント情報フォーム */}
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#86868b", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 4px" }}>
            アカウント情報
          </p>
          <form
            onSubmit={handleSave}
            style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}
          >
            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "12px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: "90px" }}>ニックネーム</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                autoComplete="nickname"
                style={{ flex: 1, fontSize: "0.9rem", border: "none", outline: "none", background: "transparent" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "12px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: "90px" }}>メール</span>
              <span style={{ flex: 1, fontSize: "0.9rem", color: "#86868b" }}>{email}</span>
            </div>

            {message && (
              <div style={{
                padding: "12px 20px", fontSize: "0.875rem",
                color: message.type === "error" ? "#c0392b" : "#0f6e56",
                background: message.type === "error" ? "#fff0f0" : "#f0faf5",
              }}>
                {message.text}
              </div>
            )}

            <div style={{ padding: "16px 20px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%", padding: "15px", borderRadius: "14px", background: "#1d1d1f",
                  color: "#fff", border: "none", fontSize: "0.95rem", fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.45 : 1,
                  fontFamily: "inherit",
                }}
              >
                {saving ? "保存中..." : "変更を保存"}
              </button>
            </div>
          </form>

          {/* プランセクション */}
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#86868b", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 4px" }}>
            ご利用プラン
          </p>
          <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "1rem" }}>Free プラン</p>
                <p style={{ fontSize: "0.8rem", color: "#86868b", marginTop: "2px" }}>¥0 / 月</p>
              </div>
              <span style={{
                padding: "4px 12px", borderRadius: "99px",
                background: "#f0f0f2", fontSize: "0.75rem", fontWeight: 600, color: "#86868b",
              }}>
                現在のプラン
              </span>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <Link
                href="/pricing"
                style={{
                  display: "block", textAlign: "center", padding: "13px",
                  borderRadius: "12px", background: "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "#fff", fontWeight: 600, fontSize: "0.9rem",
                }}
              >
                プランをアップグレード
              </Link>
            </div>
          </div>

          {/* ログアウト */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%", padding: "15px", borderRadius: "14px",
              background: "transparent", color: "#c0392b",
              border: "1.5px solid rgba(192,57,43,0.25)", fontSize: "0.95rem",
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            ログアウト
          </button>
        </div>
      </main>

      <footer style={{ padding: "24px", textAlign: "center", fontSize: "0.8rem", color: "#86868b" }}>
        <Link href="/privacy">プライバシーポリシー</Link>
        {" · "}
        <Link href="/terms">利用規約</Link>
      </footer>
    </div>
  );
}
