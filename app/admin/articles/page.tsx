import type { Metadata } from "next";

export const metadata: Metadata = { title: "記事分析 | Admin | SUBSCOPE" };

export default function AdminArticlesPage() {
  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12 }}>
        記事分析
      </h1>
      <p style={{ color: "#86868b", fontSize: "0.875rem" }}>Phase 4 で実装予定です。</p>
    </div>
  );
}
