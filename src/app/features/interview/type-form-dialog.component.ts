import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatButton} from '@angular/material/button';

export type TypeFormData = { id: string; name: string } | null;

@Component({
  selector: 'app-type-form-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButton],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit type' : 'New type' }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="name" placeholder="e.g. React, Angular" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="name" [disabled]="!name.trim()">
        {{ data ? 'Save' : 'Add' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }
      mat-dialog-content {
        min-width: 280px;
      }
    `,
  ],
})
export class TypeFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<TypeFormDialogComponent>);
  readonly data = inject<TypeFormData>(MAT_DIALOG_DATA);

  name = this.data?.name ?? '';
}
