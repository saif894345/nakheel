/**
 * Splits Hitit system users into "agents" (external travel-agency staff who
 * sell tickets under a commercial agent account) vs "employees" (internal
 * Global Aviation / Hitit staff: airport check-in stations, system admins,
 * head office). Based on the SR Name (post agent-alias canonicalization) -
 * the small set below covers every non-agent SR Name found in the export;
 * everything else is a real commercial agent account.
 */
const EMPLOYEE_SR_NAMES = new Set(['Hitit Admin', 'HEAD OFFICE CEO']);

export function isEmployeeSr(srName: string): boolean {
  if (EMPLOYEE_SR_NAMES.has(srName)) return true;
  return /station/i.test(srName);
}
