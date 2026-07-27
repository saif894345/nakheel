import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { DashboardDataService } from '../services/dashboard-data.service';
import { MonthFilterService } from '../services/month-filter.service';
import { BurstFlag, LargeAmountFlag, ReissueFlag } from '../models/dashboard.model';
import { compactAmount } from '../shared/pipes/amount-format.pipe';
import {
  computeBursts,
  computeLargeAmountOutliers,
  computeReissues,
  filterByMonth,
} from '../shared/utils/aggregate';

type Category = 'reissue' | 'burst' | 'large';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  standalone: false,
})
export class Tab5Page implements OnInit {
  loading = true;
  category: Category = 'reissue';
  searchTerm = '';

  allReissues: ReissueFlag[] = [];
  allBursts: BurstFlag[] = [];
  allLarge: LargeAmountFlag[] = [];

  visibleReissues: ReissueFlag[] = [];
  visibleBursts: BurstFlag[] = [];
  visibleLarge: LargeAmountFlag[] = [];

  compactAmount = compactAmount;

  constructor(
    private dataSvc: DashboardDataService,
    private filterSvc: MonthFilterService
  ) {}

  ngOnInit(): void {
    combineLatest([this.dataSvc.getTransactions(), this.filterSvc.month$]).subscribe(
      ([tx, month]) => {
        const scoped = filterByMonth(tx, month);
        this.allReissues = computeReissues(scoped);
        this.allBursts = computeBursts(scoped);
        this.allLarge = computeLargeAmountOutliers(scoped);
        this.applyFilters();
        this.loading = false;
      }
    );
  }

  setCategory(cat: Category): void {
    this.category = cat;
    this.applyFilters();
  }

  onSearch(ev: CustomEvent): void {
    this.searchTerm = ((ev.detail as any).value || '').trim().toLowerCase();
    this.applyFilters();
  }

  private applyFilters(): void {
    const term = this.searchTerm;
    this.visibleReissues = !term
      ? this.allReissues
      : this.allReissues.filter(
          (r) => r.agent.toLowerCase().includes(term) || r.user.toLowerCase().includes(term)
        );
    this.visibleBursts = !term
      ? this.allBursts
      : this.allBursts.filter(
          (b) => b.agent.toLowerCase().includes(term) || b.user.toLowerCase().includes(term)
        );
    this.visibleLarge = !term
      ? this.allLarge
      : this.allLarge.filter(
          (l) => l.agent.toLowerCase().includes(term) || l.user.toLowerCase().includes(term)
        );
  }
}
