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
  netAmount: number;
  firstDate: string;
  lastDate: string;
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
