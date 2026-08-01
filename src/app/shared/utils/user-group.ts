/**
 * Splits Hitit system users into three groups, checked against the SR
 * *code* (raw, pre agent-alias canonicalization - srName gets folded into
 * AL RAFDEEN for display the same way some of these codes do, which would
 * hide them from these checks if run on the canonicalized name instead):
 *
 * - "agent": external travel-agency staff selling tickets under a
 *   commercial agent account.
 * - "commercial": internal commercial-department accounts (Sales,
 *   Schedule, Revenue, Commercial) - kept separate from general staff
 *   per the business owner, even though they're also internal employees.
 * - "employee": everyone else internal - airport check-in stations,
 *   system admins, head office.
 */
const COMMERCIAL_SR_CODES = new Set(['SALES', 'SCHEDULE', 'REVENUE', 'COMMERCIAL']);
const EMPLOYEE_SR_CODES = new Set(['Hitit Admin', 'HEAD OFFICE CEO']);

export type UserGroup = 'agent' | 'commercial' | 'employee';

export function userGroup(srCode: string): UserGroup {
  if (COMMERCIAL_SR_CODES.has(srCode)) return 'commercial';
  if (EMPLOYEE_SR_CODES.has(srCode) || /station/i.test(srCode)) return 'employee';
  return 'agent';
}
