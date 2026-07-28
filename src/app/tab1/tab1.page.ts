import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js/auto';
import { combineLatest } from 'rxjs';
import { DashboardDataService } from '../services/dashboard-data.service';
import { MonthFilterService } from '../services/month-filter.service';
import { AgentStat, DashboardKpis, Transaction } from '../models/dashboard.model';
import { compactAmount } from '../shared/pipes/amount-format.pipe';
import { PeriodCompareData } from '../shared/period-compare/period-compare.component';
import {
  computeAgents,
  computeDaily,
  computeErrors,
  computeKpis,
  computeVpos,
  filterByMonth,
  getLatestDates,
  monthLabel,
  previousMonthKey,
} from '../shared/utils/aggregate';
import { agentNameAr } from '../shared/utils/agent-display-name';

function pctChange(curr: number, prev: number): number | null {
  if (!prev) return null;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

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
  kpis?: DashboardKpis;
  errors: ReturnType<typeof computeErrors> = [];
  trendMode: 'daily' | 'weekly' = 'weekly';

  topAgents: AgentStat[] = [];
  bottomAgents: AgentStat[] = [];
  dayCompare?: PeriodCompareData;
  monthCompare?: PeriodCompareData;

  private filtered: Transaction[] = [];
  private dailyData: ReturnType<typeof computeDaily> = [];

  trendChartData?: ChartConfiguration['data'];
  trendChartOptions: ChartConfiguration['options'] = {};
  statusChartData?: ChartConfiguration['data'];
  statusChartOptions: any = {};
  agentsChartData?: ChartConfiguration['data'];
  agentsChartOptions: ChartConfiguration['options'] = {};
  vposChartData?: ChartConfiguration['data'];
  vposChartOptions: ChartConfiguration['options'] = {};

  compactAmount = compactAmount;

  constructor(
    private dataSvc: DashboardDataService,
    private filterSvc: MonthFilterService
  ) {}

  ngOnInit(): void {
    combineLatest([this.dataSvc.getTransactions(), this.filterSvc.month$]).subscribe(
      ([tx, month]) => {
        this.filtered = filterByMonth(tx, month);
        this.kpis = computeKpis(this.filtered);
        this.errors = computeErrors(this.filtered);
        this.dailyData = computeDaily(this.filtered);
        this.buildStatusChart();
        this.buildAgentsChart();
        this.buildVposChart();
        this.buildTrendChart();
        this.buildTopBottomAgents();
        this.buildDayCompare();
        this.buildMonthCompare(tx, month);
        this.loading = false;
      }
    );
  }

  private buildTopBottomAgents(): void {
    const agents = computeAgents(this.filtered).filter((a) => a.total >= 3);
    const byAmount = [...agents].sort((a, b) => b.amountIQD - a.amountIQD);
    this.topAgents = byAmount.slice(0, 5);
    this.bottomAgents = byAmount.slice(-5).reverse();
  }

  private buildDayCompare(): void {
    const [latest, previous] = getLatestDates(this.filtered, 2);
    if (!latest || !previous) {
      this.dayCompare = undefined;
      return;
    }
    const curr = this.dailyData.find((d) => d.date === latest);
    const prev = this.dailyData.find((d) => d.date === previous);
    if (!curr || !prev) {
      this.dayCompare = undefined;
      return;
    }
    this.dayCompare = {
      labelCurrent: latest,
      labelPrevious: previous,
      count: curr.total,
      prevCount: prev.total,
      amountIQD: curr.amountIQD,
      prevAmountIQD: prev.amountIQD,
      countChangePct: pctChange(curr.total, prev.total),
      amountChangePct: pctChange(curr.amountIQD, prev.amountIQD),
    };
  }

  private buildMonthCompare(allTx: Transaction[], month: string): void {
    if (!month || month === 'all') {
      this.monthCompare = undefined;
      return;
    }
    const prevMonth = previousMonthKey(month);
    const prevTx = filterByMonth(allTx, prevMonth);
    if (!prevTx.length) {
      this.monthCompare = undefined;
      return;
    }
    const currKpis = computeKpis(this.filtered);
    const prevKpis = computeKpis(prevTx);
    this.monthCompare = {
      labelCurrent: monthLabel(month),
      labelPrevious: monthLabel(prevMonth),
      count: currKpis.totalTransactions,
      prevCount: prevKpis.totalTransactions,
      amountIQD: currKpis.approvedAmountByCcy['IQD'] || 0,
      prevAmountIQD: prevKpis.approvedAmountByCcy['IQD'] || 0,
      countChangePct: pctChange(currKpis.totalTransactions, prevKpis.totalTransactions),
      amountChangePct: pctChange(
        currKpis.approvedAmountByCcy['IQD'] || 0,
        prevKpis.approvedAmountByCcy['IQD'] || 0
      ),
    };
  }

  setTrendMode(mode: 'daily' | 'weekly'): void {
    this.trendMode = mode;
    this.buildTrendChart();
  }

  private buildTrendChart(): void {
    const points =
      this.trendMode === 'weekly'
        ? this.toWeekly(this.dailyData)
        : this.dailyData.map((d) => ({ label: d.date, total: d.total, amountIQD: d.amountIQD }));

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

  private toWeekly(daily: typeof this.dailyData): Array<{
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
    if (!this.kpis) return;
    const { approvedCount, declinedCount } = this.kpis;
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
    const agents = computeAgents(this.filtered);
    const top = [...agents].sort((a, b) => b.total - a.total).slice(0, 8).reverse();
    this.agentsChartData = {
      labels: top.map((a) => agentNameAr(a.agent)),
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
    const items = computeVpos(this.filtered);
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
    if (!this.kpis || !this.kpis.declinedCount) return 0;
    return Math.round((count / this.kpis.declinedCount) * 100);
  }
}
