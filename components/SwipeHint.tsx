"use client";

import { useEffect, useRef, useState } from "react";

const LS_KEY = "subscope_swipe_hint_seen";

interface Props {
  trackRef: React.RefObject<HTMLDivElement | null>;
}

export default function SwipeHint({ trackRef }: Props) {
  const [show, setShow] = useState(false);
  const dismissed = useRef(false);

  // クライアントでのみ localStorage を確認してから表示
  useEffect(() => {
    try {
      if (!localStorage.getItem(LS_KEY)) setShow(true);
    } catch {
      // localStorage 使用不可の場合は表示しない
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const track = trackRef.current;
    if (!track) return;

    const dismiss = () => {
      if (dismissed.current) return;
      dismissed.current = true;
      setShow(false);
      try { localStorage.setItem(LS_KEY, "1"); } catch {}
    };

    const timer = setTimeout(dismiss, 6000);
    track.addEventListener("scroll",      dismiss, { passive: true, once: true });
    track.addEventListener("pointerdown", dismiss, { passive: true, once: true });
    track.addEventListener("touchstart",  dismiss, { passive: true, once: true });

    return () => {
      clearTimeout(timer);
      track.removeEventListener("scroll",      dismiss);
      track.removeEventListener("pointerdown", dismiss);
      track.removeEventListener("touchstart",  dismiss);
    };
  }, [show, trackRef]);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: "10px",
        right: "2px",
        display: "flex",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {([0, 1, 2] as const).map((i) => (
        <svg
          key={i}
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5eead4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            marginLeft: i > 0 ? "-6px" : "0",
            animation: `chev 1.4s ease ${i * 0.18}s infinite`,
          }}
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      ))}
    </div>
  );
}
