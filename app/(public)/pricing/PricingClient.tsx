"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const PLANS = [
  {
    key: "free" as const,
    name: "Free",
    price: "¥0",
    period: "/月",
    description: "まずは無料で試してみる",
    highlight: false,
    features: [
      "記事 読み放題",
      "いいね 無制限",
      "保存 5件まで",
      "ランキング閲覧",
    ],
    cta: "無料で始める",
  },
  {
    key: "standard" as const,
    name: "Standard",
    price: "¥580",
    period: "/月",
    description: "よく使う方に最適なプラン",
    badge: "人気",
    highlight: true,
    features: [
      "保存 15件まで",
      "コメント機能",
      "広告非表示",
      "プレミアム記事",
      "比較機能",
      "AI診断",
      "サブスク家計簿",
      "Free の全機能",
    ],
    cta: "Standardを始める",
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "¥1,480",
    period: "/月",
    description: "すべての機能を制限なく",
    highlight: false,
    features: [
      "保存 無制限",
      "パーソナル通知",
      "Standard の全機能",
    ],
    cta: "Proを始める",
  },
];

export default function PricingClient() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setToast(true);
      // URL から success パラメータを除去
      router.replace("/pricing");
      const timer = setTimeout(() => setToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  async function handleCheckout(planKey: "standard" | "pro") {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: planKey }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        alert(data.error ?? "エラーが発生しました");
        return;
      }

      window.location.href = data.url;
    } catch {
      alert("ネットワークエラーが発生しました");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <>
      {/* トースト */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: "999px",
            fontSize: "0.9rem",
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}
        >
          プランのアップグレードが完了しました！
        </div>
      )}

      <main style={{ paddingTop: "96px", paddingBottom: "80px" }}>
        <div className="container">
          {/* ヘッダー */}
          <section className="text-center mb-14">
            <p style={{ fontSize: "0.85rem", color: "#86868b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Pricing
            </p>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 700, letterSpacing: "-0.03em", marginTop: "10px" }}>
              あなたに合ったプランを選ぼう
            </h1>
            <p className="mt-3 text-base" style={{ color: "#86868b" }}>
              無料で始めて、必要に応じてアップグレード。いつでもキャンセル可能。
            </p>
          </section>

          {/* プランカード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className="flex flex-col rounded-3xl p-8"
                style={{
                  background: "#fff",
                  border: plan.highlight ? "2px solid #111" : "1.5px solid #e5e5ea",
                  boxShadow: plan.highlight ? "0 16px 48px rgba(0,0,0,0.10)" : "none",
                  position: "relative",
                }}
              >
                {/* バッジ */}
                {"badge" in plan && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: "#111" }}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* プラン名・価格 */}
                <div className="mb-6">
                  <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#86868b" }}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1 mb-2">
                    <span style={{ fontSize: "2.2rem", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
                      {plan.price}
                    </span>
                    <span className="text-sm mb-1" style={{ color: "#86868b" }}>{plan.period}</span>
                  </div>
                  <p className="text-sm" style={{ color: "#86868b" }}>{plan.description}</p>
                </div>

                {/* 機能リスト */}
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                        <circle cx="8" cy="8" r="8" fill="#111" />
                        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-sm" style={{ color: "#111" }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.key === "free" ? (
                  <Link
                    href="/signup"
                    className="flex items-center justify-center w-full py-3.5 rounded-full font-semibold text-sm transition-all hover:opacity-90"
                    style={{ background: "#fff", color: "#111", border: "1.5px solid #111" }}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={!ready || loadingPlan === plan.key}
                    className="flex items-center justify-center w-full py-3.5 rounded-full font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={
                      plan.highlight
                        ? { background: "#111", color: "#fff", border: "none" }
                        : { background: "#fff", color: "#111", border: "1.5px solid #111" }
                    }
                  >
                    {loadingPlan === plan.key ? "処理中…" : plan.cta}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* FAQ */}
          <section className="mt-20 max-w-2xl mx-auto">
            <h2 className="text-center font-bold mb-8" style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
              よくある質問
            </h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  q: "無料プランはずっと無料ですか？",
                  a: "はい、クレジットカード不要で永続的にご利用いただけます。",
                },
                {
                  q: "プランはいつでも変更できますか？",
                  a: "はい、いつでもアップグレード・ダウングレードが可能です。",
                },
                {
                  q: "解約はどうすればできますか？",
                  a: "マイページから即時解約できます。解約後は次回更新日まで現プランを継続できます。",
                },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-2xl p-6" style={{ background: "#f5f5f7" }}>
                  <p className="font-semibold text-sm mb-1" style={{ color: "#111" }}>{q}</p>
                  <p className="text-sm" style={{ color: "#86868b" }}>{a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
