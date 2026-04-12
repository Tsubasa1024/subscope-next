import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceForm } from "../../_components/ServiceForm";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const [{ data: service }, { data: categories }] = await Promise.all([
    supabase
      .from("services")
      .select(
        "id, name, slug, category_id, description, website_url, affiliate_url, logo_url, is_featured, is_active"
      )
      .eq("id", id)
      .single(),
    supabase.from("categories").select("id, slug, name").order("name"),
  ]);

  if (!service) notFound();

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
          サービス編集
        </h1>
        <p style={{ color: "#86868b", marginTop: "4px", fontSize: "0.875rem" }}>
          {service.name}
        </p>
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
        <ServiceForm categories={categories ?? []} service={service} />
      </div>
    </div>
  );
}
