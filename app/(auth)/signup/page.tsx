"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "./actions";

// ============================================================
// プランデータ（login と共通）
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
export default function SignupPage() {
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (!formData.get("agreed")) {
      setError("利用規約に同意してください");
      setLoading(false);
      return;
    }

    const result = await signup(formData);
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
                登録後すぐ使える
              </h2>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                無料プランで今すぐスタート。後からいつでもアップグレード可能です。
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
                      {plan.badge && (
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

            {/* 「まずは無料で始める」強調CTA（登録ページでは「ログイン」リンクに） */}
            <p className="mt-4 text-center text-sm" style={{ color: "#6b7280" }}>
              すでにアカウントをお持ちの方は{" "}
              <Link href="/login" className="font-semibold underline" style={{ color: "#1d1d1f" }}>
                ログイン
              </Link>
            </p>
          </div>

          {/* ===== RIGHT: 登録フォーム ===== */}
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
              無料で始める
            </h1>
            <p className="text-sm text-center mb-7" style={{ color: "#86868b" }}>
              登録すると、お気に入り・比較・診断が使えます
            </p>

            {error && (
              <div
                className="text-sm p-3 rounded-xl mb-4"
                style={{ background: "#fff0f0", color: "#c0392b" }}
              >
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">ニックネーム</label>
                <input
                  name="name"
                  type="text"
                  required
                  maxLength={30}
                  autoComplete="nickname"
                  placeholder="ニックネームを入力"
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
                <label className="block text-sm font-semibold mb-1.5">パスワード</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="8文字以上"
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

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreed"
                  name="agreed"
                  value="1"
                  className="mt-0.5 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="agreed" className="text-xs leading-relaxed cursor-pointer" style={{ color: "#6b7280" }}>
                  <Link href="/terms" className="underline" style={{ color: "#1d1d1f" }}>利用規約</Link>と
                  <Link href="/privacy" className="underline" style={{ color: "#1d1d1f" }}>プライバシーポリシー</Link>に同意します
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: loading ? "#999999" : "#111111",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {loading ? "登録中..." : "無料で会員登録"}
              </button>
            </form>

            {/* まずは無料で始めるCTA */}
            <div
              className="mt-6 p-4 rounded-2xl text-center"
              style={{ background: "#f5f5f5", border: "1px solid #e5e5e5" }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: "#111111" }}>
                まずは無料で始められます
              </p>
              <p className="text-xs" style={{ color: "#666666" }}>
                クレジットカード不要・いつでもキャンセル可能
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
