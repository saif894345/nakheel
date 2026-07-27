import {
  AgentStat,
  CashTopup,
  DailyPoint,
  DashboardKpis,
  ErrorStat,
  Transaction,
  TypeStat,
  VposStat,
} from '../../models/dashboard.model';

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const ERROR_LABELS: Record<string, string> = {
  ERR20280: 'رصيد غير كافٍ لإتمام العملية',
  ERR_P56: 'الاسترجاع غير مدعوم',
  '-1': 'خطأ عام / تجاوز الحد المسموح',
  ERR20281: 'المستخدم غير مصرح له بهذه الفاتورة',
};

function round(value: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

export interface MonthOption {
  value: string;
  label: string;
  count: number;
}

export function getAvailableMonths(transactions: Transaction[]): MonthOption[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    const key = t.date.slice(0, 7);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([key, count]) => {
      const [y, m] = key.split('-');
      return { value: key, label: `${ARABIC_MONTHS[parseInt(m, 10) - 1]} ${y}`, count };
    });
}

export function filterByMonth(transactions: Transaction[], month: string): Transaction[] {
  if (!month || month === 'all') return transactions;
  return transactions.filter((t) => t.date.slice(0, 7) === month);
}

function sumByCcy(rows: Transaction[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) out[r.currency] = (out[r.currency] || 0) + r.amount;
  return out;
}

export function computeKpis(tx: Transaction[]): DashboardKpis {
  const total = tx.length;
  const approved = tx.filter((t) => t.status === 'Approved');
  const declined = tx.filter((t) => t.status === 'Declined');
  const auth = tx.filter((t) => t.type === 'Auth');
  const voidTx = tx.filter((t) => t.type === 'Void');
  const credit = tx.filter((t) => t.type === 'Credit');
  const approvedAuth = tx.filter((t) => t.type === 'Auth' && t.status === 'Approved');
  const declinedAuth = tx.filter((t) => t.type === 'Auth' && t.status === 'Declined');
  const approvedCredit = tx.filter((t) => t.type === 'Credit' && t.status === 'Approved');
  const dates = tx.map((t) => t.date).sort();

  return {
    totalTransactions: total,
    approvedCount: approved.length,
    declinedCount: declined.length,
    approvalRate: total ? round((approved.length / total) * 100, 2) : 0,
    authCount: auth.length,
    voidCount: voidTx.length,
    creditCount: credit.length,
    uniqueAgents: new Set(tx.map((t) => t.agent)).size,
    uniqueUsers: new Set(tx.map((t) => t.user)).size,
    dateFrom: dates[0] || '',
    dateTo: dates[dates.length - 1] || '',
    approvedAmountByCcy: sumByCcy(approvedAuth),
    declinedAmountByCcy: sumByCcy(declinedAuth),
    creditAmountByCcy: sumByCcy(approvedCredit),
    totalAmountByCcy: sumByCcy(approvedAuth),
  };
}

export function computeDaily(tx: Transaction[]): DailyPoint[] {
  const map = new Map<string, DailyPoint>();
  for (const t of tx) {
    let d = map.get(t.date);
    if (!d) {
      d = { date: t.date, total: 0, approved: 0, declined: 0, amountIQD: 0, amountUSD: 0 };
      map.set(t.date, d);
    }
    d.total++;
    if (t.status === 'Approved') d.approved++;
    if (t.status === 'Declined') d.declined++;
    if (t.type === 'Auth' && t.status === 'Approved') {
      if (t.currency === 'IQD') d.amountIQD += t.amount;
      if (t.currency === 'USD') d.amountUSD += t.amount;
    }
  }
  return [...map.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function computeAgents(tx: Transaction[]): AgentStat[] {
  const map = new Map<string, AgentStat>();
  for (const t of tx) {
    let a = map.get(t.agent);
    if (!a) {
      a = { agent: t.agent, total: 0, approved: 0, declined: 0, approvalRate: 0, amountIQD: 0, amountUSD: 0 };
      map.set(t.agent, a);
    }
    a.total++;
    if (t.status === 'Approved') a.approved++;
    if (t.status === 'Declined') a.declined++;
    if (t.type === 'Auth' && t.status === 'Approved') {
      if (t.currency === 'IQD') a.amountIQD += t.amount;
      if (t.currency === 'USD') a.amountUSD += t.amount;
    }
  }
  const list = [...map.values()];
  for (const a of list) a.approvalRate = a.total ? round((a.approved / a.total) * 100, 1) : 0;
  return list.sort((x, y) => y.total - x.total);
}

export function computeVpos(tx: Transaction[]): VposStat[] {
  const map = new Map<string, VposStat>();
  for (const t of tx) {
    let v = map.get(t.vpos);
    if (!v) {
      v = { vpos: t.vpos, total: 0, approved: 0, approvalRate: 0 };
      map.set(t.vpos, v);
    }
    v.total++;
    if (t.status === 'Approved') v.approved++;
  }
  const list = [...map.values()];
  for (const v of list) v.approvalRate = v.total ? round((v.approved / v.total) * 100, 1) : 0;
  return list.sort((a, b) => b.total - a.total);
}

export function computeTypeBreakdown(tx: Transaction[]): TypeStat[] {
  const map = new Map<string, TypeStat>();
  for (const t of tx) {
    let x = map.get(t.type);
    if (!x) {
      x = { type: t.type, total: 0, approved: 0, declined: 0 };
      map.set(t.type, x);
    }
    x.total++;
    if (t.status === 'Approved') x.approved++;
    else x.declined++;
  }
  return [...map.values()];
}

export function computeErrors(tx: Transaction[]): ErrorStat[] {
  const declined = tx.filter((t) => t.status === 'Declined');
  const map = new Map<string, ErrorStat>();
  for (const t of declined) {
    const code = t.errorCode || 'غير محدد';
    let e = map.get(code);
    if (!e) {
      e = { code, label: ERROR_LABELS[code] || code, count: 0 };
      map.set(code, e);
    }
    e.count++;
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function computeCashTopups(tx: Transaction[]): CashTopup[] {
  const cash = tx.filter((t) => t.vpos === 'CASH');
  const map = new Map<string, CashTopup>();
  for (const t of cash) {
    const key = t.user + '|' + t.agent;
    let c = map.get(key);
    if (!c) {
      c = { employee: t.user, agent: t.agent, count: 0, netAmount: 0, firstDate: t.date, lastDate: t.date };
      map.set(key, c);
    }
    c.count++;
    c.netAmount += t.amount;
    if (t.date < c.firstDate) c.firstDate = t.date;
    if (t.date > c.lastDate) c.lastDate = t.date;
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}
