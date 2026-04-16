/**
 * アフィリエイト・PR 記事に表示する表記ラベル
 * ステマ規制（景品表示法）対応
 */
export default function PRLabel() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 16px",
        borderRadius: "10px",
        background: "#fffbeb",
        border: "1px solid #fde68a",
        marginBottom: "24px",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "2px 8px",
          borderRadius: "4px",
          background: "#f59e0b",
          color: "#fff",
          fontSize: "0.68rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          flexShrink: 0,
        }}
      >
        広告
      </span>
      <p style={{ fontSize: "0.78rem", color: "#92400e", lineHeight: 1.5, margin: 0 }}>
        この記事はアフィリエイト広告を含みます。記事内のリンクから購入・登録された場合、当メディアは報酬を受け取ることがあります。掲載内容は編集部の独自評価に基づいています。
      </p>
    </div>
  );
}
