import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss'],
  standalone: false,
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() sub?: string;
  @Input() icon = 'stats-chart-outline';
  @Input() color: 'primary' | 'success' | 'danger' | 'warning' | 'tertiary' = 'primary';
  @Input() trend?: 'up' | 'down' | null = null;
}
