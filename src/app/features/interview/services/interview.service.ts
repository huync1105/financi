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
import {BaseHttpService} from '../../../core/services/base-http.service';
import {mergeMap, Observable, of, tap} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BaseResponse} from '../../../core/interfaces/base-response.interface';

@Injectable({ providedIn: 'root' })
export class InterviewService extends BaseHttpService {
  private endpointInterviewType: string = `interview-type`;
  private endpointInterview: string = `interview`;
  private readonly store = inject(Store);

  load(): Observable<BaseResponse<QuestionType[]>> {
    return this.get<BaseResponse<QuestionType[]>>(this.endpointInterviewType)
      .pipe(tap(res => {
        this.store.dispatch(InterviewActions.setTypes({types: res.data}));
        this.store.dispatch(InterviewActions.setSelectedType({ typeId: res.data[0].id }));
        this.store.dispatch(
          InterviewActions.loadSuccess({
            types: res.data,
            questions: getAllQuestions(),
            selectedTypeId: res.data[0].id,
            invokedApi: true
          })
        );
      }));
  }

  addType(name: string): Observable<BaseResponse<QuestionType>> {
    const type = addType(name);
    this.store.dispatch(InterviewActions.addTypeSuccess({ questionType: type }));
    return this.post<BaseResponse<QuestionType>>(this.endpointInterviewType, { name });
  }

  updateType(id: string, name: string): Observable<BaseResponse<QuestionType>> {
    return this.put<BaseResponse<QuestionType>>(`${this.endpointInterview}/${id}`, { id, name })
      .pipe(mergeMap(res => {
        this.store.dispatch(InterviewActions.updateTypeSuccess({ questionType: res.data }));
        return of(res);
      }));
  }

  deleteType(id: string): Observable<BaseResponse<any>> {
    return this.delete<BaseResponse<any>>(`${this.endpointInterviewType}/${id}`)
      .pipe(mergeMap(res => {
        this.store.dispatch(InterviewActions.deleteTypeSuccess({ typeId: id }));
        return of(res);
      }));
  }

  getQuestionByTypeId(typeId: number): Observable<BaseResponse<Question[]>> {
    const url = `${this.endpointInterview}?typeId=${typeId}`;

    return this.get<BaseResponse<Question[]>>(url)
      .pipe(mergeMap(res => {
        const listQuestion = res.data;
        this.store.dispatch(InterviewActions.getQuestions({ questions: listQuestion }));
        return of(res);
      }));
  }

  addQuestion(question: Omit<Question, 'id'>): Observable<BaseResponse<Question>> {
    return this.post<BaseResponse<Question>>(this.endpointInterview, question)
      .pipe(mergeMap(res => {
        this.store.dispatch(InterviewActions.addQuestionSuccess({ question: res.data }));
        return of(res);
      }));
  }

  updateQuestion(id: string, updates: Partial<Omit<Question, 'id'>>): Observable<BaseResponse<Question>> {
    return this.put<BaseResponse<Question>>(`${this.endpointInterview}/${id}`, { ...updates })
      .pipe(mergeMap(res => {
        this.store.dispatch(InterviewActions.updateQuestionSuccess({ question: res.data }));
        return of(res);
      }))
  }

  deleteQuestion(id: string): Observable<BaseResponse<any>> {
    return this.delete<BaseResponse<any>>(`${this.endpointInterview}/${id}`)
      .pipe(mergeMap(res => {
        this.store.dispatch(InterviewActions.deleteQuestionSuccess({ questionId: id }));
        return of(res);
      }));
  }
}
