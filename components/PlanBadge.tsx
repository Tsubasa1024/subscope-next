"use client";

interface Props {
  plan: "free" | "standard" | "pro";
}

export default function PlanBadge({ plan }: Props) {
  if (plan === "free") return null;

  const isSilver = plan === "standard";
  const gradientId = isSilver ? "planbadge-silver" : "planbadge-gold";
  const label = isSilver ? "Standardプラン" : "Proプラン";
  const letter = isSilver ? "S" : "P";
  const colorTop = isSilver ? "#d4d4d4" : "#FFD700";
  const colorBot = isSilver ? "#9e9e9e" : "#FFA500";

  // Regular hexagon at 20×20, flat-top orientation
  const hex = "10,1 18.66,5.5 18.66,14.5 10,19 1.34,14.5 1.34,5.5";

  return (
    <span
      title={label}
      style={{ display: "inline-flex", alignItems: "center", width: 20, height: 20, flexShrink: 0 }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colorTop} />
            <stop offset="100%" stopColor={colorBot} />
          </linearGradient>
        </defs>
        <polygon points={hex} fill={`url(#${gradientId})`} />
        <text
          x="10"
          y="14"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill="#fff"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {letter}
        </text>
      </svg>
    </span>
  );
}
