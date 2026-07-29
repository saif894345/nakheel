/**
 * Arabic display names shown everywhere in the UI in place of the raw
 * account name. Display-only - never used for aggregation, search keys,
 * or the underlying agent field, so canonicalization/dedup stay untouched.
 */
const AGENT_NAME_AR: Record<string, string> = {
  'AL RAFDEEN': 'الرافدين',
  'TAREEK ALOFK': 'طريق الأفق',
  INTERNET: 'الإنترنت',
};

export function agentNameAr(agent: string): string {
  return AGENT_NAME_AR[agent] ?? agent;
}
