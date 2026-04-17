import type { Metadata } from "next";

export const metadata: Metadata = { title: "ユーザー管理 | Admin | SUBSCOPE" };

export default function AdminUsersPage() {
  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12 }}>
        ユーザー管理
      </h1>
      <p style={{ color: "#86868b", fontSize: "0.875rem" }}>Phase 2 で実装予定です。</p>
    </div>
  );
}
