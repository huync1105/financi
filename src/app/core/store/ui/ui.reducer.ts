import { createReducer, on } from '@ngrx/store';
import { UiActions } from './ui.actions';

export const uiFeatureKey = 'ui';

export interface UiState {
  sidebarExpanded: boolean;
  sidebarHover: boolean;
}

export const initialUiState: UiState = {
  sidebarExpanded: false,
  sidebarHover: false,
};

export const uiReducer = createReducer(
  initialUiState,
  on(UiActions.setSidebarExpanded, (state, { expanded }) => ({
    ...state,
    sidebarExpanded: expanded,
  })),
  on(UiActions.toggleSidebar, (state) => ({
    ...state,
    sidebarExpanded: !state.sidebarExpanded,
  })),
  on(UiActions.setSidebarHover, (state, { hover }) => ({
    ...state,
    sidebarHover: hover,
  })),
);
