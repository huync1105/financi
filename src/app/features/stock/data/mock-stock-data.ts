import type { OhlcvBar, StockSummary } from '../models/stock.model';

/** Generate mock OHLCV data for a symbol (simulated Vietnamese stock) */
function generateOhlcv(
  symbol: string,
  basePrice: number,
  days: number,
  startDate: Date
): OhlcvBar[] {
  const data: OhlcvBar[] = [];
  let open = basePrice;
  const volatility = basePrice * 0.015;
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // skip weekends
    const change = (Math.random() - 0.48) * volatility;
    const high = open + Math.abs(change) * (0.5 + Math.random() * 0.5);
    const low = open - Math.abs(change) * (0.5 + Math.random() * 0.5);
    const close = open + change;
    const volume = Math.floor(100000 + Math.random() * 900000);
    data.push({
      date: d.toISOString().slice(0, 10),
      open: Math.round(open * 100) / 100,
      high: Math.round(Math.max(open, close, high) * 100) / 100,
      low: Math.round(Math.min(open, close, low) * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });
    open = close;
  }
  return data;
}

const MOCK_SUMMARIES: Record<string, Omit<StockSummary, 'lastPrice' | 'change' | 'changePercent' | 'volume'>> = {
  FPT: {
    symbol: 'FPT',
    name: 'FPT Corporation',
    exchange: 'HOSE',
    sector: 'Technology',
    high52w: 98.5,
    low52w: 62.2,
  },
  VNM: {
    symbol: 'VNM',
    name: 'Vietnam Dairy Products',
    exchange: 'HOSE',
    sector: 'Consumer',
    high52w: 92.0,
    low52w: 68.5,
  },
  VHM: {
    symbol: 'VHM',
    name: 'Vinhomes',
    exchange: 'HOSE',
    sector: 'Real Estate',
    high52w: 52.0,
    low52w: 32.1,
  },
  VIC: {
    symbol: 'VIC',
    name: 'Vingroup',
    exchange: 'HOSE',
    sector: 'Conglomerate',
    high52w: 48.8,
    low52w: 28.5,
  },
  VND: {
    symbol: 'VND',
    name: 'VNDIRECT Securities',
    exchange: 'HOSE',
    sector: 'Financials',
    high52w: 22.5,
    low52w: 14.2,
  },
  HPG: {
    symbol: 'HPG',
    name: 'Hoa Phat Group',
    exchange: 'HOSE',
    sector: 'Materials',
    high52w: 28.0,
    low52w: 18.5,
  },
};

const BASE_PRICES: Record<string, number> = {
  FPT: 82.5,
  VNM: 78.0,
  VHM: 42.0,
  VIC: 38.0,
  VND: 18.5,
  HPG: 23.0,
};

let cachedOhlcv: Record<string, OhlcvBar[]> = {};

function getOrCreateOhlcv(symbol: string): OhlcvBar[] {
  if (!cachedOhlcv[symbol]) {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    cachedOhlcv[symbol] = generateOhlcv(symbol, BASE_PRICES[symbol] ?? 50, 365, start);
  }
  return cachedOhlcv[symbol];
}

export function getMockSummaries(): StockSummary[] {
  return Object.keys(MOCK_SUMMARIES).map((symbol) => {
    const data = getOrCreateOhlcv(symbol);
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    const change = last ? last.close - (prev?.close ?? last.open) : 0;
    const changePercent = prev ? (change / prev.close) * 100 : 0;
    const totalVolume = data.slice(-20).reduce((s, b) => s + b.volume, 0);
    return {
      ...MOCK_SUMMARIES[symbol],
      lastPrice: last?.close ?? 0,
      change,
      changePercent,
      volume: totalVolume,
    } as StockSummary;
  });
}

export function getMockOhlcv(symbol: string): OhlcvBar[] {
  return getOrCreateOhlcv(symbol);
}

export function getMockSymbols(): string[] {
  return Object.keys(MOCK_SUMMARIES);
}
