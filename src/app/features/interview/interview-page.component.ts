import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {Store} from '@ngrx/store';
import {
  InterviewActions,
  selectQuestionsForSelectedType,
  selectSelectedType,
  selectSelectedTypeId,
  selectTypes,
} from '../../core/store';
import {InterviewService} from './services/interview.service';
import {TypeFormDialogComponent} from './type-form-dialog.component';
import {QuestionFormDialogComponent} from './question-form-dialog.component';
import {LearningModalComponent} from './learning-modal.component';
import type {Question, QuestionType} from './models/interview.model';
import {concatMap, of, pipe, Subject, takeUntil} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {JsonPipe} from '@angular/common';
import {isInvokedApi} from '../../core/store/interview/interview.selectors';

const DEFAULT_PAGE_SIZE = 10;

@Component({
  selector: 'app-interview-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,

  ],
  templateUrl: './interview-page.component.html',
  styleUrl: './interview-page.component.scss',
})
export default class InterviewPageComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly interviewService = inject(InterviewService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly types = this.store.selectSignal(selectTypes);
  readonly selectedTypeId = this.store.selectSignal(selectSelectedTypeId);
  readonly selectedType = this.store.selectSignal(selectSelectedType);
  readonly questions = this.store.selectSignal(selectQuestionsForSelectedType);
  readonly invokedApi = this.store.selectSignal(isInvokedApi);

  readonly searchQuery = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(DEFAULT_PAGE_SIZE);

  readonly filteredQuestions = computed(() => {
    const qs = this.questions();
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return qs;
    return qs.filter((q) => q.text.toLowerCase().includes(query));
  });

  readonly totalFiltered = computed(() => this.filteredQuestions().length);

  readonly paginatedQuestions = computed(() => {
    const list = this.filteredQuestions();
    const start = this.pageIndex() * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  /** Set of question ids that are expanded (show answer + images + actions). */
  readonly expandedIds = signal<Set<string>>(new Set());
  private readonly destroy$: Subject<void> = new Subject<void>();
  protected isLoading = false;
  protected isLoadingQuestion = false;

  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  toggleExpanded(id: string): void {
    const set = new Set(this.expandedIds());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.expandedIds.set(set);
  }

  ngOnInit(): void {
    if (this.invokedApi()) return;

    this.isLoading = true;
    this.isLoadingQuestion = true;
    this.interviewService.load()
      .pipe(
        concatMap(res => {
          this.isLoading = false;
          return this.interviewService.getQuestionByTypeId(Number(this.selectedType()?.id ?? res.data[0].id));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: res => {
          this.isLoadingQuestion = false;
        },
        error: err => {
          this.isLoading = false;
          this.isLoadingQuestion = false;
          this.snackBar.open(
            err?.message ?? "Error!",
            'Close',
            {
              horizontalPosition: 'end',
              verticalPosition: 'top'
            }
          )
        },
      });

  }

  selectType(typeId: string): void {
    this.searchQuery.set('');
    this.pageIndex.set(0);
    this.store.dispatch(InterviewActions.setSelectedType({typeId}));
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value ?? '');
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  openAddType(): void {
    this.dialog
      .open(TypeFormDialogComponent, {width: '400px', data: null})
      .afterClosed()
      .pipe(
        concatMap((name: string | undefined) => {
          if (name != null && name.trim()) {
            return this.interviewService.addType(name.trim());
          }
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => {},
          error => this.snackBar.open(error?.message ?? "Error!",
        'Close',
          {
            horizontalPosition: 'end',
            verticalPosition: 'top'
          }));
  }

  openEditType(type: QuestionType): void {
    this.dialog
      .open(TypeFormDialogComponent, {width: '400px', data: {id: type.id, name: type.name}})
      .afterClosed()
      .subscribe((name: string | undefined) => {
        if (name != null && name.trim())
          this.interviewService.updateType(type.id, name.trim())
            .subscribe({
              next: res => {
              },
              error: err => this.snackBar.open(err?.message ?? "Error!",
                'Close',
                {
                  horizontalPosition: 'end',
                  verticalPosition: 'top'
                })
            });
      });
  }

  deleteType(type: QuestionType): void {
    if (confirm(`Delete "${type.name}" and all its questions?`)) {
      this.interviewService.deleteType(type.id).subscribe({
        next: res => {
        },
        error: err => this.snackBar.open(err?.message ?? "Error!",
          'Close',
          {
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
      });
    }
  }

  openAddQuestion(): void {
    const typeId = this.selectedTypeId();
    if (!typeId) return;
    this.dialog
      .open(QuestionFormDialogComponent, {width: '520px', data: {typeId}})
      .afterClosed()
      .subscribe((q: Partial<Question> | undefined) => {
        if (q?.text != null && q.answer != null)
          this.interviewService.addQuestion({
            typeId,
            text: q.text,
            answer: q.answer,
            imageUrls: q.imageUrls
          }).subscribe({
            next: res => {
            },
            error: err => this.snackBar.open(err?.message ?? "Error!",
              'Close',
              {
                horizontalPosition: 'end',
                verticalPosition: 'top'
              })
          });
      });
  }

  openEditQuestion(question: Question): void {
    this.dialog
      .open(QuestionFormDialogComponent, {width: '520px', data: {question}})
      .afterClosed()
      .subscribe((updates: Partial<Question> | undefined) => {
        if (updates != null) this.interviewService.updateQuestion(question.id, updates)
          .subscribe({
            next: res => {
            },
            error: err => this.snackBar.open(err?.message ?? "Error!",
              'Close',
              {
                horizontalPosition: 'end',
                verticalPosition: 'top'
              })
          });
      });
  }

  deleteQuestion(question: Question): void {
    if (confirm('Delete this question?'))
      this.interviewService.deleteQuestion(question.id).subscribe({
        next: res => {
        },
        error: err => this.snackBar.open(err?.message ?? "Error!",
          'Close',
          {
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
      });
  }

  startLearning(): void {
    const typeId = this.selectedTypeId();
    const qs = this.questions();
    if (!typeId || qs.length === 0) return;
    this.dialog.open(LearningModalComponent, {
      width: 'min(90vw, 560px)',
      data: {typeId, questions: qs},
      disableClose: false,
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
