import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { DashboardDataService } from '../services/dashboard-data.service';
import { MonthFilterService } from '../services/month-filter.service';
import { AgentSalesReportService } from '../services/agent-sales-report.service';
import { AgentSalesReportRow, CashTopup, Transaction } from '../models/dashboard.model';
import { compactAmount } from '../shared/pipes/amount-format.pipe';
import { computeCashTopups, filterByMonth } from '../shared/utils/aggregate';
import { agentNameAr } from '../shared/utils/agent-display-name';

interface EmployeeGroup {
  employee: string;
  agents: CashTopup[];
  totalCount: number;
  totalGrossAmount: number;
  totalNetAmount: number;
  firstDate: string;
  lastDate: string;
}

interface ReportPeriod {
  key: string;
  start: string;
  end: string;
  label: string;
}

interface AgentReportGroup {
  agent: string;
  price: number;
  additionalFees: number;
  taxes: number;
  commission: number;
  cash: number;
  creditCard: number;
  fromBalance: number;
}

type Category = 'cash' | 'report';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit {
  loading = true;
  category: Category = 'cash';
  all: EmployeeGroup[] = [];
  visible: EmployeeGroup[] = [];
  searchTerm = '';

  totalOps = 0;
  totalGrossAmount = 0;
  totalNetAmount = 0;
  totalEmployees = 0;

  reportPeriods: ReportPeriod[] = [];
  selectedPeriod = 'all';
  private allReportRows: AgentSalesReportRow[] = [];
  reportGroups: AgentReportGroup[] = [];
  visibleReportGroups: AgentReportGroup[] = [];
  reportTotals: AgentReportGroup = this.emptyGroup('الإجمالي');

  private monthScopedTx: Transaction[] = [];
  expandedEmployee: string | null = null;
  compactAmount = compactAmount;

  constructor(
    private dataSvc: DashboardDataService,
    private filterSvc: MonthFilterService,
    private reportSvc: AgentSalesReportService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.dataSvc.getTransactions(),
      this.filterSvc.month$,
      this.reportSvc.getRows(),
    ]).subscribe(([tx, month, reportRows]) => {
      this.monthScopedTx = filterByMonth(tx, month);
      const cashTopups = computeCashTopups(this.monthScopedTx);
      this.all = this.groupByEmployee(cashTopups);
      this.totalOps = cashTopups.reduce((s, c) => s + c.count, 0);
      this.totalGrossAmount = cashTopups.reduce((s, c) => s + c.grossAmount, 0);
      this.totalNetAmount = cashTopups.reduce((s, c) => s + c.netAmount, 0);
      this.totalEmployees = this.all.length;

      this.allReportRows = reportRows;
      this.reportPeriods = this.buildPeriods(reportRows);
      this.rebuildReportGroups();

      this.applyFilters();
      this.loading = false;
    });
  }

  setCategory(cat: Category): void {
    this.category = cat;
    this.applyFilters();
  }

  setPeriod(period: string): void {
    this.selectedPeriod = period;
    this.rebuildReportGroups();
    this.applyFilters();
  }

  private buildPeriods(rows: AgentSalesReportRow[]): ReportPeriod[] {
    const map = new Map<string, ReportPeriod>();
    for (const r of rows) {
      const key = `${r.periodStart}_${r.periodEnd}`;
      if (!map.has(key)) {
        map.set(key, { key, start: r.periodStart, end: r.periodEnd, label: `${r.periodStart} → ${r.periodEnd}` });
      }
    }
    return [...map.values()].sort((a, b) => a.start.localeCompare(b.start));
  }

  private emptyGroup(agent: string): AgentReportGroup {
    return {
      agent,
      price: 0,
      additionalFees: 0,
      taxes: 0,
      commission: 0,
      cash: 0,
      creditCard: 0,
      fromBalance: 0,
    };
  }

  private rebuildReportGroups(): void {
    const rows =
      this.selectedPeriod === 'all'
        ? this.allReportRows
        : this.allReportRows.filter((r) => `${r.periodStart}_${r.periodEnd}` === this.selectedPeriod);

    const map = new Map<string, AgentReportGroup>();
    for (const r of rows) {
      let g = map.get(r.agent);
      if (!g) {
        g = this.emptyGroup(r.agent);
        map.set(r.agent, g);
      }
      g.price += r.price;
      g.additionalFees += r.additionalFees;
      g.taxes += r.taxes;
      g.commission += r.commission;
      g.cash += r.cash;
      g.creditCard += r.creditCard;
      g.fromBalance += r.fromBalance;
    }

    this.reportGroups = [...map.values()].sort((a, b) => b.price - a.price);

    const totals = this.emptyGroup('الإجمالي');
    for (const g of this.reportGroups) {
      totals.price += g.price;
      totals.additionalFees += g.additionalFees;
      totals.taxes += g.taxes;
      totals.commission += g.commission;
      totals.cash += g.cash;
      totals.creditCard += g.creditCard;
      totals.fromBalance += g.fromBalance;
    }
    this.reportTotals = totals;
  }

  private groupByEmployee(rows: CashTopup[]): EmployeeGroup[] {
    const map = new Map<string, EmployeeGroup>();
    for (const r of rows) {
      let g = map.get(r.employee);
      if (!g) {
        g = {
          employee: r.employee,
          agents: [],
          totalCount: 0,
          totalGrossAmount: 0,
          totalNetAmount: 0,
          firstDate: r.firstDate,
          lastDate: r.lastDate,
        };
        map.set(r.employee, g);
      }
      g.agents.push(r);
      g.totalCount += r.count;
      g.totalGrossAmount += r.grossAmount;
      g.totalNetAmount += r.netAmount;
      if (r.firstDate < g.firstDate) g.firstDate = r.firstDate;
      if (r.lastDate > g.lastDate) g.lastDate = r.lastDate;
    }
    return [...map.values()].sort((a, b) => b.totalCount - a.totalCount);
  }

  onSearch(ev: CustomEvent): void {
    this.searchTerm = ((ev.detail as any).value || '').trim().toLowerCase();
    this.applyFilters();
  }

  private applyFilters(): void {
    if (!this.searchTerm) {
      this.visible = this.all;
      this.visibleReportGroups = this.reportGroups;
      return;
    }
    this.visible = this.all.filter(
      (g) =>
        g.employee.toLowerCase().includes(this.searchTerm) ||
        g.agents.some(
          (a) =>
            a.agent.toLowerCase().includes(this.searchTerm) ||
            agentNameAr(a.agent).includes(this.searchTerm)
        )
    );
    this.visibleReportGroups = this.reportGroups.filter(
      (g) =>
        g.agent.toLowerCase().includes(this.searchTerm) ||
        agentNameAr(g.agent).includes(this.searchTerm)
    );
  }

  toggleExpand(employee: string): void {
    this.expandedEmployee = this.expandedEmployee === employee ? null : employee;
  }

  opsFor(employee: string): Transaction[] {
    return this.monthScopedTx
      .filter((t) => t.vpos === 'CASH' && t.user === employee)
      .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  }

  maxCount(): number {
    return this.all.reduce((m, g) => Math.max(m, g.totalCount), 1);
  }

  maxPrice(): number {
    return this.reportGroups.reduce((m, g) => Math.max(m, g.price), 1);
  }

  typeLabel(t: string): string {
    const map: Record<string, string> = { Auth: 'شحن رصيد', Void: 'إلغاء شحن', Credit: 'استرجاع' };
    return map[t] || t;
  }
}
