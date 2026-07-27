import { Component, Input } from '@angular/core';
import { compactAmount } from '../pipes/amount-format.pipe';

export interface PeriodCompareData {
  labelCurrent: string;
  labelPrevious: string;
  count: number;
  prevCount: number;
  amountIQD: number;
  prevAmountIQD: number;
  countChangePct: number | null;
  amountChangePct: number | null;
}

@Component({
  selector: 'app-period-compare',
  templateUrl: './period-compare.component.html',
  styleUrls: ['./period-compare.component.scss'],
  standalone: false,
})
export class PeriodCompareComponent {
  @Input() title = '';
  @Input() data?: PeriodCompareData;
  compactAmount = compactAmount;
}
