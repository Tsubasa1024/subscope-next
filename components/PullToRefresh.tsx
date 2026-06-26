"use client";

import { useEffect, useRef, useState } from "react";

export default function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const pullDistanceRef = useRef(0);
  const startYRef = useRef<number | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(display-mode: standalone)").matches) return;

    function onTouchStart(e: TouchEvent) {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      if (scrollTop === 0) {
        startYRef.current = e.touches[0].clientY;
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (startYRef.current === null) return;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta > 0 && scrollTop === 0) {
        pullDistanceRef.current = delta;
        setPullDistance(delta);
        if (delta > 10) e.preventDefault();
      } else {
        startYRef.current = null;
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    }

    function onTouchEnd() {
      if (pullDistanceRef.current >= 80) {
        window.location.reload();
      } else {
        startYRef.current = null;
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  if (pullDistance < 60) return null;

  const translateY = Math.min(0, pullDistance - 80);
  const triggered = pullDistance >= 80;

  return (
    <>
      <style>{`
        @keyframes ptr-spin {
          to { transform: rotate(360deg); }
        }
        .ptr-spinning {
          animation: ptr-spin 0.7s linear infinite;
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          top: "8px",
          left: "50%",
          transform: `translate(-50%, ${translateY}px)`,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            className={triggered ? "ptr-spinning" : ""}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#555555"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 4v6h6" />
            <path d="M3.51 15a9 9 0 1 0 .49-3" />
          </svg>
        </div>
      </div>
    </>
  );
}
