import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DashboardDataService } from '../services/dashboard-data.service';
import { CashTopup, Transaction } from '../models/dashboard.model';
import { compactAmount } from '../shared/pipes/amount-format.pipe';

interface EmployeeGroup {
  employee: string;
  agents: CashTopup[];
  totalCount: number;
  totalAmount: number;
  firstDate: string;
  lastDate: string;
}

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit {
  loading = true;
  all: EmployeeGroup[] = [];
  visible: EmployeeGroup[] = [];
  searchTerm = '';

  totalOps = 0;
  totalAmount = 0;
  totalEmployees = 0;

  private transactions: Transaction[] = [];
  expandedEmployee: string | null = null;
  compactAmount = compactAmount;

  constructor(private dataSvc: DashboardDataService) {}

  ngOnInit(): void {
    forkJoin({
      data: this.dataSvc.getDashboardData(),
      tx: this.dataSvc.getTransactions(),
    }).subscribe(({ data, tx }) => {
      this.transactions = tx;
      this.all = this.groupByEmployee(data.cashTopups);
      this.totalOps = data.cashTopups.reduce((s, c) => s + c.count, 0);
      this.totalAmount = data.cashTopups.reduce((s, c) => s + c.netAmount, 0);
      this.totalEmployees = this.all.length;
      this.applyFilters();
      this.loading = false;
    });
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
          totalAmount: 0,
          firstDate: r.firstDate,
          lastDate: r.lastDate,
        };
        map.set(r.employee, g);
      }
      g.agents.push(r);
      g.totalCount += r.count;
      g.totalAmount += r.netAmount;
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
      return;
    }
    this.visible = this.all.filter(
      (g) =>
        g.employee.toLowerCase().includes(this.searchTerm) ||
        g.agents.some((a) => a.agent.toLowerCase().includes(this.searchTerm))
    );
  }

  toggleExpand(employee: string): void {
    this.expandedEmployee = this.expandedEmployee === employee ? null : employee;
  }

  opsFor(employee: string): Transaction[] {
    return this.transactions
      .filter((t) => t.vpos === 'CASH' && t.user === employee)
      .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  }

  maxCount(): number {
    return this.all.reduce((m, g) => Math.max(m, g.totalCount), 1);
  }
}
