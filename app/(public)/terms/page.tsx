import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | SUBSCOPE",
};

const sections = [
  {
    title: "1. サービスの概要",
    body: `SUBSCOPE（以下「当サイト」）は、ChatGPT・Claude・Gemini・xAIなど最新AIツールの正直なレビューと最新情報を発信するメディアです。`,
  },
  {
    title: "2. 免責事項",
    body: `当サイトの情報は可能な限り正確を期しておりますが、内容の完全性・正確性を保証するものではありません。当サイトの情報をもとにした判断・行動について、当サイトは一切の責任を負いません。`,
  },
  {
    title: "3. 広告について",
    body: `当サイトはGoogle AdSenseによる広告を掲載しています。広告収入によりサイトを運営していますが、記事の内容・評価に広告主は一切関与していません。`,
  },
  {
    title: "4. 禁止事項",
    body: `以下の行為を禁止します。\n\n・当サイトのコンテンツの無断転載・複製\n・当サイトの運営を妨害する行為\n・法令または公序良俗に反する行為`,
  },
  {
    title: "5. 著作権",
    body: `当サイトのコンテンツの著作権は運営者に帰属します。引用の場合は出典を明記してください。`,
  },
  {
    title: "6. サービスの変更・終了",
    body: `当サイトは予告なくサービス内容の変更・終了をすることがあります。`,
  },
  {
    title: "7. 準拠法",
    body: `本規約は日本法に準拠し、横浜地方裁判所を専属的合意管轄裁判所とします。`,
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
