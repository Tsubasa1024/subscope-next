"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ServiceReviewModal from "@/components/ServiceReviewModal";

export interface ServiceWithStats {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  category: string | null;
  avgScore: number;
  reviewCount: number;
}

interface Props {
  services: ServiceWithStats[];
  userId: string | null;
}

export default function ServiceRankingClient({ services, userId }: Props) {
  const router = useRouter();
  const [modalService, setModalService] = useState<{ id: string; name: string } | null>(null);
  const [list, setList] = useState(services);

  function handleReviewClick(service: { id: string; name: string }) {
    if (!userId) {
      router.push("/login");
      return;
    }
    setModalService(service);
  }

  // レビュー送信後にページデータをリフレッシュ
  function handleReviewSubmit() {
    router.refresh();
  }

  const stars = (avg: number) => {
    const full = Math.floor(avg / 2);
    const half = avg / 2 - full >= 0.5;
    return { full, half, empty: 5 - full - (half ? 1 : 0) };
  };

  return (
    <>
      <div
        className="rounded-3xl overflow-hidden bg-white"
        style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
      >
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div
              className="flex items-center justify-center rounded-full mb-5"
              style={{ width: "64px", height: "64px", background: "#f5f5f7", fontSize: "1.8rem" }}
            >
              📊
            </div>
            <h2 className="font-bold mb-2" style={{ fontSize: "1.1rem", color: "#1d1d1f" }}>
              まだレビューがありません
            </h2>
            <p className="text-sm" style={{ color: "#86868b", maxWidth: "300px", lineHeight: 1.7 }}>
              最初のレビューを投稿して、ランキングを作りましょう。
            </p>
          </div>
        ) : (
          services.map((svc, i) => {
            const { full, half, empty } = stars(svc.avgScore);
            return (
              <div
                key={svc.id}
                className="flex items-center gap-4 px-5 py-4 bg-white"
                style={{ borderBottom: i < services.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
              >
                {/* ランク */}
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{
                    background: i === 0 ? "#111111" : i === 1 ? "#666666" : i === 2 ? "#999999" : "#f0f0f0",
                    color: i < 3 ? "#fff" : "#666666",
                  }}
                >
                  {i + 1}
                </div>

                {/* ロゴ or イニシャル */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-bold text-sm text-white"
                  style={{ background: svc.logo_url ? "transparent" : "#333333" }}
                >
                  {svc.logo_url ? (
                    <Image
                      src={svc.logo_url}
                      alt={svc.name}
                      width={40}
                      height={40}
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    svc.name[0]
                  )}
                </div>

                {/* 情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: "#1d1d1f" }}>{svc.name}</span>
                    {svc.category && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "#f0f0f0", color: "#666666" }}
                      >
                        {svc.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span style={{ fontSize: "12px", color: "#111111", letterSpacing: "0.05em" }}>
                      {"★".repeat(full)}
                      {half ? "½" : ""}
                      {"☆".repeat(empty)}
                    </span>
                    <span className="text-xs font-semibold tabular-nums" style={{ color: "#666666" }}>
                      {svc.avgScore.toFixed(1)}
                      <span className="font-normal text-xs" style={{ color: "#86868b" }}>/10</span>
                    </span>
                    <span className="text-xs" style={{ color: "#86868b" }}>
                      ({svc.reviewCount}件)
                    </span>
                  </div>
                </div>

                {/* レビューボタン */}
                <button
                  onClick={() => handleReviewClick({ id: svc.id, name: svc.name })}
                  className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-colors hover:bg-gray-100"
                  style={{ border: "1.5px solid rgba(0,0,0,0.15)", color: "#111111", background: "#fff", cursor: "pointer" }}
                >
                  レビューを書く
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* 全サービス（レビュー0件含む）にもレビューできるよう下部に案内 */}
      {services.length > 0 && (
        <p className="text-center text-xs mt-4" style={{ color: "#86868b" }}>
          ※ 平均スコア順。レビュー数が多いほど信頼度が高まります。
        </p>
      )}

      {/* モーダル */}
      {modalService && userId && (
        <ServiceReviewModal
          isOpen={!!modalService}
          onClose={() => setModalService(null)}
          service={modalService}
          userId={userId}
          onSubmit={handleReviewSubmit}
        />
      )}
    </>
  );
}
