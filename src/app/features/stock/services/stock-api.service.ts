import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { OhlcvBar, StockSummary } from '../models/stock.model';

/** Alpha Vantage API response shapes */
interface AlphaVantageGlobalQuote {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '09. change': string;
    '10. change percent': string;
  };
}

interface AlphaVantageTimeSeriesDaily {
  'Time Series (Daily)': Record<
    string,
    { '1. open': string; '2. high': string; '3. low': string; '4. close': string; '5. volume': string }
  >;
}

const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';

@Injectable({ providedIn: 'root' })
export class StockApiService {
  private readonly http = inject(HttpClient);
  private readonly apiKey = environment.alphaVantageApiKey;

  /** Whether a real API is configured (non-empty key). */
  get isConfigured(): boolean {
    return typeof this.apiKey === 'string' && this.apiKey.length > 0;
  }

  /**
   * Fetch current quote for one symbol.
   * @see https://www.alphavantage.co/documentation/#latestprice
   */
  getQuote(symbol: string): Observable<StockSummary | null> {
    if (!this.isConfigured) return of(null);
    const params = {
      function: 'GLOBAL_QUOTE',
      symbol: symbol.trim(),
      apikey: this.apiKey,
    };
    return this.http.get<AlphaVantageGlobalQuote>(ALPHA_VANTAGE_BASE, { params }).pipe(
      map((res) => {
        const q = res['Global Quote'];
        if (!q || !q['05. price']) return null;
        const price = parseFloat(q['05. price']);
        const change = parseFloat(q['09. change'] || '0');
        const changePercent = parseFloat((q['10. change percent'] || '0').replace('%', ''));
        const volume = parseInt(q['06. volume'] || '0', 10);
        const high = parseFloat(q['03. high'] || String(price));
        const low = parseFloat(q['04. low'] || String(price));
        return {
          symbol: (q['01. symbol'] || symbol).trim(),
          name: (q['01. symbol'] || symbol).trim(),
          exchange: 'US',
          lastPrice: price,
          change,
          changePercent,
          volume,
          high52w: high,
          low52w: low,
        } as StockSummary;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Fetch daily OHLCV time series (last 100 days on free tier).
   * @see https://www.alphavantage.co/documentation/#daily
   */
  getTimeSeriesDaily(symbol: string): Observable<OhlcvBar[]> {
    if (!this.isConfigured) return of([]);
    const params = {
      function: 'TIME_SERIES_DAILY',
      symbol: symbol.trim(),
      outputsize: 'compact',
      apikey: this.apiKey,
    };
    return this.http.get<AlphaVantageTimeSeriesDaily>(ALPHA_VANTAGE_BASE, { params }).pipe(
      map((res) => {
        const series = res['Time Series (Daily)'];
        if (!series) return [];
        return Object.entries(series)
          .map(([date, d]) => ({
            date,
            open: parseFloat(d['1. open']),
            high: parseFloat(d['2. high']),
            low: parseFloat(d['3. low']),
            close: parseFloat(d['4. close']),
            volume: parseInt(d['5. volume'] || '0', 10),
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }),
      catchError(() => of([]))
    );
  }
}
