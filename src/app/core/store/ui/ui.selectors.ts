import { createFeatureSelector, createSelector } from '@ngrx/store';
import { uiFeatureKey, UiState } from './ui.reducer';

export const selectUiState = createFeatureSelector<UiState>(uiFeatureKey);

export const selectSidebarExpanded = createSelector(
  selectUiState,
  (state) => state.sidebarExpanded
);

export const selectSidebarHover = createSelector(
  selectUiState,
  (state) => state.sidebarHover
);

/** Sidebar is "open" (showing labels) when expanded by toggle or when hovered (desktop) */
export const selectSidebarOpen = createSelector(
  selectUiState,
  (state) => state.sidebarExpanded || state.sidebarHover
);
