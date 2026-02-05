import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { StockSummary } from '../../../features/stock/models/stock.model';

export const StockActions = createActionGroup({
  source: 'Stock',
  events: {
    'Load summaries success': props<{ summaries: StockSummary[] }>(),
    'Set selected symbol': props<{ symbol: string | null }>(),
    'Set chart type': props<{ chartType: 'line' | 'candlestick' }>(),
    'Open detail modal': props<{ symbol: string }>(),
    'Close detail modal': emptyProps(),
  },
});
