import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ServiceTable } from "./_components/ServiceTable";

export const dynamic = "force-dynamic";

type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  is_featured: boolean;
  categories: { name: string } | null;
};

export default async function AdminServicesPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data: services, error } = await supabase
    .from("services")
    .select("id, name, slug, is_active, is_featured, categories(name)")
    .order("name");

  if (error) {
    return (
      <div style={{ color: "#e53e3e", padding: "24px" }}>
        データの取得に失敗しました: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            サービス管理
          </h1>
          <p style={{ color: "#86868b", marginTop: "4px", fontSize: "0.875rem" }}>
            {services?.length ?? 0} 件のサービス
          </p>
        </div>
        <Link
          href="/admin/services/new"
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            background: "#1d1d1f",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          + 新規サービス追加
        </Link>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <ServiceTable services={(services as unknown as ServiceRow[]) ?? []} />
      </div>
    </div>
  );
}
