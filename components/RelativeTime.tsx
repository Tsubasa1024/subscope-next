"use client";

import { useEffect, useState } from "react";
import { formatDateJST, formatRelativeTime } from "@/lib/date";

/**
 * 相対時刻（"3時間前"）表示。
 * ISR ページではサーバー計算の相対時刻がキャッシュに焼き込まれて古くなるため、
 * SSR/初回描画では絶対日付を出し、マウント後に相対時刻へ差し替える
 * （ハイドレーション不一致も起きない）。
 */
export default function RelativeTime({ date }: { date?: string }) {
  const absolute = date ? formatDateJST(date) : "";
  const [label, setLabel] = useState(absolute);

  useEffect(() => {
    if (date) setLabel(formatRelativeTime(date));
  }, [date]);

  if (!date) return null;
  return <time dateTime={date}>{label}</time>;
}
