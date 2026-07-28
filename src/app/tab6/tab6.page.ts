import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { DashboardDataService } from '../services/dashboard-data.service';
import { Transaction } from '../models/dashboard.model';
import { compactAmount } from '../shared/pipes/amount-format.pipe';
import { getLatestDates } from '../shared/utils/aggregate';
import { agentNameAr } from '../shared/utils/agent-display-name';

const PAGE_SIZE = 25;

interface DayStats {
  total: number;
  approved: number;
  declined: number;
  amountIQD: number;
}

@Component({
  selector: 'app-tab6',
  templateUrl: 'tab6.page.html',
  styleUrls: ['tab6.page.scss'],
  standalone: false,
})
export class Tab6Page implements OnInit {
  loading = true;
  compactAmount = compactAmount;

  selectedDate = '';
  dayStats: DayStats = { total: 0, approved: 0, declined: 0, amountIQD: 0 };

  searchTerm = '';
  statusFilter: 'all' | 'Approved' | 'Declined' = 'all';
  expandedKey: string | null = null;

  filtered: Transaction[] = [];
  visible: Transaction[] = [];

  private allTx: Transaction[] = [];
  private dayTx: Transaction[] = [];

  constructor(private dataSvc: DashboardDataService) {}

  ngOnInit(): void {
    this.dataSvc.getTransactions().subscribe((tx) => {
      this.allTx = tx;
      this.selectedDate = getLatestDates(tx, 1)[0] || '';
      this.applyDay();
      this.loading = false;
    });
  }

  onSearch(ev: CustomEvent): void {
    this.searchTerm = ((ev.detail as any).value || '').trim().toLowerCase();
    this.applyFilters();
  }

  setStatusFilter(status: 'all' | 'Approved' | 'Declined'): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  toggleExpand(t: Transaction): void {
    const key = this.rowKey(t);
    this.expandedKey = this.expandedKey === key ? null : key;
  }

  rowKey(t: Transaction): string {
    return `${t.pnr}|${t.time}|${t.amount}|${t.type}`;
  }

  loadMore(ev: Event): void {
    const nextLen = this.visible.length + PAGE_SIZE;
    this.visible = this.filtered.slice(0, nextLen);
    (ev as InfiniteScrollCustomEvent).target.complete();
  }

  typeLabel(t: string): string {
    const map: Record<string, string> = { Auth: 'دفع', Void: 'إلغاء', Credit: 'استرجاع' };
    return map[t] || t;
  }

  private applyDay(): void {
    const rows = this.allTx.filter((t) => t.date === this.selectedDate);
    this.dayTx = [...rows].sort((a, b) => (a.time < b.time ? 1 : -1));

    const approved = this.dayTx.filter((t) => t.status === 'Approved');
    this.dayStats = {
      total: this.dayTx.length,
      approved: approved.length,
      declined: this.dayTx.length - approved.length,
      amountIQD: this.dayTx
        .filter((t) => t.type === 'Auth' && t.status === 'Approved' && t.currency === 'IQD')
        .reduce((s, t) => s + t.amount, 0),
    };

    this.applyFilters();
  }

  private applyFilters(): void {
    const term = this.searchTerm;
    this.filtered = this.dayTx.filter((t) => {
      if (this.statusFilter !== 'all' && t.status !== this.statusFilter) return false;
      if (term) {
        const hay = `${t.pnr} ${t.agent} ${agentNameAr(t.agent)} ${t.user}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
    this.visible = this.filtered.slice(0, PAGE_SIZE);
  }
}
