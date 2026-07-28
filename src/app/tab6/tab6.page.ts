import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { DashboardDataService } from '../services/dashboard-data.service';
import { MonthFilterService } from '../services/month-filter.service';
import { AgentStat, AgentUserStat, DailyPoint, Transaction } from '../models/dashboard.model';
import { compactAmount } from '../shared/pipes/amount-format.pipe';
import { computeAgentUserStat, computeAgents, computeDaily, filterByMonth } from '../shared/utils/aggregate';

@Component({
  selector: 'app-tab6',
  templateUrl: 'tab6.page.html',
  styleUrls: ['tab6.page.scss'],
  standalone: false,
})
export class Tab6Page implements OnInit {
  loading = true;
  days: DailyPoint[] = [];
  compactAmount = compactAmount;

  expandedDate: string | null = null;
  dayAgents: AgentStat[] = [];

  expandedDayAgent: string | null = null;
  dayAgentUsers: AgentUserStat[] = [];

  private monthScopedTx: Transaction[] = [];

  constructor(
    private dataSvc: DashboardDataService,
    private filterSvc: MonthFilterService
  ) {}

  ngOnInit(): void {
    combineLatest([this.dataSvc.getTransactions(), this.filterSvc.month$]).subscribe(([tx, month]) => {
      this.monthScopedTx = filterByMonth(tx, month);
      this.days = [...computeDaily(this.monthScopedTx)].reverse();
      this.expandedDate = null;
      this.dayAgents = [];
      this.expandedDayAgent = null;
      this.dayAgentUsers = [];
      this.loading = false;
    });
  }

  toggleDay(date: string): void {
    if (this.expandedDate === date) {
      this.expandedDate = null;
      this.dayAgents = [];
      this.expandedDayAgent = null;
      this.dayAgentUsers = [];
      return;
    }
    this.expandedDate = date;
    this.dayAgents = computeAgents(this.monthScopedTx.filter((t) => t.date === date));
    this.expandedDayAgent = null;
    this.dayAgentUsers = [];
  }

  toggleDayAgent(agent: string): void {
    if (this.expandedDayAgent === agent) {
      this.expandedDayAgent = null;
      this.dayAgentUsers = [];
      return;
    }
    this.expandedDayAgent = agent;
    const dayTx = this.monthScopedTx.filter((t) => t.date === this.expandedDate);
    const users = [...new Set(dayTx.filter((t) => t.agent === agent).map((t) => t.user))].sort();
    this.dayAgentUsers = users.map((u) => computeAgentUserStat(dayTx, agent, u));
  }

  maxDayTotal(): number {
    return this.days.reduce((m, d) => Math.max(m, d.total), 1);
  }
}
