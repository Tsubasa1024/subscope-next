"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "./actions";

export default function LoginPage() {
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f5f5f7" }}>
      <header style={{
        textAlign: "center", padding: "16px",
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <Link href="/" style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#1d1d1f", textDecoration: "none" }}>
          SUBSCOPE
        </Link>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{
          width: "100%", maxWidth: "400px",
          background: "#fff", borderRadius: "20px",
          padding: "40px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, textAlign: "center", marginBottom: "28px", letterSpacing: "-0.03em" }}>
            ログイン
          </h1>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#fff0f0", color: "#ff3b30", fontSize: "0.85rem", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <form action={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                メールアドレス
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="example@mail.com"
                style={{
                  width: "100%", padding: "12px 14px", border: "1px solid #e0e0e0",
                  borderRadius: "10px", fontSize: "0.9rem", outline: "none",
                  boxSizing: "border-box", background: "#fafafa",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#111")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>パスワード</label>
                <Link href="/reset-password" style={{ fontSize: "0.78rem", color: "#86868b", textDecoration: "none" }}>
                  パスワードを忘れた方
                </Link>
              </div>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="パスワードを入力"
                style={{
                  width: "100%", padding: "12px 14px", border: "1px solid #e0e0e0",
                  borderRadius: "10px", fontSize: "0.9rem", outline: "none",
                  boxSizing: "border-box", background: "#fafafa",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#111")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: "10px",
                background: loading ? "#999" : "#111111", color: "#fff",
                border: "none", fontSize: "0.95rem", fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
                marginTop: "4px",
              }}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <p style={{ fontSize: "0.85rem", textAlign: "center", marginTop: "24px", color: "#86868b" }}>
            アカウントをお持ちでない方は{" "}
            <Link href="/signup" style={{ color: "#111", fontWeight: 600, textDecoration: "underline" }}>
              新規登録
            </Link>
          </p>
        </div>
      </main>

      <footer style={{ padding: "20px", textAlign: "center", fontSize: "0.8rem", color: "#86868b" }}>
        <Link href="/privacy" style={{ color: "inherit" }}>プライバシーポリシー</Link>
        {" · "}
        <Link href="/terms" style={{ color: "inherit" }}>利用規約</Link>
      </footer>
    </div>
  );
}
