export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DiagnosisClient, { type ServiceForDiagnosis } from "./DiagnosisClient";

export const metadata: Metadata = {
  title: "サブスク診断",
  description:
    "いくつかの質問に答えるだけで、あなたにぴったりのサブスクリプションが見つかる診断ツール。",
  alternates: { canonical: "https://www.subscope.jp/diagnosis" },
};

export default async function DiagnosisPage() {
  const supabase = await createClient();

  const { data: serviceRows } = await supabase
    .from("services")
    .select("id, name, slug, categories(name)")
    .eq("is_active", true);

  type ServiceRow = {
    id: string;
    name: string;
    slug: string;
    categories: { name: string } | null;
  };

  const services: ServiceForDiagnosis[] = ((serviceRows ?? []) as unknown as ServiceRow[]).map(
    (s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.categories?.name ?? null,
    })
  );

  return (
    <main style={{ paddingTop: "96px" }}>
      <div className="container" style={{ paddingBottom: "var(--spacing-section)" }}>

        {/* ページヘッダー */}
        <section style={{ paddingBottom: "40px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#86868b",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Diagnosis
          </p>
          <h1
            style={{
              fontSize: "2.4rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginTop: "10px",
            }}
          >
            サブスク診断
          </h1>
          <p
            style={{
              color: "#86868b",
              marginTop: "12px",
              lineHeight: 1.7,
              maxWidth: "480px",
              margin: "12px auto 0",
            }}
          >
            いくつかの質問に答えるだけで、
            <br />
            あなたにぴったりのサブスクが見つかります。
          </p>
        </section>

        <DiagnosisClient services={services} />
      </div>
    </main>
  );
}
