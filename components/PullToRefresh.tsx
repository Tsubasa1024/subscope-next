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

  if (pullDistance < 10) return null;

  const widthPct = Math.min(100, (pullDistance / 80) * 100);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${widthPct}%`,
        height: "3px",
        background: "#111111",
        zIndex: 9999,
        pointerEvents: "none",
        transition: "none",
      }}
    />
  );
}
