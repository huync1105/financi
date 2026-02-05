import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { Question } from './models/interview.model';

export interface LearningModalData {
  typeId: string;
  questions: Question[];
}

@Component({
  selector: 'app-learning-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './learning-modal.component.html',
  styleUrl: './learning-modal.component.scss',
})
export class LearningModalComponent {
  private readonly dialogRef = inject(MatDialogRef<LearningModalComponent>);
  readonly data = inject<LearningModalData>(MAT_DIALOG_DATA);

  readonly questions = this.data.questions;
  readonly currentIndex = signal(0);
  readonly userAnswer = signal('');
  readonly showCorrectAnswer = signal(false);

  readonly currentQuestion = () => this.questions[this.currentIndex()];
  readonly progress = () => (this.questions.length ? (this.currentIndex() + 1) / this.questions.length : 0);
  readonly canNext = () => this.currentIndex() < this.questions.length - 1;
  readonly canPrev = () => this.currentIndex() > 0;

  revealAnswer(): void {
    this.showCorrectAnswer.set(true);
  }

  next(): void {
    if (this.currentIndex() < this.questions.length - 1) {
      this.currentIndex.update((i) => i + 1);
      this.userAnswer.set('');
      this.showCorrectAnswer.set(false);
    }
  }

  prev(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
      this.userAnswer.set('');
      this.showCorrectAnswer.set(false);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
