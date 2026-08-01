/**
 * Splits Hitit system users into "agents" (external travel-agency staff who
 * sell tickets under a commercial agent account) vs "employees" (internal
 * Global Aviation / Hitit staff: airport check-in stations, system admins,
 * head office, and internal departments like Sales/Schedule/Revenue/
 * Commercial). Checked against the SR *code* (raw, pre agent-alias
 * canonicalization) - srName gets folded into AL RAFDEEN for display like
 * SALES/SCHEDULE/REVENUE/COMMERCIAL do, which would hide them from this
 * check if it ran on the canonicalized name instead.
 */
const EMPLOYEE_SR_CODES = new Set([
  'Hitit Admin',
  'HEAD OFFICE CEO',
  'SALES',
  'SCHEDULE',
  'REVENUE',
  'COMMERCIAL',
]);

export function isEmployeeSr(srCode: string): boolean {
  if (EMPLOYEE_SR_CODES.has(srCode)) return true;
  return /station/i.test(srCode);
}
