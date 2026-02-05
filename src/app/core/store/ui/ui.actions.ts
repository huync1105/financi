import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const UiActions = createActionGroup({
  source: 'UI',
  events: {
    'Set sidebar expanded': props<{ expanded: boolean }>(),
    'Toggle sidebar': emptyProps(),
    'Set sidebar hover': props<{ hover: boolean }>(),
  },
});
