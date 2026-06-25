import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | SUBSCOPE",
};

const sections = [
  {
    title: "1. 収集する情報",
    body: `当サイトでは、以下の情報を収集することがあります。\n\n・アクセスログ（IPアドレス、ブラウザ情報、参照元URL等）\n・Cookieによる情報（セッション管理、アクセス解析）\n・お問い合わせフォームからご入力いただいた情報`,
  },
  {
    title: "2. 情報の利用目的",
    body: `収集した情報は、以下の目的のために利用します。\n\n・サービスの運営・改善\n・アクセス解析によるコンテンツ品質の向上\n・お問い合わせへの対応`,
  },
  {
    title: "3. 広告について",
    body: `当サイトはGoogle AdSenseによる広告を掲載しています。Googleは広告配信のためにCookieを使用することがあります。詳細はGoogleのプライバシーポリシーをご確認ください。`,
  },
  {
    title: "4. アクセス解析について",
    body: `当サイトはGoogle Analyticsを使用しています。収集されるデータは匿名で処理され、個人を特定するものではありません。`,
  },
  {
    title: "5. 第三者への提供",
    body: `法令に基づく場合を除き、収集した情報を第三者に提供することはありません。`,
  },
  {
    title: "6. 情報の管理",
    body: `収集した情報は適切な方法で管理し、不正アクセス・紛失・漏洩の防止に努めます。`,
  },
  {
    title: "7. プライバシーポリシーの変更",
    body: `本ポリシーは予告なく変更することがあります。変更後はこのページに掲載します。`,
  },
  {
    title: "8. お問い合わせ",
    body: `メールアドレス: subscope.info@gmail.com`,
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7", paddingTop: "var(--header-h)" }}>
      <main style={{ display: "flex", justifyContent: "center", padding: "48px 16px 80px" }}>
        <div style={{ width: "100%", maxWidth: 720 }}>

          {/* ページタイトル */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>
              プライバシーポリシー
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#86868b", marginTop: 8 }}>最終更新日: 2026年6月25日</p>
          </div>

          {/* 本文カード */}
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "32px 28px", display: "flex", flexDirection: "column", gap: 0 }}>
            {sections.map((s, i) => (
              <div key={i}>
                {i > 0 && <div style={{ borderTop: "1px solid #f0f0f0", margin: "24px 0" }} />}
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111", marginBottom: 12 }}>{s.title}</h2>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "#444", whiteSpace: "pre-line" }}>{s.body}</p>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
