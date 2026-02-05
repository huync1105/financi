import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, CandlestickChart, LineChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Store } from '@ngrx/store';
import type { EChartsCoreOption } from 'echarts/core';
import type { OhlcvBar } from './models/stock.model';
import { StockService } from './services/stock.service';
import { StockDetailModalComponent } from './stock-detail-modal.component';
import {
  StockActions,
  selectChartType,
  selectSelectedSymbol,
  selectSummaries,
} from '../../core/store';
import { MatDialog } from '@angular/material/dialog';

echarts.use([
  CandlestickChart,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  TitleComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-stock-page',
  standalone: true,
  imports: [
    DecimalPipe,
    NgxEchartsDirective,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
  ],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './stock-page.component.html',
  styleUrl: './stock-page.component.scss',
})
export default class StockPageComponent {
  private readonly store = inject(Store);
  private readonly stockService = inject(StockService);
  private readonly dialog = inject(MatDialog);

  readonly summaries = this.store.selectSignal(selectSummaries);
  readonly selectedSymbol = this.store.selectSignal(selectSelectedSymbol);
  readonly chartType = this.store.selectSignal(selectChartType);

  readonly chartOptions = signal<EChartsCoreOption | null>(null);
  readonly loading = signal(true);
  readonly timeSeries = signal<OhlcvBar[]>([]);

  readonly selectedSummary = computed(() => {
    const s = this.summaries();
    const sym = this.selectedSymbol();
    return s.find((x) => x.symbol === sym) ?? null;
  });

  constructor() {
    this.stockService.getSummaries().subscribe((summaries) => {
      this.store.dispatch(StockActions.loadSummariesSuccess({ summaries }));
    });
    effect((onCleanup) => {
      const sym = this.selectedSymbol();
      const type = this.chartType();
      if (!sym) {
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      const sub = this.stockService.getTimeSeries(sym).subscribe({
        next: (data) => {
          this.timeSeries.set(data);
          this.chartOptions.set(this.buildChartOptions(data, this.chartType()));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      onCleanup(() => sub.unsubscribe());
    });
    effect(() => {
      const type = this.chartType();
      const data = this.timeSeries();
      if (data.length > 0) {
        this.chartOptions.set(this.buildChartOptions(data, type));
      }
    });
  }

  selectSymbol(symbol: string): void {
    this.store.dispatch(StockActions.setSelectedSymbol({ symbol }));
  }

  setChartType(type: 'line' | 'candlestick'): void {
    this.store.dispatch(StockActions.setChartType({ chartType: type }));
  }

  openDetail(symbol: string): void {
    this.store.dispatch(StockActions.openDetailModal({ symbol }));
    this.dialog
      .open(StockDetailModalComponent, {
        width: 'min(90vw, 720px)',
        maxHeight: '90vh',
        data: { symbol },
        disableClose: false,
      })
      .afterClosed()
      .subscribe(() => this.store.dispatch(StockActions.closeDetailModal()));
  }

  private buildChartOptions(data: OhlcvBar[], chartType: 'line' | 'candlestick'): EChartsCoreOption {
    const dates = data.map((d) => d.date);
    const ohlc = data.map((d) => [d.open, d.close, d.low, d.high]);
    const closes = data.map((d) => d.close);
    const volumes = data.map((d) => d.volume);

    const priceSeries =
      chartType === 'candlestick'
        ? { type: 'candlestick' as const, data: ohlc, name: 'Price' }
        : { type: 'line' as const, data: closes, name: 'Close', smooth: true };

    return {
      animation: true,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: { show: false },
      grid: [
        { left: 48, right: 24, top: 16, height: '55%' },
        { left: 48, right: 24, top: '72%', height: '18%' },
      ],
      xAxis: [
        { type: 'category', data: dates, gridIndex: 0, axisLabel: { formatter: (v: string) => v.slice(0, 7) } },
        { type: 'category', data: dates, gridIndex: 1, axisLabel: { show: false } },
      ],
      yAxis: [
        { type: 'value', scale: true, gridIndex: 0, splitLine: { show: false } },
        { type: 'value', gridIndex: 1, splitLine: { show: false } },
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: [0, 1], start: 50, end: 100 },
        { type: 'slider', xAxisIndex: [0, 1], start: 50, end: 100, bottom: 8 },
      ],
      series: [
        { ...priceSeries, xAxisIndex: 0, yAxisIndex: 0 },
        { type: 'bar', data: volumes, name: 'Volume', xAxisIndex: 1, yAxisIndex: 1, itemStyle: { color: '#629fad' } },
      ],
    };
  }
}
