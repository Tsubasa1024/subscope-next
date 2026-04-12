"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";

interface ServiceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: { id: string; name: string };
  userId: string;
  onSubmit?: () => void;
}

export default function ServiceReviewModal({
  isOpen,
  onClose,
  service,
  userId,
  onSubmit,
}: ServiceReviewModalProps) {
  const [score, setScore] = useState(7);
  const [goodPoints, setGoodPoints] = useState("");
  const [badPoints, setBadPoints] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 既存レビューをプリセット
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("service_reviews")
      .select("score, good_points, bad_points")
      .eq("user_id", userId)
      .eq("service_id", service.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setScore(data.score ?? 7);
          setGoodPoints(data.good_points ?? "");
          setBadPoints(data.bad_points ?? "");
        } else {
          setScore(7);
          setGoodPoints("");
          setBadPoints("");
        }
        setLoading(false);
      });
  }, [isOpen, service.id, userId]);

  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.from("service_reviews").upsert(
      {
        user_id: userId,
        service_id: service.id,
        score,
        good_points: goodPoints || null,
        bad_points: badPoints || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,service_id" }
    );
    setSubmitting(false);
    if (err) {
      setError("送信に失敗しました。もう一度お試しください。");
    } else {
      onSubmit?.();
      onClose();
    }
  }

  if (!isOpen) return null;

  const scoreColor =
    score >= 8 ? "#111111" : score >= 5 ? "#555555" : "#999999";

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 z-[200]"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* モーダル */}
      <div
        className="fixed z-[210] bg-white flex flex-col"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(480px, calc(100vw - 32px))",
          maxHeight: "calc(100dvh - 48px)",
          borderRadius: "24px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          overflowY: "auto",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`${service.name} のレビューを書く`}
      >
        {/* ヘッダー */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#86868b" }}>
              Review
            </p>
            <h2 className="font-bold mt-0.5" style={{ fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#1d1d1f" }}>
              {service.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="閉じる"
          >
            <X size={18} style={{ color: "#86868b" }} />
          </button>
        </div>

        {/* ボディ */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-200 animate-spin"
              style={{ borderTopColor: "#111111" }}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-6">
            {/* スコア */}
            <div>
              <div className="flex items-end justify-between mb-3">
                <label className="text-sm font-semibold" style={{ color: "#1d1d1f" }}>
                  総合スコア
                </label>
                <span
                  className="font-bold tabular-nums"
                  style={{ fontSize: "2.8rem", lineHeight: 1, color: scoreColor, letterSpacing: "-0.04em" }}
                >
                  {score}
                  <span className="text-base font-medium ml-0.5" style={{ color: "#86868b" }}>/10</span>
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "#111111", cursor: "pointer" }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: "#86868b" }}>1（低い）</span>
                <span className="text-xs" style={{ color: "#86868b" }}>10（高い）</span>
              </div>
            </div>

            {/* 良い点 */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#1d1d1f" }}>
                良い点
                <span className="ml-1 font-normal text-xs" style={{ color: "#86868b" }}>（任意）</span>
              </label>
              <textarea
                value={goodPoints}
                onChange={(e) => setGoodPoints(e.target.value)}
                placeholder="良かった点を教えてください"
                rows={3}
                className="w-full text-sm resize-none outline-none"
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(0,0,0,0.12)",
                  background: "#f5f5f7",
                  color: "#1d1d1f",
                  lineHeight: 1.6,
                }}
              />
            </div>

            {/* 悪い点 */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#1d1d1f" }}>
                改善してほしい点
                <span className="ml-1 font-normal text-xs" style={{ color: "#86868b" }}>（任意）</span>
              </label>
              <textarea
                value={badPoints}
                onChange={(e) => setBadPoints(e.target.value)}
                placeholder="改善してほしい点を教えてください"
                rows={3}
                className="w-full text-sm resize-none outline-none"
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(0,0,0,0.12)",
                  background: "#f5f5f7",
                  color: "#1d1d1f",
                  lineHeight: 1.6,
                }}
              />
            </div>

            {error && (
              <p className="text-sm text-center" style={{ color: "#c0392b" }}>{error}</p>
            )}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full font-semibold text-sm transition-opacity"
              style={{
                background: "#111111",
                color: "#fff",
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "送信中..." : "レビューを送信"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
