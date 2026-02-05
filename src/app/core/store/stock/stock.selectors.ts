import { createFeatureSelector, createSelector } from '@ngrx/store';
import { stockFeatureKey, StockState } from './stock.reducer';

export const selectStockState = createFeatureSelector<StockState>(stockFeatureKey);

export const selectSummaries = createSelector(selectStockState, (s) => s.summaries);
export const selectSelectedSymbol = createSelector(selectStockState, (s) => s.selectedSymbol);
export const selectChartType = createSelector(selectStockState, (s) => s.chartType);
export const selectDetailModalSymbol = createSelector(selectStockState, (s) => s.detailModalSymbol);

export const selectSelectedSummary = createSelector(
  selectSummaries,
  selectSelectedSymbol,
  (summaries, symbol) => summaries.find((s) => s.symbol === symbol) ?? null
);
