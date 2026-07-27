/**
 * Some agent names in the source export are typo'd duplicates of another
 * agent (confirmed by fuzzy-matching all agent names and checking the
 * underlying transactions). Canonicalizing here means every tab - charts,
 * lists, top-ups, suspicious activity - sees one merged agent instead of
 * two fragments.
 */
const AGENT_ALIASES: Record<string, string> = {
  INTRNET: 'INTERNET',
};

export function canonicalAgent(agent: string): string {
  return AGENT_ALIASES[agent] ?? agent;
}
