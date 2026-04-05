"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function LoginToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("toast") === "login_success") {
      setVisible(true);

      // URLからクエリパラメータを除去
      const params = new URLSearchParams(searchParams.toString());
      params.delete("toast");
      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });

      // 3秒後に非表示
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[400] flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white"
      style={{
        background: "#111",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        animation: "fadeInUp 0.25s ease",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="8" fill="#4ade80" />
        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      ログインしました！
    </div>
  );
}
