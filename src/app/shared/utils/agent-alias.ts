/**
 * Some agent names in the source export refer to the same real-world agent
 * under a different account name (typo, or a second registered account).
 * Canonicalizing here means every tab - charts, lists, top-ups, suspicious
 * activity - sees one merged agent instead of separate fragments, and its
 * user list shows every login from all merged accounts.
 */
const AGENT_ALIASES: Record<string, string> = {
  INTRNET: 'INTERNET',
  'TAREEK OMRA': 'TAREEK ALOFK',
};

export function canonicalAgent(agent: string): string {
  return AGENT_ALIASES[agent] ?? agent;
}
