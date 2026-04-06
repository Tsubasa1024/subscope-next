import type { Metadata } from "next";
import { Suspense } from "react";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "料金プラン",
  description: "SUBSCOPEの料金プランをご確認ください。無料プランから始められます。",
  alternates: { canonical: "https://www.subscope.jp/pricing" },
};

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingClient />
    </Suspense>
  );
}
