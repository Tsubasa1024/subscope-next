export const FEATURES = {
  subscription: process.env.NEXT_PUBLIC_FEATURE_SUBSCRIPTION === 'true',
  aiDiagnosis:  process.env.NEXT_PUBLIC_FEATURE_AI_DIAGNOSIS === 'true',
  comments:     process.env.NEXT_PUBLIC_FEATURE_COMMENTS === 'true',
  tieredSaves:  process.env.NEXT_PUBLIC_FEATURE_TIERED_SAVES === 'true',
} as const;
