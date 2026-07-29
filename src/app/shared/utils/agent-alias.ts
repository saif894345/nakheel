/**
 * Some agent names in the source export refer to the same real-world agent
 * under a different account name (typo, second registered account, or a
 * sub-account of a master agent, per the business owner). Canonicalizing
 * here means every tab - charts, lists, top-ups, suspicious activity - sees
 * one merged agent instead of separate fragments, and its user list shows
 * every login from all merged accounts (still individually clickable).
 */
const AGENT_ALIASES: Record<string, string> = {
  INTRNET: 'INTERNET',
  'TAREEK OMRA': 'TAREEK ALOFK',

  // Per the business owner: every agent below is a sub-account of AL RAFDEEN
  // (TAREEK ALOFK and INTERNET are kept separate, as instructed).
  ALASEMAH: 'AL RAFDEEN',
  ALDHYAACO: 'AL RAFDEEN',
  ALHAEIN: 'AL RAFDEEN',
  ALJAZEERAHLAND: 'AL RAFDEEN',
  ALNAFH: 'AL RAFDEEN',
  ALOMARAA: 'AL RAFDEEN',
  AMARAJI: 'AL RAFDEEN',
  ARDALFAIROZ: 'AL RAFDEEN',
  AlFahim: 'AL RAFDEEN',
  Almeshwar: 'AL RAFDEEN',
  Almteen: 'AL RAFDEEN',
  AmwajAlsahil: 'AL RAFDEEN',
  BARAKATALYASEEN: 'AL RAFDEEN',
  'BEST CHOISE': 'AL RAFDEEN',
  'BGW STATION': 'AL RAFDEEN',
  COMMERCIAL: 'AL RAFDEEN',
  DARALRAHEM: 'AL RAFDEEN',
  EtanaTravel: 'AL RAFDEEN',
  Etijah: 'AL RAFDEEN',
  FLYLATNAS: 'AL RAFDEEN',
  'GSA OMRA': 'AL RAFDEEN',
  GULFPALACE: 'AL RAFDEEN',
  'HELI EXCEL': 'AL RAFDEEN',
  'Hitit Admin': 'AL RAFDEEN',
  JAWHARATALARDH: 'AL RAFDEEN',
  'MED STATION': 'AL RAFDEEN',
  NAJMATALJANOOB: 'AL RAFDEEN',
  NAKHLATBABIL: 'AL RAFDEEN',
  QASRALMARAYA: 'AL RAFDEEN',
  'REHLAT ALAMIA': 'AL RAFDEEN',
  REVENUE: 'AL RAFDEEN',
  RIHLATNOKHBA: 'AL RAFDEEN',
  RUKUNBUSTAN: 'AL RAFDEEN',
  'Rehlat Alsafari': 'AL RAFDEEN',
  RehlatAlsalateen: 'AL RAFDEEN',
  RuyatALSindibad: 'AL RAFDEEN',
  SALES: 'AL RAFDEEN',
  SCHEDULE: 'AL RAFDEEN',
  'SKY SAS': 'AL RAFDEEN',
  SafirAliraq: 'AL RAFDEEN',
  'TEST AGENT': 'AL RAFDEEN',
  'TRUST POINT': 'AL RAFDEEN',
  TheTerminal: 'AL RAFDEEN',
  UMALQ: 'AL RAFDEEN',
  alaseel: 'AL RAFDEEN',
  almadraj: 'AL RAFDEEN',
  ataaalkhaer: 'AL RAFDEEN',
  worldgate: 'AL RAFDEEN',
};

export function canonicalAgent(agent: string): string {
  return AGENT_ALIASES[agent] ?? agent;
}
