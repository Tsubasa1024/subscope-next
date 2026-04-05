"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const TOAST_CONFIG = {
  login_success:  { message: "ログインしました！",   icon: "#4ade80" },
  logout_success: { message: "ログアウトしました",   icon: "#94a3b8" },
} as const;

type ToastKey = keyof typeof TOAST_CONFIG;

export default function LoginToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [toast, setToast] = useState<ToastKey | null>(null);

  useEffect(() => {
    const key = searchParams.get("toast") as ToastKey | null;
    if (key && key in TOAST_CONFIG) {
      setToast(key);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("toast");
      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });

      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!toast) return null;

  const config = TOAST_CONFIG[toast];

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
        <circle cx="8" cy="8" r="8" fill={config.icon} />
        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {config.message}
    </div>
  );
}
