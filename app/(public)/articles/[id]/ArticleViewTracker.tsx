"use client";

import { useEffect } from "react";

export default function ArticleViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: articleId }),
    }).catch(() => {});
  }, [articleId]);

  return null;
}
