import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PricingClient from "./PricingClient";
import { FEATURES } from "@/lib/features";

export const metadata: Metadata = {
  title: "料金プラン",
  description: "SUBSCOPEの料金プランをご確認ください。無料プランから始められます。",
  alternates: { canonical: "https://www.subscope.jp/pricing" },
};

export default function PricingPage() {
  if (!FEATURES.subscription) notFound();

  return (
    <Suspense fallback={null}>
      <PricingClient />
    </Suspense>
  );
}
