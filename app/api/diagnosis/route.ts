import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ServiceInput {
  id: string;
  name: string;
  slug: string;
  category: string | null;
}

interface Recommendation {
  slug: string;
  name: string;
  reason: string;
}

export async function POST(req: NextRequest) {
  const { answers, services } = await req.json().catch(() => ({})) as {
    answers: string[];
    services: ServiceInput[];
  };

  if (!Array.isArray(answers) || !Array.isArray(services)) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const answersText = answers.map((a, i) => `- 質問${i + 1}: ${a}`).join("\n");
  const servicesText = services
    .map((s) => `- ${s.name} (slug: ${s.slug}${s.category ? `, カテゴリ: ${s.category}` : ""})`)
    .join("\n");

  const userPrompt = `以下のユーザー回答を分析して最適なサービスを推薦してください。

ユーザーの回答:
${answersText}

利用可能なサービス一覧:
${servicesText}

以下のJSON形式のみで返してください（他のテキスト不要）:
{
  "recommendations": [
    { "slug": "netflix", "name": "Netflix", "reason": "理由を日本語で2〜3文" },
    { "slug": "spotify", "name": "Spotify", "reason": "理由を日本語で2〜3文" },
    { "slug": "youtube", "name": "Youtube", "reason": "理由を日本語で2〜3文" }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system: "あなたはサブスクリプションサービスの専門家です。",
      messages: [{ role: "user", content: userPrompt }],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // JSON部分だけ抽出
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "parse error" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as { recommendations: Recommendation[] };

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "api error" }, { status: 500 });
  }
}
