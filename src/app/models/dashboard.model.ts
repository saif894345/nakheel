export interface DashboardKpis {
  totalTransactions: number;
  approvedCount: number;
  declinedCount: number;
  approvalRate: number;
  authCount: number;
  voidCount: number;
  creditCount: number;
  uniqueAgents: number;
  uniqueUsers: number;
  dateFrom: string;
  dateTo: string;
  approvedAmountByCcy: Record<string, number>;
  declinedAmountByCcy: Record<string, number>;
  creditAmountByCcy: Record<string, number>;
  totalAmountByCcy: Record<string, number>;
}

export interface DailyPoint {
  date: string;
  total: number;
  approved: number;
  declined: number;
  amountIQD: number;
  amountUSD: number;
}

export interface AgentStat {
  agent: string;
  total: number;
  approved: number;
  declined: number;
  approvalRate: number;
  amountIQD: number;
  amountUSD: number;
  users: string[];
}

export interface AgentUserStat {
  agent: string;
  user: string;
  total: number;
  approved: number;
  declined: number;
  approvalRate: number;
  amountIQD: number;
  amountUSD: number;
}

export interface VposStat {
  vpos: string;
  total: number;
  approved: number;
  approvalRate: number;
}

export interface TypeStat {
  type: string;
  total: number;
  approved: number;
  declined: number;
}

export interface ErrorStat {
  code: string;
  label: string;
  count: number;
}

export interface CashTopup {
  employee: string;
  agent: string;
  count: number;
  /** Sum of actual charges (Auth) - the real amount used, unaffected by later cancellations. */
  grossAmount: number;
  /** Sum of all amounts including Void reversals - what's left after cancellations net out. */
  netAmount: number;
  firstDate: string;
  lastDate: string;
}

export interface ReissueFlag {
  pnr: string;
  agent: string;
  user: string;
  amount: number;
  currency: string;
  voidTime: string;
  authTime: string;
  gapSeconds: number;
}

export interface BurstFlag {
  agent: string;
  user: string;
  date: string;
  startTime: string;
  endTime: string;
  count: number;
}

export interface LargeAmountFlag {
  pnr: string;
  agent: string;
  user: string;
  amount: number;
  currency: string;
  agentAverage: number;
  multiple: number;
  date: string;
  time: string;
}

export interface Transaction {
  pnr: string;
  agent: string;
  user: string;
  date: string;
  time: string;
  amount: number;
  currency: string;
  type: string;
  vpos: string;
  status: string;
  errorCode: string;
  errMessage: string;
}
