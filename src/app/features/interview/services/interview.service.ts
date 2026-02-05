import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  addQuestion,
  addType,
  deleteQuestion,
  deleteType,
  getAllQuestions,
  getAllTypes,
  getQuestionById,
  updateQuestion,
  updateType,
} from '../data/mock-interview-data';
import type { Question, QuestionType } from '../models/interview.model';
import { InterviewActions } from '../../../core/store';

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private readonly store = inject(Store);

  load(): void {
    this.store.dispatch(
      InterviewActions.loadSuccess({
        types: getAllTypes(),
        questions: getAllQuestions(),
      })
    );
  }

  addType(name: string): void {
    const type = addType(name);
    this.store.dispatch(InterviewActions.addTypeSuccess({ questionType: type }));
  }

  updateType(id: string, name: string): void {
    const type = updateType(id, name);
    if (type) this.store.dispatch(InterviewActions.updateTypeSuccess({ questionType: type }));
  }

  deleteType(id: string): void {
    deleteType(id);
    this.store.dispatch(InterviewActions.deleteTypeSuccess({ typeId: id }));
  }

  addQuestion(question: Omit<Question, 'id'>): void {
    const q = addQuestion(question);
    this.store.dispatch(InterviewActions.addQuestionSuccess({ question: q }));
  }

  updateQuestion(id: string, updates: Partial<Omit<Question, 'id'>>): void {
    const q = updateQuestion(id, updates);
    if (q) this.store.dispatch(InterviewActions.updateQuestionSuccess({ question: q }));
  }

  deleteQuestion(id: string): void {
    deleteQuestion(id);
    this.store.dispatch(InterviewActions.deleteQuestionSuccess({ questionId: id }));
  }

  getQuestionById(id: string): Question | null {
    return getQuestionById(id);
  }
}
