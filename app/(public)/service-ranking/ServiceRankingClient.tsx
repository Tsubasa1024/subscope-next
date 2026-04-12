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

export interface ServiceNoReview {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  category: string | null;
}

interface Props {
  rankedServices: ServiceWithStats[];
  unreviewedServices: ServiceNoReview[];
  userId: string | null;
}

/** logo_url（ドメイン文字列 or フルURL）から Clearbit ロゴ URL を生成 */
function clearbitUrl(logoUrl: string): string {
  try {
    const withProtocol = logoUrl.startsWith("http") ? logoUrl : `https://${logoUrl}`;
    const { hostname } = new URL(withProtocol);
    return `https://logo.clearbit.com/${hostname}`;
  } catch {
    return `https://logo.clearbit.com/${logoUrl}`;
  }
}

export default function ServiceRankingClient({ rankedServices, unreviewedServices, userId }: Props) {
  const router = useRouter();
  const [modalService, setModalService] = useState<{ id: string; name: string } | null>(null);

  function handleReviewClick(service: { id: string; name: string }) {
    if (!userId) {
      router.push("/login");
      return;
    }
    setModalService(service);
  }

  function handleReviewSubmit() {
    router.refresh();
  }

  const STAR_PATH =
    "M 8,1 L 9.646,5.735 L 14.658,5.837 L 10.663,8.865 L 12.115,13.663 L 8,10.8 L 3.885,13.663 L 5.337,8.865 L 1.342,5.837 L 6.354,5.735 Z";

  const StarDisplay = ({ score, uid }: { score: number; uid: string }) => {
    const starValue = score / 2;
    const types = Array.from({ length: 5 }, (_, i) => {
      const filled = starValue - i;
      if (filled >= 1) return "full";
      if (filled >= 0.5) return "half";
      return "empty";
    });
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {types.map((type, i) => (
          <svg key={i} width="16" height="16" viewBox="0 0 16 16">
            {type === "half" && (
              <defs>
                <linearGradient id={`hg-${uid}-${i}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor="#111111" />
                  <stop offset="50%" stopColor="#e0e0e0" />
                </linearGradient>
              </defs>
            )}
            <path
              d={STAR_PATH}
              fill={
                type === "full"
                  ? "#111111"
                  : type === "half"
                  ? `url(#hg-${uid}-${i})`
                  : "#e0e0e0"
              }
            />
          </svg>
        ))}
        <span style={{ fontSize: "12px", color: "#666666", marginLeft: "4px" }}>
          {score.toFixed(1)}
          <span style={{ color: "#86868b" }}>/10</span>
        </span>
      </div>
    );
  };

  const LogoCell = ({ name, logo_url }: { name: string; logo_url: string | null }) => (
    <div
      className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-bold text-sm text-white"
      style={{ background: logo_url ? "transparent" : "#333333" }}
    >
      {logo_url ? (
        <Image
          src={clearbitUrl(logo_url)}
          alt={name}
          width={40}
          height={40}
          style={{ objectFit: "contain" }}
          unoptimized={false}
        />
      ) : (
        name[0]
      )}
    </div>
  );

  return (
    <>
      {/* ── Section 1: ランキング（レビューあり） ── */}
      <section>
        <h2 className="font-bold mb-3" style={{ fontSize: "1rem", color: "#1d1d1f" }}>
          ランキング
        </h2>
        <div
          className="rounded-3xl overflow-hidden bg-white"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        >
          {rankedServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div
                className="flex items-center justify-center rounded-full mb-4"
                style={{ width: "56px", height: "56px", background: "#f5f5f7", fontSize: "1.6rem" }}
              >
                📊
              </div>
              <p className="font-semibold text-sm mb-1" style={{ color: "#1d1d1f" }}>
                まだレビューがありません
              </p>
              <p className="text-xs" style={{ color: "#86868b", maxWidth: "280px", lineHeight: 1.7 }}>
                下のサービス一覧から最初のレビューを投稿してランキングを育てましょう。
              </p>
            </div>
          ) : (
            rankedServices.map((svc, i) => {
              return (
                <div
                  key={svc.id}
                  className="flex items-center gap-4 px-5 py-4 bg-white"
                  style={{ borderBottom: i < rankedServices.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
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

                  <LogoCell name={svc.name} logo_url={svc.logo_url} />

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
                      <StarDisplay score={svc.avgScore} uid={svc.id} />
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
        {rankedServices.length > 0 && (
          <p className="text-center text-xs mt-3" style={{ color: "#86868b" }}>
            ※ 平均スコア順。レビュー数が多いほど信頼度が高まります。
          </p>
        )}
      </section>

      {/* ── Section 2: レビューなし ── */}
      {unreviewedServices.length > 0 && (
        <section style={{ marginTop: "48px" }}>
          <h2 className="font-bold mb-3" style={{ fontSize: "1rem", color: "#1d1d1f" }}>
            まだレビューなし
          </h2>
          <div
            className="rounded-3xl overflow-hidden bg-white"
            style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
          >
            {unreviewedServices.map((svc, i) => (
              <div
                key={svc.id}
                className="flex items-center gap-4 px-5 py-4 bg-white"
                style={{ borderBottom: i < unreviewedServices.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
              >
                <LogoCell name={svc.name} logo_url={svc.logo_url} />

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
                  <p className="text-xs mt-0.5" style={{ color: "#86868b" }}>
                    レビュー 0件
                  </p>
                </div>

                {/* 最初のレビューボタン */}
                <button
                  onClick={() => handleReviewClick({ id: svc.id, name: svc.name })}
                  className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                  style={{
                    background: "#f5f5f7",
                    border: "1.5px solid rgba(0,0,0,0.08)",
                    color: "#111111",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  最初のレビューを書く
                </button>
              </div>
            ))}
          </div>
        </section>
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
