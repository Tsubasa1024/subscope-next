"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "./actions";
import { createClient } from "@/lib/supabase/client";

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function LoginPage() {
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback` },
    });
  }

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

          {/* 区切り線 */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
            <span style={{ fontSize: "0.8rem", color: "#86868b", whiteSpace: "nowrap" }}>または</span>
            <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
          </div>

          {/* Google ログイン */}
          <button
            type="button"
            onClick={handleGoogle}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: "10px",
              border: "1px solid #e0e0e0", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              color: "#333",
            }}
          >
            <GoogleLogo />
            Googleでログイン
          </button>

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
