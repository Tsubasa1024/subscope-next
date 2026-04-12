import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ServiceForm } from "../_components/ServiceForm";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("name");

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <Link
            href="/admin/services"
            style={{ fontSize: "0.875rem", color: "#86868b", textDecoration: "none" }}
          >
            ← サービス一覧
          </Link>
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          新規サービス追加
        </h1>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          maxWidth: "720px",
        }}
      >
        <ServiceForm categories={categories ?? []} />
      </div>
    </div>
  );
}
