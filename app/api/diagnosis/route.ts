import { NextRequest, NextResponse } from "next/server";

interface AnswerItem {
  question: string;
  answer: string;
}

interface ServiceInput {
  name: string;
  slug: string;
  category: string;
}

interface Recommendation {
  slug: string;
  name: string;
  reason: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    answers: AnswerItem[];
    services: ServiceInput[];
  };

  const { answers, services } = body;

  if (!Array.isArray(answers) || !Array.isArray(services)) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const answersText = answers
    .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
    .join("\n\n");

  const servicesText = services
    .map((s) => `- ${s.name} (slug: ${s.slug})`)
    .join("\n");

  const userPrompt = `ユーザーの回答:
${answersText}

利用可能なサービス一覧:
${servicesText}

以下のJSON形式のみで返してください（マークダウン不要、JSONのみ）:
{"recommendations":[{"slug":"xxx","name":"xxx","reason":"日本語で2〜3文の推薦理由"}]}
上位3件を推薦してください。`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system:
          "あなたはサブスクリプションサービスの専門家です。ユーザーの回答を分析して最適なサービスを推薦してください。JSONのみ返してください。",
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "api error" }, { status: 500 });
    }

    const data = (await res.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const rawText =
      data.content[0]?.type === "text" ? data.content[0].text : "";

    // ```json ブロックがあれば除去
    const cleaned = rawText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "parse error" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      recommendations: Recommendation[];
    };

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "api error" }, { status: 500 });
  }
}
