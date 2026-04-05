"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "./actions";

// ============================================================
// プランデータ
// ============================================================
const PLANS = [
  {
    name: "Free",
    price: "¥0",
    period: "",
    color: "#666666",
    bg: "#f5f5f5",
    border: "#e5e5e5",
    features: ["お気に入り 3件", "記事 冒頭のみ", "比較 2件まで"],
  },
  {
    name: "Standard",
    price: "¥580",
    period: "/月",
    color: "#111111",
    bg: "#f5f5f5",
    border: "#333333",
    badge: "人気",
    features: ["お気に入り 20件", "全記事 読み放題", "比較 3件・広告非表示"],
  },
  {
    name: "Pro",
    price: "¥1,480",
    period: "/月",
    color: "#111111",
    bg: "#f5f5f5",
    border: "#e5e5e5",
    features: ["全機能 無制限", "比較 5件・API利用", "データエクスポート"],
  },
];

// ============================================================
// Page
// ============================================================
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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f5f5f7" }}
    >
      {/* ヘッダー */}
      <header
        className="text-center py-4"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Link href="/" style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#1d1d1f" }}>
          SUBSCOPE
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-6 items-start">

          {/* ===== LEFT: プラン案内 ===== */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="mb-5">
              <h2 className="font-bold text-lg" style={{ letterSpacing: "-0.02em" }}>
                プランを選んでスタート
              </h2>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                まずは無料で始められます。いつでもアップグレード可能。
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className="rounded-2xl p-4"
                  style={{ background: plan.bg, border: `1.5px solid ${plan.border}` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: plan.color }}>
                        {plan.name}
                      </span>
                      {"badge" in plan && plan.badge && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: plan.color }}
                        >
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <span className="font-bold" style={{ color: plan.color }}>
                      {plan.price}
                      <span className="text-xs font-normal" style={{ color: "#6b7280" }}>
                        {plan.period}
                      </span>
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs" style={{ color: "#374151" }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm transition-all hover:opacity-90"
              style={{
                background: "#111111",
                color: "#fff",
              }}
            >
              まずは無料で始める →
            </Link>
          </div>

          {/* ===== RIGHT: ログインフォーム ===== */}
          <div
            className="flex-1 w-full"
            style={{
              background: "#fff",
              borderRadius: "28px",
              padding: "36px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.07)",
            }}
          >
            <h1
              className="font-bold text-center mb-2"
              style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}
            >
              ログイン
            </h1>
            <p className="text-sm text-center mb-7" style={{ color: "#86868b" }}>
              アカウントにログインしてください
            </p>

            {error && (
              <div
                className="text-sm p-3 rounded-xl mb-4"
                style={{ background: "#fff0f0", color: "#c0392b" }}
              >
                {error}
              </div>
            )}

            <form action={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">メールアドレス</label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="example@mail.com"
                  className="w-full text-sm outline-none"
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(0,0,0,0.1)",
                    background: "#fafafa",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold">パスワード</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs hover:opacity-70 transition-opacity"
                    style={{ color: "#111111" }}
                  >
                    パスワードを忘れた方
                  </Link>
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="パスワードを入力"
                  className="w-full text-sm outline-none"
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(0,0,0,0.1)",
                    background: "#fafafa",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: loading ? "#9ca3af" : "#1d1d1f",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {loading ? "ログイン中..." : "ログイン"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: "#86868b" }}>
                アカウントをお持ちでない方は{" "}
                <Link href="/signup" className="font-semibold underline" style={{ color: "#1d1d1f" }}>
                  新規登録
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-5 text-center text-xs" style={{ color: "#86868b" }}>
        <Link href="/privacy">プライバシーポリシー</Link>
        {" · "}
        <Link href="/terms">利用規約</Link>
      </footer>
    </div>
  );
}
