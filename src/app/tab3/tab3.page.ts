import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { DashboardDataService } from '../services/dashboard-data.service';
import { MonthFilterService } from '../services/month-filter.service';
import { AgentStat, AgentUserStat, DailyPoint, Transaction } from '../models/dashboard.model';
import { compactAmount } from '../shared/pipes/amount-format.pipe';
import { computeAgentUserStat, computeAgents, computeDaily, filterByMonth } from '../shared/utils/aggregate';
import { agentNameAr } from '../shared/utils/agent-display-name';
import { downloadCsv } from '../shared/utils/csv-export';

type SortKey = 'total' | 'amountIQD' | 'approvalRate';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
  loading = true;
  all: AgentStat[] = [];
  visible: AgentStat[] = [];
  searchTerm = '';
  sortKey: SortKey = 'total';
  compactAmount = compactAmount;

  expandedAgent: string | null = null;
  expandedUser: string | null = null;
  expandedStat?: AgentUserStat;
  userDaily: DailyPoint[] = [];

  expandedAgentDaily: string | null = null;
  agentDaily: DailyPoint[] = [];

  private monthScopedTx: Transaction[] = [];

  constructor(
    private dataSvc: DashboardDataService,
    private filterSvc: MonthFilterService
  ) {}

  ngOnInit(): void {
    combineLatest([this.dataSvc.getTransactions(), this.filterSvc.month$]).subscribe(
      ([tx, month]) => {
        this.monthScopedTx = filterByMonth(tx, month);
        this.all = computeAgents(this.monthScopedTx);
        this.applyFilters();
        this.expandedAgent = null;
        this.expandedUser = null;
        this.expandedStat = undefined;
        this.userDaily = [];
        this.expandedAgentDaily = null;
        this.agentDaily = [];
        this.loading = false;
      }
    );
  }

  onSearch(ev: CustomEvent): void {
    this.searchTerm = ((ev.detail as any).value || '').trim().toLowerCase();
    this.applyFilters();
  }

  setSort(key: SortKey): void {
    this.sortKey = key;
    this.applyFilters();
  }

  private applyFilters(): void {
    let list = this.all;
    if (this.searchTerm) {
      list = list.filter(
        (a) =>
          a.agent.toLowerCase().includes(this.searchTerm) ||
          agentNameAr(a.agent).includes(this.searchTerm) ||
          a.users.some((u) => u.toLowerCase().includes(this.searchTerm))
      );
    }
    this.visible = [...list].sort((a, b) => b[this.sortKey] - a[this.sortKey]);

    // If the search matched a specific user login, expand it immediately
    // so the answer ("how much did X add") is visible without an extra click.
    this.expandedAgent = null;
    this.expandedUser = null;
    this.expandedStat = undefined;
    this.userDaily = [];
    this.expandedAgentDaily = null;
    this.agentDaily = [];
    if (this.searchTerm) {
      for (const a of this.visible) {
        const matchedUser = a.users.find((u) => u.toLowerCase().includes(this.searchTerm));
        if (matchedUser) {
          this.expandedAgent = a.agent;
          this.expandedUser = matchedUser;
          this.expandedStat = computeAgentUserStat(this.monthScopedTx, a.agent, matchedUser);
          this.userDaily = this.dailyFor(a.agent, matchedUser);
          break;
        }
      }
    }
  }

  maxTotal(): number {
    return this.all.reduce((m, a) => Math.max(m, a.total), 1);
  }

  toggleUser(agent: string, user: string): void {
    if (this.expandedAgent === agent && this.expandedUser === user) {
      this.expandedAgent = null;
      this.expandedUser = null;
      this.expandedStat = undefined;
      this.userDaily = [];
      return;
    }
    this.expandedAgent = agent;
    this.expandedUser = user;
    this.expandedStat = computeAgentUserStat(this.monthScopedTx, agent, user);
    this.userDaily = this.dailyFor(agent, user);
  }

  toggleAgentDaily(agent: string): void {
    if (this.expandedAgentDaily === agent) {
      this.expandedAgentDaily = null;
      this.agentDaily = [];
      return;
    }
    this.expandedAgentDaily = agent;
    this.agentDaily = this.dailyFor(agent);
  }

  /** Last 14 active days, newest first, for the given agent (and optionally one of its users). */
  private dailyFor(agent: string, user?: string): DailyPoint[] {
    const rows = this.monthScopedTx.filter(
      (t) => t.agent === agent && (!user || t.user === user)
    );
    return computeDaily(rows).slice(-14).reverse();
  }

  exportCsv(): void {
    const headers = [
      'الوكيل',
      'إجمالي المعاملات',
      'مقبولة',
      'مرفوضة',
      'نسبة القبول %',
      'المبلغ (د.ع)',
      'المبلغ ($)',
      'المستخدمون',
    ];
    const rows = this.visible.map((a) => [
      agentNameAr(a.agent),
      a.total,
      a.approved,
      a.declined,
      a.approvalRate,
      a.amountIQD,
      a.amountUSD,
      a.users.join(' | '),
    ]);
    downloadCsv(`agents-${Date.now()}.csv`, headers, rows);
  }
}
