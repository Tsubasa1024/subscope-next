import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "料金プラン",
  description: "SUBSCOPEの料金プランをご確認ください。無料プランから始められます。",
  alternates: { canonical: "https://www.subscope.jp/pricing" },
};

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "¥0",
    period: "/月",
    description: "まずは無料で試してみる",
    highlight: false,
    features: [
      { text: "記事の閲覧（全カテゴリ）", ok: true },
      { text: "保存 最大5件", ok: true },
      { text: "いいね・シェア", ok: true },
      { text: "コメント投稿", ok: false },
      { text: "ランキング閲覧", ok: false },
      { text: "広告非表示", ok: false },
    ],
    cta: "無料で始める",
    href: "/signup",
    external: false,
  },
  {
    key: "standard",
    name: "Standard",
    price: "¥580",
    period: "/月",
    description: "よく使う方に最適なプラン",
    badge: "人気",
    highlight: false,
    features: [
      { text: "記事の閲覧（全カテゴリ）", ok: true },
      { text: "保存 最大15件", ok: true },
      { text: "いいね・シェア", ok: true },
      { text: "コメント投稿", ok: true },
      { text: "ランキング閲覧", ok: true },
      { text: "広告非表示", ok: false },
    ],
    cta: "Standardを始める",
    href: "#",
    external: true,
  },
  {
    key: "pro",
    name: "Pro",
    price: "¥1,480",
    period: "/月",
    description: "すべての機能を制限なく",
    highlight: true,
    features: [
      { text: "記事の閲覧（全カテゴリ）", ok: true },
      { text: "保存 無制限", ok: true },
      { text: "いいね・シェア", ok: true },
      { text: "コメント投稿", ok: true },
      { text: "ランキング閲覧", ok: true },
      { text: "広告非表示", ok: true },
    ],
    cta: "Proを始める",
    href: "#",
    external: true,
  },
] as const;

function Check({ ok }: { ok: boolean }) {
  if (ok) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
        <circle cx="8" cy="8" r="8" fill="#111" />
        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <circle cx="8" cy="8" r="7.5" stroke="#d1d5db" />
      <path d="M5.5 8h5" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <main style={{ paddingTop: "96px", paddingBottom: "80px" }}>
      <div className="container">
        {/* ヘッダー */}
        <section className="text-center mb-14">
          <p style={{ fontSize: "0.85rem", color: "#86868b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Pricing
          </p>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 700, letterSpacing: "-0.03em", marginTop: "10px" }}>
            料金プラン
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
              {"badge" in plan && plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: "#111" }}
                >
                  {plan.badge}
                </div>
              )}

              {/* プラン名 */}
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
                  <li key={f.text} className="flex items-center gap-2.5">
                    <Check ok={f.ok} />
                    <span
                      className="text-sm"
                      style={{ color: f.ok ? "#111" : "#aaa" }}
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className="flex items-center justify-center w-full py-3.5 rounded-full font-semibold text-sm transition-all"
                style={
                  plan.highlight
                    ? { background: "#111", color: "#fff" }
                    : plan.key === "free"
                    ? { background: "#111", color: "#fff" }
                    : { background: "#fff", color: "#111", border: "1.5px solid #111" }
                }
              >
                {plan.cta}
              </Link>
              {plan.external && (
                <p className="text-center text-xs mt-2" style={{ color: "#bbb" }}>
                  ※ Stripe決済（準備中）
                </p>
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
                a: "はい、無料プランはクレジットカード不要で永続的にご利用いただけます。",
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
  );
}
