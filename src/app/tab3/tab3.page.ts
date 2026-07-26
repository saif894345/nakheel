import { Component, OnInit } from '@angular/core';
import { DashboardDataService } from '../services/dashboard-data.service';
import { AgentStat } from '../models/dashboard.model';
import { compactAmount } from '../shared/pipes/amount-format.pipe';

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

  constructor(private dataSvc: DashboardDataService) {}

  ngOnInit(): void {
    this.dataSvc.getDashboardData().subscribe((data) => {
      this.all = data.agents;
      this.applyFilters();
      this.loading = false;
    });
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
      list = list.filter((a) => a.agent.toLowerCase().includes(this.searchTerm));
    }
    this.visible = [...list].sort((a, b) => b[this.sortKey] - a[this.sortKey]);
  }

  maxTotal(): number {
    return this.all.reduce((m, a) => Math.max(m, a.total), 1);
  }
}
