import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { KpiCardComponent } from './kpi-card/kpi-card.component';
import { ChartCanvasComponent } from './chart-canvas/chart-canvas.component';
import { MonthSelectComponent } from './month-select/month-select.component';
import { AmountFormatPipe } from './pipes/amount-format.pipe';

@NgModule({
  declarations: [KpiCardComponent, ChartCanvasComponent, MonthSelectComponent, AmountFormatPipe],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [
    CommonModule,
    FormsModule,
    IonicModule,
    KpiCardComponent,
    ChartCanvasComponent,
    MonthSelectComponent,
    AmountFormatPipe,
  ],
})
export class SharedModule {}
