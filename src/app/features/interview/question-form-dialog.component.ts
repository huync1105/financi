import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { Question } from './models/interview.model';
import {MatButton} from '@angular/material/button';

export type QuestionFormData = { typeId: string } | { question: Question };

@Component({
  selector: 'app-question-form-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButton],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit question' : 'New question' }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Question</mat-label>
        <textarea matInput [(ngModel)]="text" rows="3" placeholder="Enter the question"></textarea>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Answer</mat-label>
        <textarea matInput [(ngModel)]="answer" rows="4" placeholder="Enter the correct answer"></textarea>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Image URLs (one per line, optional)</mat-label>
        <textarea matInput [(ngModel)]="imageUrlsText" rows="2" placeholder="https://..."></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="payload" [disabled]="!text.trim() || !answer.trim()">
        {{ isEdit ? 'Save' : 'Add' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }
      mat-dialog-content {
        min-width: 400px;
      }
    `,
  ],
})
export class QuestionFormDialogComponent {
  readonly data = inject<QuestionFormData>(MAT_DIALOG_DATA);

  get isEdit(): boolean {
    return 'question' in this.data;
  }

  text = 'question' in this.data ? this.data.question.text : '';
  answer = 'question' in this.data ? this.data.question.answer : '';
  imageUrlsText =
    'question' in this.data && this.data.question.imageUrls?.length
      ? this.data.question.imageUrls.join('\n')
      : '';

  get payload(): Partial<Question> {
    const urls = this.imageUrlsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      text: this.text.trim(),
      answer: this.answer.trim(),
      imageUrls: urls.length ? urls : undefined,
    };
  }
}
