import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | SUBSCOPE",
};

const sections = [
  {
    title: "1. サービスの概要",
    body: `SUBSCOPE（以下「当サービス」）は、サブスクリプションサービスに関する情報提供・比較・レビューを目的としたWebサービスです。本規約は、当サービスの利用に関する条件を定めるものです。ユーザーは本規約に同意のうえ当サービスをご利用ください。`,
  },
  {
    title: "2. 利用登録",
    body: `当サービスの一部機能（記事の保存、レビュー投稿等）はアカウント登録が必要です。登録にあたっては、正確な情報を提供してください。登録情報に虚偽が含まれる場合、当サービスはアカウントを停止または削除できるものとします。`,
  },
  {
    title: "3. 禁止事項",
    body: `ユーザーは以下の行為を行ってはなりません。\n\n・法令または公序良俗に違反する行為\n・他のユーザーや第三者への誹謗中傷・嫌がらせ\n・虚偽の情報の投稿・拡散\n・著作権・商標権等の知的財産権を侵害する行為\n・スパム行為、広告・宣伝目的での無断投稿\n・当サービスのシステムへの不正アクセス・クラッキング\n・その他、当サービスが不適切と判断する行為`,
  },
  {
    title: "4. 投稿コンテンツ",
    body: `ユーザーが投稿したレビュー・コメント等のコンテンツについて、ユーザー自身が著作権を保持します。ただし、当サービスはサービスの運営・改善・宣伝のためにこれらを無償で利用できるものとします。当サービスは、禁止事項に該当するコンテンツを予告なく削除できるものとします。`,
  },
  {
    title: "5. 免責事項",
    body: `当サービスは、掲載情報の正確性・完全性を保証しません。当サービスの利用によって生じた損害について、当サービスは責任を負いません。また、外部リンク先のサービス・コンテンツについても同様です。`,
  },
  {
    title: "6. サービスの変更・終了",
    body: `当サービスは、ユーザーへの事前通知なく、サービスの内容を変更・停止・終了することがあります。これによってユーザーに損害が生じた場合でも、当サービスは責任を負わないものとします。`,
  },
  {
    title: "7. 利用規約の変更",
    body: `当サービスは、必要に応じて本規約を変更することがあります。変更後の規約は、当ページに掲載した時点から効力を生じます。継続してサービスをご利用いただいた場合、変更後の規約に同意したものとみなします。`,
  },
  {
    title: "8. 準拠法・管轄",
    body: `本規約の解釈および適用は日本法に準拠します。当サービスに関する紛争については、横浜地方裁判所を第一審の専属的合意管轄裁判所とします。`,
  },
];

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7", paddingTop: "var(--header-h)" }}>
      <main style={{ display: "flex", justifyContent: "center", padding: "48px 16px 80px" }}>
        <div style={{ width: "100%", maxWidth: 720 }}>

          {/* ページタイトル */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>
              利用規約
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
