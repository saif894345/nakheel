import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { combineLatest } from 'rxjs';
import { DashboardDataService } from '../services/dashboard-data.service';
import { MonthFilterService } from '../services/month-filter.service';
import { Transaction } from '../models/dashboard.model';
import { filterByMonth } from '../shared/utils/aggregate';
import { agentNameAr } from '../shared/utils/agent-display-name';
import { downloadCsv } from '../shared/utils/csv-export';

const PAGE_SIZE = 30;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  loading = true;
  all: Transaction[] = [];
  monthScoped: Transaction[] = [];
  filtered: Transaction[] = [];
  visible: Transaction[] = [];

  searchTerm = '';
  statusFilter: 'all' | 'Approved' | 'Declined' = 'all';
  typeFilter = 'all';

  constructor(
    private dataSvc: DashboardDataService,
    private filterSvc: MonthFilterService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const status = qp.get('status');
    if (status === 'Approved' || status === 'Declined') {
      this.statusFilter = status;
    }

    combineLatest([this.dataSvc.getTransactions(), this.filterSvc.month$]).subscribe(
      ([tx, month]) => {
        this.all = [...tx].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
        this.monthScoped = filterByMonth(this.all, month);
        this.applyFilters();
        this.loading = false;
      }
    );
  }

  onSearch(ev: CustomEvent): void {
    this.searchTerm = (ev.detail as any).value || '';
    this.applyFilters();
  }

  setStatusFilter(status: 'all' | 'Approved' | 'Declined'): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  setTypeFilter(ev: CustomEvent): void {
    this.typeFilter = (ev.detail as any).value;
    this.applyFilters();
  }

  private applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filtered = this.monthScoped.filter((t) => {
      if (this.statusFilter !== 'all' && t.status !== this.statusFilter) return false;
      if (this.typeFilter !== 'all' && t.type !== this.typeFilter) return false;
      if (term) {
        const hay = `${t.pnr} ${t.agent} ${agentNameAr(t.agent)} ${t.user}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
    this.visible = this.filtered.slice(0, PAGE_SIZE);
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

  exportCsv(): void {
    const headers = [
      'رقم الحجز',
      'الوكيل',
      'المستخدم',
      'التاريخ',
      'الوقت',
      'المبلغ',
      'العملة',
      'النوع',
      'الحالة',
      'كود الخطأ',
      'رسالة الخطأ',
    ];
    const rows = this.filtered.map((t) => [
      t.pnr,
      agentNameAr(t.agent),
      t.user,
      t.date,
      t.time,
      t.amount,
      t.currency,
      this.typeLabel(t.type),
      t.status === 'Approved' ? 'مقبولة' : 'مرفوضة',
      t.errorCode,
      t.errMessage,
    ]);
    downloadCsv(`transactions-${Date.now()}.csv`, headers, rows);
  }
}
