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

  const services: ServiceForDiagnosis[] = (
    (serviceRows ?? []) as unknown as ServiceRow[]
  ).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    category: s.categories?.name ?? null,
  }));

  return (
    <main style={{ background: "#f5f5f7", minHeight: "100vh", paddingTop: "96px" }}>
      <DiagnosisClient services={services} />
    </main>
  );
}
