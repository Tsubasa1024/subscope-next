"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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

function clearbitUrl(logoUrl: string): string {
  try {
    const withProtocol = logoUrl.startsWith("http") ? logoUrl : `https://${logoUrl}`;
    const { hostname } = new URL(withProtocol);
    return `https://logo.clearbit.com/${hostname}`;
  } catch {
    return `https://logo.clearbit.com/${logoUrl}`;
  }
}

const STAR_PATH =
  "M 8,1 L 9.646,5.735 L 14.658,5.837 L 10.663,8.865 L 12.115,13.663 L 8,10.8 L 3.885,13.663 L 5.337,8.865 L 1.342,5.837 L 6.354,5.735 Z";

function StarDisplay({ score, uid }: { score: number; uid: string }) {
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
        <svg key={i} width="14" height="14" viewBox="0 0 16 16">
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
      <span style={{ fontSize: "12px", color: "#86868b", marginLeft: "4px" }}>
        {score.toFixed(1)}
        <span style={{ opacity: 0.6 }}>/10</span>
      </span>
    </div>
  );
}

function LogoCell({ name, logo_url }: { name: string; logo_url: string | null }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "10px",
        background: logo_url ? "#f5f5f7" : "#333333",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "0.85rem",
        color: "#ffffff",
        overflow: "hidden",
      }}
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
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  background: "#ffffff",
  border: "1px solid #e8e8e8",
  borderRadius: "16px",
  padding: "16px 20px",
  textDecoration: "none",
  cursor: "pointer",
};

export default function ServiceRankingClient({
  rankedServices,
  unreviewedServices,
  userId,
}: Props) {
  const router = useRouter();
  const [modalService, setModalService] = useState<{ id: string; name: string } | null>(null);

  function handleReviewClick(e: React.MouseEvent, service: { id: string; name: string }) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      router.push("/login");
      return;
    }
    setModalService(service);
  }

  function handleReviewSubmit() {
    router.refresh();
  }

  return (
    <>
      {/* ページヘッダー */}
      <section style={{ paddingBottom: "32px" }}>
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "#111111",
            marginBottom: "6px",
          }}
        >
          サブスクランキング
        </h1>
        <p style={{ color: "#86868b", fontSize: "0.9rem" }}>
          ユーザーが評価したサブスクのランキングです
        </p>
      </section>

      {/* ランキング（レビューあり） */}
      <section>
        <h2
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#86868b",
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          ランキング
        </h2>

        {rankedServices.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "#86868b" }}>まだレビューがありません。</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {rankedServices.map((svc, i) => (
              <Link
                key={svc.id}
                href={`/service-ranking/${svc.slug}`}
                style={cardStyle}
                className="hover:[border-color:#111111]"
              >
                {/* ランク番号 */}
                <div
                  style={{
                    flexShrink: 0,
                    width: "28px",
                    textAlign: "center",
                    fontSize: "0.8rem",
                    color: "#86868b",
                    fontWeight: 600,
                  }}
                >
                  {i + 1}
                </div>

                <LogoCell name={svc.name} logo_url={svc.logo_url} />

                {/* サービス情報 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "#111111" }}>
                      {svc.name}
                    </span>
                    {svc.category && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          background: "#f5f5f7",
                          color: "#86868b",
                        }}
                      >
                        {svc.category}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <StarDisplay score={svc.avgScore} uid={svc.id} />
                    <span style={{ fontSize: "0.75rem", color: "#86868b" }}>
                      ({svc.reviewCount}件)
                    </span>
                  </div>
                </div>

                {/* アクション */}
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#86868b", whiteSpace: "nowrap" }}>
                    詳細 →
                  </span>
                  <button
                    onClick={(e) => handleReviewClick(e, { id: svc.id, name: svc.name })}
                    style={{
                      fontSize: "0.7rem",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      border: "1px solid #e8e8e8",
                      background: "#ffffff",
                      color: "#111111",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    レビューを書く
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* レビューなしセクション */}
      {unreviewedServices.length > 0 && (
        <section style={{ marginTop: "32px" }}>
          <h2
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#86868b",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            レビュー募集中
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {unreviewedServices.map((svc) => (
              <Link
                key={svc.id}
                href={`/service-ranking/${svc.slug}`}
                style={cardStyle}
                className="hover:[border-color:#111111]"
              >
                <LogoCell name={svc.name} logo_url={svc.logo_url} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "#111111" }}>
                      {svc.name}
                    </span>
                    {svc.category && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          background: "#f5f5f7",
                          color: "#86868b",
                        }}
                      >
                        {svc.category}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.75rem", marginTop: "2px", color: "#86868b" }}>
                    まだレビューなし
                  </p>
                </div>

                <button
                  onClick={(e) => handleReviewClick(e, { id: svc.id, name: svc.name })}
                  style={{
                    flexShrink: 0,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: "1px solid #111111",
                    background: "#ffffff",
                    color: "#111111",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  最初のレビュアーになる
                </button>
              </Link>
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
