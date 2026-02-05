import { createReducer, on } from '@ngrx/store';
import { StockActions } from './stock.actions';

export const stockFeatureKey = 'stock';

export interface StockState {
  summaries: import('../../../features/stock/models/stock.model').StockSummary[];
  selectedSymbol: string | null;
  chartType: 'line' | 'candlestick';
  detailModalSymbol: string | null;
}

export const initialStockState: StockState = {
  summaries: [],
  selectedSymbol: null,
  chartType: 'candlestick',
  detailModalSymbol: null,
};

export const stockReducer = createReducer(
  initialStockState,
  on(StockActions.loadSummariesSuccess, (state, { summaries }) => ({
    ...state,
    summaries,
    selectedSymbol: state.selectedSymbol ?? (summaries[0]?.symbol ?? null),
  })),
  on(StockActions.setSelectedSymbol, (state, { symbol }) => ({
    ...state,
    selectedSymbol: symbol,
  })),
  on(StockActions.setChartType, (state, { chartType }) => ({
    ...state,
    chartType,
  })),
  on(StockActions.openDetailModal, (state, { symbol }) => ({
    ...state,
    detailModalSymbol: symbol,
  })),
  on(StockActions.closeDetailModal, (state) => ({
    ...state,
    detailModalSymbol: null,
  })),
);
