import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-chart-canvas',
  template: `<div class="chart-wrap" [style.height.px]="height">
    <canvas #canvas></canvas>
  </div>`,
  styles: [
    `
      .chart-wrap {
        position: relative;
        width: 100%;
      }
    `,
  ],
  standalone: false,
})
export class ChartCanvasComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() type: ChartType = 'bar';
  @Input() data!: ChartConfiguration['data'];
  @Input() options: any = {};
  @Input() height = 240;

  private chart?: Chart;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewReady) {
      return;
    }
    if (changes['data'] || changes['type'] || changes['options']) {
      this.render();
    }
  }

  private render(): void {
    if (!this.data) {
      return;
    }
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: this.type,
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...this.options,
      },
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
