import { createReducer, on } from '@ngrx/store';
import type { Question, QuestionType } from '../../../features/interview/models/interview.model';
import { InterviewActions } from './interview.actions';

export const interviewFeatureKey = 'interview';

export interface InterviewState {
  types: QuestionType[];
  questions: Question[];
  selectedTypeId: string | null;
}

export const initialInterviewState: InterviewState = {
  types: [],
  questions: [],
  selectedTypeId: null,
};

export const interviewReducer = createReducer(
  initialInterviewState,
  on(InterviewActions.loadSuccess, (_, { types, questions }) => ({
    types: [...types],
    questions: [...questions],
    selectedTypeId: null,
  })),
  on(InterviewActions.setSelectedType, (state, { typeId }) => ({
    ...state,
    selectedTypeId: typeId,
  })),
  on(InterviewActions.addTypeSuccess, (state, { questionType }) => ({
    ...state,
    types: [...state.types, questionType],
  })),
  on(InterviewActions.updateTypeSuccess, (state, { questionType }) => ({
    ...state,
    types: state.types.map((t) => (t.id === questionType.id ? questionType : t)),
  })),
  on(InterviewActions.deleteTypeSuccess, (state, { typeId }) => ({
    ...state,
    types: state.types.filter((t) => t.id !== typeId),
    questions: state.questions.filter((q) => q.typeId !== typeId),
    selectedTypeId: state.selectedTypeId === typeId ? null : state.selectedTypeId,
  })),
  on(InterviewActions.addQuestionSuccess, (state, { question }) => ({
    ...state,
    questions: [...state.questions, question],
  })),
  on(InterviewActions.updateQuestionSuccess, (state, { question }) => ({
    ...state,
    questions: state.questions.map((q) => (q.id === question.id ? question : q)),
  })),
  on(InterviewActions.deleteQuestionSuccess, (state, { questionId }) => ({
    ...state,
    questions: state.questions.filter((q) => q.id !== questionId),
  })),
);
