import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js/auto';
import { DashboardDataService } from '../services/dashboard-data.service';
import { DashboardData } from '../models/dashboard.model';
import { compactAmount } from '../shared/pipes/amount-format.pipe';

const COLORS = {
  primary: '#3880ff',
  success: '#2dd36f',
  danger: '#eb445a',
  warning: '#ffc409',
  tertiary: '#624cda',
  medium: '#92949c',
};

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  loading = true;
  data?: DashboardData;
  trendMode: 'daily' | 'weekly' = 'weekly';

  trendChartData?: ChartConfiguration['data'];
  trendChartOptions: ChartConfiguration['options'] = {};
  statusChartData?: ChartConfiguration['data'];
  statusChartOptions: any = {};
  agentsChartData?: ChartConfiguration['data'];
  agentsChartOptions: ChartConfiguration['options'] = {};
  vposChartData?: ChartConfiguration['data'];
  vposChartOptions: ChartConfiguration['options'] = {};

  compactAmount = compactAmount;

  constructor(private dataSvc: DashboardDataService) {}

  ngOnInit(): void {
    this.dataSvc.getDashboardData().subscribe((data) => {
      this.data = data;
      this.buildStatusChart();
      this.buildAgentsChart();
      this.buildVposChart();
      this.buildTrendChart();
      this.loading = false;
    });
  }

  setTrendMode(mode: 'daily' | 'weekly'): void {
    this.trendMode = mode;
    this.buildTrendChart();
  }

  private buildTrendChart(): void {
    if (!this.data) return;
    const points =
      this.trendMode === 'weekly'
        ? this.toWeekly(this.data.daily)
        : this.data.daily.map((d) => ({ label: d.date, total: d.total, amountIQD: d.amountIQD }));

    this.trendChartData = {
      labels: points.map((p) => p.label),
      datasets: [
        {
          type: 'bar',
          label: 'المبلغ (دينار)',
          data: points.map((p) => p.amountIQD),
          backgroundColor: 'rgba(56,128,255,0.35)',
          borderColor: COLORS.primary,
          borderWidth: 1,
          yAxisID: 'y1',
          order: 2,
          borderRadius: 4,
        },
        {
          type: 'line',
          label: 'عدد المعاملات',
          data: points.map((p) => p.total),
          borderColor: COLORS.tertiary,
          backgroundColor: COLORS.tertiary,
          tension: 0.35,
          yAxisID: 'y',
          order: 1,
          pointRadius: 3,
        },
      ],
    };
    this.trendChartOptions = {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', rtl: true, labels: { usePointStyle: true } },
      },
      scales: {
        y: {
          position: 'left',
          beginAtZero: true,
          title: { display: true, text: 'عدد المعاملات' },
          grid: { display: false },
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          title: { display: true, text: 'المبلغ (د.ع)' },
          grid: { display: false },
          ticks: {
            callback: (v) => compactAmount(Number(v)),
          },
        },
      },
    };
  }

  private toWeekly(daily: DashboardData['daily']): Array<{
    label: string;
    total: number;
    amountIQD: number;
  }> {
    const weeks: Record<string, { total: number; amountIQD: number; start: string }> = {};
    for (const d of daily) {
      const dt = new Date(d.date + 'T00:00:00');
      const day = dt.getDay();
      const monday = new Date(dt);
      monday.setDate(dt.getDate() - ((day + 6) % 7));
      const key = monday.toISOString().slice(0, 10);
      if (!weeks[key]) {
        weeks[key] = { total: 0, amountIQD: 0, start: key };
      }
      weeks[key].total += d.total;
      weeks[key].amountIQD += d.amountIQD;
    }
    return Object.values(weeks)
      .sort((a, b) => (a.start < b.start ? -1 : 1))
      .map((w) => ({ label: w.start, total: w.total, amountIQD: w.amountIQD }));
  }

  private buildStatusChart(): void {
    if (!this.data) return;
    const { approvedCount, declinedCount } = this.data.kpis;
    this.statusChartData = {
      labels: ['مقبولة', 'مرفوضة'],
      datasets: [
        {
          data: [approvedCount, declinedCount],
          backgroundColor: [COLORS.success, COLORS.danger],
          borderWidth: 0,
        },
      ],
    };
    this.statusChartOptions = {
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', rtl: true, labels: { usePointStyle: true } },
      },
    };
  }

  private buildAgentsChart(): void {
    if (!this.data) return;
    const top = [...this.data.agents].sort((a, b) => b.total - a.total).slice(0, 8).reverse();
    this.agentsChartData = {
      labels: top.map((a) => a.agent),
      datasets: [
        {
          label: 'عدد المعاملات',
          data: top.map((a) => a.total),
          backgroundColor: COLORS.primary,
          borderRadius: 4,
        },
      ],
    };
    this.agentsChartOptions = {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: { display: false } },
        y: { grid: { display: false } },
      },
    };
  }

  private buildVposChart(): void {
    if (!this.data) return;
    const items = this.data.vpos;
    this.vposChartData = {
      labels: items.map((v) => this.vposLabel(v.vpos)),
      datasets: [
        {
          label: 'نسبة القبول %',
          data: items.map((v) => v.approvalRate),
          backgroundColor: [COLORS.primary, COLORS.warning, COLORS.success],
          borderRadius: 4,
        },
      ],
    };
    this.vposChartOptions = {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, max: 100, grid: { display: false } },
      },
    };
  }

  vposLabel(v: string): string {
    const map: Record<string, string> = {
      MCOINV: 'بطاقة (فوترة)',
      HYPERPAY: 'بطاقة (HyperPay)',
      CASH: 'نقدي',
    };
    return map[v] || v;
  }

  errorPercent(count: number): number {
    if (!this.data) return 0;
    return Math.round((count / this.data.kpis.declinedCount) * 100);
  }
}
