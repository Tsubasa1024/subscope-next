"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/utils";
import { getImageUrl } from "@/lib/utils";

interface CarouselProps {
  articles: Article[];
}

export default function Carousel({ articles }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visible = Math.min(articles.length, 3);
  const maxIndex = Math.max(0, articles.length - visible);

  const next = useCallback(() => {
    setIndex((i) => (i >= maxIndex ? 0 : i + 1));
  }, [maxIndex]);

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
    resetTimer();
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 4000);
  }

  // 自動スクロール（4秒ごと）
  useEffect(() => {
    if (articles.length <= visible) return;
    timerRef.current = setInterval(next, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, articles.length, visible]);

  const translateX = index === 0 ? "0%" : `calc(-${index} * (100% / ${visible} + 20px / ${visible}))`;

  return (
    <section
      style={{
        width: "100%",
        padding: "40px 0 24px",
      }}
    >
      <div className="container">
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "24px",
          }}
        >
          おすすめ記事
        </h2>

        <div style={{ position: "relative" }}>
          <div style={{ overflow: "hidden", borderRadius: "20px" }}>
            <div
              ref={trackRef}
              style={{
                display: "flex",
                gap: "20px",
                transform: `translateX(${translateX})`,
                transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                willChange: "transform",
              }}
            >
              {articles.map((a) => {
                const imgUrl = getImageUrl(a);
                return (
                  <div
                    key={a.id}
                    style={{
                      flex: "0 0 calc((100% - 40px) / 3)",
                      minWidth: 0,
                    }}
                  >
                    <Link
                      href={`/article/${a.id}`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: "20px",
                        background: "#fff",
                        border: "1px solid rgba(0,0,0,0.06)",
                        overflow: "hidden",
                        cursor: "pointer",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "16 / 9",
                          overflow: "hidden",
                          position: "relative",
                          background: "#f0f0f0",
                          flexShrink: 0,
                        }}
                      >
                        {imgUrl && (
                          <Image
                            src={imgUrl}
                            alt={a.title ?? ""}
                            fill
                            sizes="(max-width: 767px) 72vw, 33vw"
                            style={{ objectFit: "cover" }}
                          />
                        )}
                      </div>
                      <div style={{ padding: "14px 16px 0", flexGrow: 1 }}>
                        {a.service && (
                          <p
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              color: "#86868b",
                              marginBottom: "6px",
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                            }}
                          >
                            {a.service}
                          </p>
                        )}
                        <h3
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: 1.45,
                            marginBottom: "7px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {a.title}
                        </h3>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 16px 14px",
                          marginTop: "10px",
                          borderTop: "1px solid rgba(0,0,0,0.05)",
                        }}
                      >
                        <span style={{ fontSize: "10px", color: "#86868b" }}>
                          {a.publishedAt?.slice(0, 10)}
                        </span>
                        <span
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: "1px solid rgba(0,0,0,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="#1d1d1f"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 6h8M6 2l4 4-4 4" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prev */}
          {index > 0 && (
            <button
              onClick={prev}
              aria-label="前へ"
              style={{
                position: "absolute",
                top: "50%",
                left: "-16px",
                transform: "translateY(-50%)",
                border: "none",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
                zIndex: 10,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="#1d1d1f"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 3L5 8l5 5" />
              </svg>
            </button>
          )}

          {/* Next */}
          {index < maxIndex && (
            <button
              onClick={() => { next(); resetTimer(); }}
              aria-label="次へ"
              style={{
                position: "absolute",
                top: "50%",
                right: "-16px",
                transform: "translateY(-50%)",
                border: "none",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
                zIndex: 10,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="#1d1d1f"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          )}
        </div>

        {/* ドット */}
        {articles.length > visible && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6px",
              marginTop: "16px",
            }}
          >
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`スライド ${i + 1}`}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: i === index ? "#000" : "rgba(0,0,0,0.15)",
                  transform: i === index ? "scale(1.3)" : "scale(1)",
                  cursor: "pointer",
                  border: "none",
                  padding: 0,
                  transition: "background 0.25s ease, transform 0.25s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
