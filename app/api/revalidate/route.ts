import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

// microCMS Webhook 受け口。
// コンテンツの追加・更新・削除時に ISR キャッシュを即時再検証する。
// 署名は microCMS が送る X-MICROCMS-Signature（HMAC-SHA256 hex）で検証する。

type MicroCMSWebhookBody = {
  service?: string;
  api?: string;
  id?: string | null;
  type?: string;
  contents?: {
    old?: { id?: string } | null;
    new?: { id?: string } | null;
  } | null;
};

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

export async function POST(request: Request) {
  const secret = process.env.MICROCMS_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[revalidate] MICROCMS_WEBHOOK_SECRET is not set");
    return NextResponse.json({ message: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("x-microcms-signature");

  if (!verifySignature(body, signature, secret)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  let payload: MicroCMSWebhookBody;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const contentId =
    payload.id ?? payload.contents?.new?.id ?? payload.contents?.old?.id ?? null;

  // トップ・一覧・ランキングは記事の増減や更新の影響を受けるため常に再検証
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/ranking");
  if (contentId) {
    revalidatePath(`/articles/${contentId}`);
  }

  return NextResponse.json({
    revalidated: true,
    contentId,
    now: Date.now(),
  });
}
