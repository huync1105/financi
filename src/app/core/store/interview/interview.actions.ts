import { createActionGroup, props } from '@ngrx/store';
import type { Question, QuestionType } from '../../../features/interview/models/interview.model';

export const InterviewActions = createActionGroup({
  source: 'Interview',
  events: {
    'Load success': props<{ types: QuestionType[]; questions: Question[] }>(),
    'Set selected type': props<{ typeId: string | null }>(),
    'Add type success': props<{ questionType: QuestionType }>(),
    'Update type success': props<{ questionType: QuestionType }>(),
    'Delete type success': props<{ typeId: string }>(),
    'Add question success': props<{ question: Question }>(),
    'Update question success': props<{ question: Question }>(),
    'Delete question success': props<{ questionId: string }>(),
  },
});
