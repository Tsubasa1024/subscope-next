"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  email: string;
  name: string;
  currentPlan: "free" | "standard" | "pro";
}

const PLAN_LABELS: Record<string, { name: string; price: string }> = {
  free:     { name: "Free",     price: "¥0" },
  standard: { name: "Standard", price: "¥580" },
  pro:      { name: "Pro",      price: "¥1,480" },
};

export default function MypageClient({ userId, email, name: initialName, currentPlan }: Props) {
  const router = useRouter();
  const [name, setName]             = useState(initialName);
  const [saving, setSaving]         = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [message, setMessage]       = useState<{ type: "success" | "error"; text: string } | null>(null);

  const palette = ["#111111","#333333","#555555","#777777","#444444","#666666","#888888","#999999"];
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (Math.imul(31, h) + userId.charCodeAt(i)) | 0;
  }
  const avatarColor = palette[Math.abs(h) % palette.length];
  const displayName = name || email.split("@")[0] || "ユーザー";
  const planInfo = PLAN_LABELS[currentPlan];

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

  async function handleCheckout(planType: "standard" | "pro") {
    setLoadingPlan(planType);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setMessage({ type: "error", text: data.error ?? "エラーが発生しました" });
        return;
      }

      window.location.href = data.url;
    } catch {
      setMessage({ type: "error", text: "ネットワークエラーが発生しました" });
    } finally {
      setLoadingPlan(null);
    }
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
                color: message.type === "error" ? "#c00" : "#111111",
                background: "#f5f5f5",
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
                <p style={{ fontWeight: 700, fontSize: "1rem" }}>{planInfo.name} プラン</p>
                <p style={{ fontSize: "0.8rem", color: "#86868b", marginTop: "2px" }}>{planInfo.price} / 月</p>
              </div>
              <span style={{
                padding: "4px 12px", borderRadius: "99px",
                background: "#f0f0f2", fontSize: "0.75rem", fontWeight: 600, color: "#86868b",
              }}>
                現在のプラン
              </span>
            </div>

            {/* アップグレードボタン */}
            {currentPlan === "free" && (
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={() => handleCheckout("standard")}
                  disabled={loadingPlan !== null}
                  style={{
                    width: "100%", padding: "13px", borderRadius: "12px",
                    background: "#111111", color: "#fff", border: "none",
                    fontWeight: 600, fontSize: "0.9rem", cursor: loadingPlan !== null ? "not-allowed" : "pointer",
                    opacity: loadingPlan !== null ? 0.6 : 1, fontFamily: "inherit",
                  }}
                >
                  {loadingPlan === "standard" ? "処理中…" : "Standardを始める — ¥580/月"}
                </button>
                <button
                  onClick={() => handleCheckout("pro")}
                  disabled={loadingPlan !== null}
                  style={{
                    width: "100%", padding: "13px", borderRadius: "12px",
                    background: "#fff", color: "#111", border: "1.5px solid #111",
                    fontWeight: 600, fontSize: "0.9rem", cursor: loadingPlan !== null ? "not-allowed" : "pointer",
                    opacity: loadingPlan !== null ? 0.6 : 1, fontFamily: "inherit",
                  }}
                >
                  {loadingPlan === "pro" ? "処理中…" : "Proを始める — ¥1,480/月"}
                </button>
              </div>
            )}
            {currentPlan === "standard" && (
              <div style={{ padding: "16px 20px" }}>
                <button
                  onClick={() => handleCheckout("pro")}
                  disabled={loadingPlan !== null}
                  style={{
                    width: "100%", padding: "13px", borderRadius: "12px",
                    background: "#111111", color: "#fff", border: "none",
                    fontWeight: 600, fontSize: "0.9rem", cursor: loadingPlan !== null ? "not-allowed" : "pointer",
                    opacity: loadingPlan !== null ? 0.6 : 1, fontFamily: "inherit",
                  }}
                >
                  {loadingPlan === "pro" ? "処理中…" : "Proにアップグレード — ¥1,480/月"}
                </button>
              </div>
            )}
            {currentPlan === "pro" && (
              <div style={{ padding: "14px 20px" }}>
                <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#86868b" }}>
                  最上位プランをご利用中です
                </p>
              </div>
            )}
          </div>

          {/* ログアウト */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%", padding: "15px", borderRadius: "14px",
              background: "transparent", color: "#111111",
              border: "1.5px solid rgba(0,0,0,0.2)", fontSize: "0.95rem",
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
