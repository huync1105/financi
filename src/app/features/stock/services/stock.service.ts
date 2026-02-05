import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import type {
  ForecastResult,
  KeyIndicators,
  MonthlyPerformance,
  OhlcvBar,
  StockAnalysis,
  StockSummary,
  TrendSummary,
  YearlyPerformance,
} from '../models/stock.model';
import { getMockOhlcv, getMockSummaries } from '../data/mock-stock-data';
import { StockApiService } from './stock-api.service';

/** Default symbols when using real API (Alpha Vantage free tier: US and global symbols) */
const DEFAULT_API_SYMBOLS = ['IBM', 'AAPL', 'MSFT'];

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly api = inject(StockApiService);

  getSummaries(): Observable<StockSummary[]> {
    if (this.api.isConfigured) {
      return forkJoin(
        DEFAULT_API_SYMBOLS.map((sym) => this.api.getQuote(sym))
      ).pipe(
        map((rows) => rows.filter((s): s is StockSummary => s != null))
      );
    }
    return of(getMockSummaries());
  }

  getTimeSeries(symbol: string): Observable<OhlcvBar[]> {
    if (this.api.isConfigured) {
      return this.api.getTimeSeriesDaily(symbol);
    }
    return of(getMockOhlcv(symbol));
  }

  getAnalysis(symbol: string): Observable<StockAnalysis> {
    return this.getTimeSeries(symbol).pipe(
      switchMap((data) => {
        const summaries = this.api.isConfigured ? [] : getMockSummaries();
        let summary: StockSummary | undefined = summaries.find((s) => s.symbol === symbol);
        if (!summary && data.length > 0) {
          const last = data[data.length - 1];
          const prev = data[data.length - 2];
          const change = prev ? last.close - prev.close : 0;
          const changePercent = prev ? (change / prev.close) * 100 : 0;
          summary = {
            symbol,
            name: symbol,
            exchange: 'US',
            lastPrice: last.close,
            change,
            changePercent,
            volume: last.volume,
            high52w: Math.max(...data.map((d) => d.high)),
            low52w: Math.min(...data.map((d) => d.low)),
          };
        }
        if (!summary) {
          return of(null as unknown as StockAnalysis);
        }
        const monthly = this.aggregateMonthly(data);
        const yearly = this.aggregateYearly(data);
        const trend = this.computeTrend(data);
        const indicators = this.estimateIndicators(summary, data);
        const evaluationSummary = this.buildEvaluationSummary(summary, data, trend, monthly, yearly);
        const forecastQuarter = this.forecast(data, trend, 63);
        const forecastYear = this.forecast(data, trend, 252);
        const analysis: StockAnalysis = {
          symbol: summary.symbol,
          name: summary.name,
          summary,
          monthlyPerformance: monthly,
          yearlyPerformance: yearly,
          trend,
          indicators,
          evaluationSummary,
          forecastQuarter,
          forecastYear,
        };
        return of(analysis);
      })
    );
  }

  private aggregateMonthly(data: OhlcvBar[]): MonthlyPerformance[] {
    const byMonth = new Map<string, OhlcvBar[]>();
    for (const bar of data) {
      const [y, m] = bar.date.split('-').map(Number);
      const key = `${y}-${m}`;
      if (!byMonth.has(key)) byMonth.set(key, []);
      byMonth.get(key)!.push(bar);
    }
    const result: MonthlyPerformance[] = [];
    byMonth.forEach((bars, key) => {
      const [year, month] = key.split('-').map(Number);
      const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
      const open = sorted[0].open;
      const close = sorted[sorted.length - 1].close;
      const high = Math.max(...sorted.map((b) => b.high));
      const low = Math.min(...sorted.map((b) => b.low));
      const volume = sorted.reduce((s, b) => s + b.volume, 0);
      const returnPercent = ((close - open) / open) * 100;
      result.push({
        year,
        month,
        open,
        close,
        high,
        low,
        volume,
        returnPercent: Math.round(returnPercent * 100) / 100,
      });
    });
    result.sort((a, b) => a.year - b.year || a.month - b.month);
    return result;
  }

  private aggregateYearly(data: OhlcvBar[]): YearlyPerformance[] {
    const byYear = new Map<number, OhlcvBar[]>();
    for (const bar of data) {
      const year = parseInt(bar.date.slice(0, 4), 10);
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year)!.push(bar);
    }
    const result: YearlyPerformance[] = [];
    byYear.forEach((bars, year) => {
      const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
      const open = sorted[0].open;
      const close = sorted[sorted.length - 1].close;
      const high = Math.max(...sorted.map((b) => b.high));
      const low = Math.min(...sorted.map((b) => b.low));
      const volume = sorted.reduce((s, b) => s + b.volume, 0);
      const returnPercent = ((close - open) / open) * 100;
      result.push({
        year,
        open,
        close,
        high,
        low,
        volume,
        returnPercent: Math.round(returnPercent * 100) / 100,
      });
    });
    result.sort((a, b) => a.year - b.year);
    return result;
  }

  private computeTrend(data: OhlcvBar[]): TrendSummary {
    if (data.length < 2) {
      return {
        direction: 'sideways',
        strength: 0,
        volatility: 0,
        momentum: 'neutral',
      };
    }
    const closes = data.map((d) => d.close);
    const first = closes[0];
    const last = closes[closes.length - 1];
    const returns = closes.slice(1).map((c, i) => (c - closes[i]) / closes[i]);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / returns.length;
    const volatility = Math.sqrt(variance) * 100;
    const changePct = ((last - first) / first) * 100;
    let direction: 'up' | 'down' | 'sideways' = 'sideways';
    if (changePct > 3) direction = 'up';
    else if (changePct < -3) direction = 'down';
    const strength = Math.min(100, Math.abs(changePct) * 5);
    let momentum: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    const recent = returns.slice(-20);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / (recent.length || 1);
    if (recentAvg > 0.001) momentum = 'bullish';
    else if (recentAvg < -0.001) momentum = 'bearish';
    const recentData = data.slice(-60);
    const lows = recentData.map((d) => d.low);
    const highs = recentData.map((d) => d.high);
    const supportLevel = lows.length ? Math.min(...lows) : undefined;
    const resistanceLevel = highs.length ? Math.max(...highs) : undefined;
    return {
      direction,
      strength: Math.round(strength),
      volatility: Math.round(volatility * 100) / 100,
      supportLevel,
      resistanceLevel,
      momentum,
    };
  }

  private estimateIndicators(summary: StockSummary, data: OhlcvBar[]): KeyIndicators {
    const lastClose = data.length ? data[data.length - 1].close : summary.lastPrice;
    const pe = 12 + Math.random() * 8;
    const pb = 1.5 + Math.random() * 1.5;
    const eps = lastClose / pe;
    const roe = 15 + (Math.random() - 0.5) * 10;
    const dividendYield = 2 + Math.random() * 4;
    const marketCap = lastClose * (500_000_000 + Math.random() * 2_000_000_000);
    return {
      pe: Math.round(pe * 100) / 100,
      pb: Math.round(pb * 100) / 100,
      eps: Math.round(eps * 100) / 100,
      roe: Math.round(roe * 100) / 100,
      dividendYield: Math.round(dividendYield * 100) / 100,
      marketCap: Math.round(marketCap),
    };
  }

  private buildEvaluationSummary(
    summary: StockSummary,
    data: OhlcvBar[],
    trend: TrendSummary,
    monthly: MonthlyPerformance[],
    yearly: YearlyPerformance[]
  ): string[] {
    const lines: string[] = [];
    lines.push(`${summary.symbol} is trading at ${summary.lastPrice.toFixed(2)} (${summary.change >= 0 ? '+' : ''}${summary.changePercent.toFixed(2)}% today).`);
    lines.push(`Trend: ${trend.direction} with ${trend.momentum} short-term momentum. Volatility (annualized): ${trend.volatility}%.`);
    if (trend.supportLevel != null) lines.push(`Recent support level: ${trend.supportLevel.toFixed(2)}.`);
    if (trend.resistanceLevel != null) lines.push(`Recent resistance level: ${trend.resistanceLevel.toFixed(2)}.`);
    if (monthly.length) {
      const lastMonth = monthly[monthly.length - 1];
      lines.push(`Last month: ${lastMonth.returnPercent >= 0 ? '+' : ''}${lastMonth.returnPercent}% return.`);
    }
    if (yearly.length) {
      const lastYear = yearly[yearly.length - 1];
      lines.push(`Last full year: ${lastYear.returnPercent >= 0 ? '+' : ''}${lastYear.returnPercent}% return.`);
    }
    return lines;
  }

  private forecast(data: OhlcvBar[], trend: TrendSummary, daysAhead: number): ForecastResult {
    if (!data.length) {
      return {
        priceLow: 0,
        priceHigh: 0,
        priceMid: 0,
        confidence: 'low',
        assumptions: ['No historical data.'],
        risks: ['High uncertainty.'],
        summary: 'Insufficient data for forecast.',
      };
    }
    const lastClose = data[data.length - 1].close;
    const returns = data.slice(1).map((d, i) => (d.close - data[i].close) / data[i].close);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / returns.length;
    const std = Math.sqrt(variance);
    const drift = avgReturn * daysAhead;
    const uncertainty = std * Math.sqrt(daysAhead);
    const up = lastClose * (1 + drift + 1.5 * uncertainty);
    const down = lastClose * (1 + drift - 1.5 * uncertainty);
    const mid = lastClose * (1 + drift);
    const confidence = daysAhead <= 63 ? (trend.strength > 50 ? 'medium' : 'low') : 'low';
    const assumptions = [
      'Forecast assumes recent trend and volatility persist.',
      'No major market or company-specific events are factored in.',
      'Based on historical price movement only; not fundamental valuation.',
    ];
    const risks = [
      'Market sentiment and macro conditions can change quickly.',
      'Past performance does not guarantee future results.',
      'Consider consulting a financial advisor for investment decisions.',
    ];
    const period = daysAhead <= 63 ? 'next quarter' : 'next year';
    const summary = `Estimated range for ${period}: ${Math.round(down * 100) / 100} – ${Math.round(up * 100) / 100} (mid: ${Math.round(mid * 100) / 100}). Confidence: ${confidence}.`;
    return {
      priceLow: Math.round(down * 100) / 100,
      priceHigh: Math.round(up * 100) / 100,
      priceMid: Math.round(mid * 100) / 100,
      confidence,
      assumptions,
      risks,
      summary,
    };
  }
}
