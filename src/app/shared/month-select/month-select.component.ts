import { Component, OnInit } from '@angular/core';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { MonthFilterService } from '../../services/month-filter.service';
import { getAvailableMonths, MonthOption } from '../utils/aggregate';

@Component({
  selector: 'app-month-select',
  templateUrl: './month-select.component.html',
  styleUrls: ['./month-select.component.scss'],
  standalone: false,
})
export class MonthSelectComponent implements OnInit {
  months: MonthOption[] = [];
  month$ = this.filterSvc.month$;

  constructor(
    private dataSvc: DashboardDataService,
    private filterSvc: MonthFilterService
  ) {}

  ngOnInit(): void {
    this.dataSvc.getTransactions().subscribe((tx) => {
      this.months = getAvailableMonths(tx);
    });
  }

  onChange(ev: CustomEvent): void {
    this.filterSvc.setMonth((ev.detail as any).value);
  }
}
