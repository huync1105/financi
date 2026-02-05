/** Single OHLCV bar (candlestick) */
export interface OhlcvBar {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Summary for a ticker */
export interface StockSummary {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  high52w: number;
  low52w: number;
}

/** Time-series for charts */
export interface StockTimeSeries {
  symbol: string;
  interval: '1D' | '1W' | '1M';
  data: OhlcvBar[];
}

/** Monthly aggregation for analysis */
export interface MonthlyPerformance {
  year: number;
  month: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  returnPercent: number;
}

/** Yearly aggregation */
export interface YearlyPerformance {
  year: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  returnPercent: number;
}

/** Key financial indicators (when available) */
export interface KeyIndicators {
  pe?: number;
  pb?: number;
  eps?: number;
  roe?: number;
  dividendYield?: number;
  marketCap?: number;
}

/** Trend / technical summary */
export interface TrendSummary {
  direction: 'up' | 'down' | 'sideways';
  strength: number; // 0-100
  volatility: number;
  supportLevel?: number;
  resistanceLevel?: number;
  momentum: 'bullish' | 'bearish' | 'neutral';
}

/** Analysis result for modal */
export interface StockAnalysis {
  symbol: string;
  name: string;
  summary: StockSummary;
  monthlyPerformance: MonthlyPerformance[];
  yearlyPerformance: YearlyPerformance[];
  trend: TrendSummary;
  indicators?: KeyIndicators;
  evaluationSummary: string[];
  forecastQuarter: ForecastResult;
  forecastYear: ForecastResult;
}

export interface ForecastResult {
  priceLow: number;
  priceHigh: number;
  priceMid: number;
  confidence: 'low' | 'medium' | 'high';
  assumptions: string[];
  risks: string[];
  summary: string;
}
