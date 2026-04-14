import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | SUBSCOPE",
};

const sections = [
  {
    title: "1. 個人情報の収集について",
    body: `当サービス（SUBSCOPE）は、サービスの提供にあたり、以下の個人情報を収集することがあります。\n\n・メールアドレス（会員登録・お問い合わせ時）\n・ユーザー名・プロフィール情報（任意でご登録いただくもの）\n・サービスの利用履歴（閲覧記事、保存記事、レビュー内容など）\n・アクセスログ（IPアドレス、ブラウザ情報、アクセス日時など）`,
  },
  {
    title: "2. 個人情報の利用目的",
    body: `収集した個人情報は、以下の目的のために利用します。\n\n・会員登録およびアカウント管理\n・サービスの提供・運営・改善\n・お問い合わせへの対応\n・重要なお知らせ・メンテナンス情報のご連絡\n・利用規約違反への対応`,
  },
  {
    title: "3. 第三者への提供",
    body: `当サービスは、以下の場合を除き、収集した個人情報を第三者へ提供することはありません。\n\n・ご本人の同意がある場合\n・法令に基づく開示が必要な場合\n・人命・財産の保護のために緊急を要する場合\n\nなお、当サービスはサービス運営にあたり、Supabase（データベース）、Stripe（決済）等の外部サービスを利用しています。これらのサービスへのデータ提供は、各社のプライバシーポリシーに従います。`,
  },
  {
    title: "4. Cookieの使用",
    body: `当サービスでは、ログイン状態の維持やサービス改善のためにCookie（クッキー）を使用しています。ブラウザの設定によりCookieを無効にすることも可能ですが、一部の機能が利用できなくなる場合があります。`,
  },
  {
    title: "5. セキュリティ",
    body: `当サービスは、収集した個人情報の漏洩・滅失・毀損を防止するため、適切なセキュリティ対策を実施しています。ただし、インターネットを介したデータ送受信において完全な安全性を保証することはできません。`,
  },
  {
    title: "6. 個人情報の開示・訂正・削除",
    body: `ご本人からの個人情報の開示・訂正・削除のご要望は、下記お問い合わせ先までご連絡ください。本人確認のうえ、合理的な期間内に対応いたします。`,
  },
  {
    title: "7. プライバシーポリシーの変更",
    body: `当サービスは、必要に応じて本ポリシーを変更することがあります。変更後のポリシーは、当ページに掲載した時点から効力を生じるものとします。`,
  },
  {
    title: "8. お問い合わせ先",
    body: `個人情報の取り扱いに関するお問い合わせは、下記までご連絡ください。\n\nメールアドレス: subscope.info@gmail.com`,
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
            <p style={{ fontSize: "0.85rem", color: "#86868b", marginTop: 8 }}>制定日: 2025年1月1日</p>
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
