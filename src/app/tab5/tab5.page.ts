import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { DashboardDataService } from '../services/dashboard-data.service';
import { MonthFilterService } from '../services/month-filter.service';
import { ViolationsService } from '../services/violations.service';
import { BurstFlag, LargeAmountFlag, ReissueFlag, Violation } from '../models/dashboard.model';
import { compactAmount } from '../shared/pipes/amount-format.pipe';
import {
  computeBursts,
  computeLargeAmountOutliers,
  computeReissues,
  filterByMonth,
} from '../shared/utils/aggregate';
import { agentNameAr } from '../shared/utils/agent-display-name';

type Category = 'violation' | 'reissue' | 'burst' | 'large';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  standalone: false,
})
export class Tab5Page implements OnInit {
  loading = true;
  category: Category = 'violation';
  searchTerm = '';

  allViolations: Violation[] = [];
  allReissues: ReissueFlag[] = [];
  allBursts: BurstFlag[] = [];
  allLarge: LargeAmountFlag[] = [];

  visibleViolations: Violation[] = [];
  visibleReissues: ReissueFlag[] = [];
  visibleBursts: BurstFlag[] = [];
  visibleLarge: LargeAmountFlag[] = [];

  compactAmount = compactAmount;

  constructor(
    private dataSvc: DashboardDataService,
    private filterSvc: MonthFilterService,
    private violationsSvc: ViolationsService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.dataSvc.getTransactions(),
      this.filterSvc.month$,
      this.violationsSvc.getViolations(),
    ]).subscribe(([tx, month, violations]) => {
      const scoped = filterByMonth(tx, month);
      this.allViolations =
        !month || month === 'all'
          ? violations
          : violations.filter((v) => v.date.slice(0, 7) === month);
      this.allReissues = computeReissues(scoped);
      this.allBursts = computeBursts(scoped);
      this.allLarge = computeLargeAmountOutliers(scoped);
      this.applyFilters();
      this.loading = false;
    });
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
    const byDateDesc = (a: Violation, b: Violation) =>
      `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`);
    this.visibleViolations = (
      !term
        ? this.allViolations
        : this.allViolations.filter(
            (v) =>
              v.pnr.toLowerCase().includes(term) ||
              v.agent.toLowerCase().includes(term) ||
              agentNameAr(v.agent).includes(term) ||
              v.user.toLowerCase().includes(term) ||
              v.passengers.some((p) => p.toLowerCase().includes(term))
          )
    )
      .slice()
      .sort(byDateDesc);
    this.visibleReissues = !term
      ? this.allReissues
      : this.allReissues.filter(
          (r) =>
            r.agent.toLowerCase().includes(term) ||
            agentNameAr(r.agent).includes(term) ||
            r.user.toLowerCase().includes(term)
        );
    this.visibleBursts = !term
      ? this.allBursts
      : this.allBursts.filter(
          (b) =>
            b.agent.toLowerCase().includes(term) ||
            agentNameAr(b.agent).includes(term) ||
            b.user.toLowerCase().includes(term)
        );
    this.visibleLarge = !term
      ? this.allLarge
      : this.allLarge.filter(
          (l) =>
            l.agent.toLowerCase().includes(term) ||
            agentNameAr(l.agent).includes(term) ||
            l.user.toLowerCase().includes(term)
        );
  }
}
