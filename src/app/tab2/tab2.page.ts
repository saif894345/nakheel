import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { DashboardDataService } from '../services/dashboard-data.service';
import { Transaction } from '../models/dashboard.model';

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
  filtered: Transaction[] = [];
  visible: Transaction[] = [];

  searchTerm = '';
  statusFilter: 'all' | 'Approved' | 'Declined' = 'all';
  typeFilter = 'all';

  constructor(private dataSvc: DashboardDataService) {}

  ngOnInit(): void {
    this.dataSvc.getTransactions().subscribe((tx) => {
      this.all = [...tx].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
      this.applyFilters();
      this.loading = false;
    });
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
    this.filtered = this.all.filter((t) => {
      if (this.statusFilter !== 'all' && t.status !== this.statusFilter) return false;
      if (this.typeFilter !== 'all' && t.type !== this.typeFilter) return false;
      if (term) {
        const hay = `${t.pnr} ${t.agent} ${t.user}`.toLowerCase();
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
}
