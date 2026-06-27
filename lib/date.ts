const JST = "Asia/Tokyo";

/** ISO文字列 / Date → "2026-06-27" （JST基準） */
export function formatDateJST(input: string | Date): string {
  if (!input) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(input));
}

/** ISO文字列 / Date → "2026年6月" （JST基準、"〜月から" 用） */
export function formatYearMonthJST(input: string | Date): string {
  if (!input) return "";
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: JST,
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date(input));
  const year  = parts.find((p) => p.type === "year")?.value  ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  return `${year}年${month}月`;
}

/** 今日の日付文字列 "2026-06-27" （JST基準） */
export function todayJST(): string {
  return formatDateJST(new Date());
}

/** 昨日の日付文字列 "2026-06-26" （JST基準） */
export function yesterdayJST(): string {
  return formatDateJST(new Date(Date.now() - 86_400_000));
}
