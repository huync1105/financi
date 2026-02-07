import { createFeatureSelector, createSelector } from '@ngrx/store';
import { interviewFeatureKey, InterviewState } from './interview.reducer';

export const selectInterviewState = createFeatureSelector<InterviewState>(interviewFeatureKey);
export const selectTypes = createSelector(selectInterviewState, (s) => s.types);
export const selectQuestions = createSelector(selectInterviewState, (s) => s.questions);
export const selectSelectedTypeId = createSelector(selectInterviewState, (s) => s.selectedTypeId);
export const isInvokedApi = createSelector(selectInterviewState, (s) => s.invokedApi);
export const selectSelectedType = createSelector(
  selectTypes,
  selectSelectedTypeId,
  (types, id) => types.find((t) => t.id === id) ?? null
);
export const selectQuestionsForSelectedType = createSelector(
  selectQuestions,
  selectSelectedTypeId,
  (questions, typeId) => (typeId ? questions.filter((q) => q.typeId === typeId) : [])
);

export const selectQuestionById = (id: string) =>
  createSelector(selectQuestions, (questions) => questions.find((q) => q.id === id) ?? null);
