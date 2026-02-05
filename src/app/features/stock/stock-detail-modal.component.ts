import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { StockService } from './services/stock.service';
import type { StockAnalysis } from './models/stock.model';

@Component({
  selector: 'app-stock-detail-modal',
  standalone: true,
  imports: [DecimalPipe, MatDialogModule, MatIconModule, MatTabsModule, MatProgressSpinnerModule],
  templateUrl: './stock-detail-modal.component.html',
  styleUrl: './stock-detail-modal.component.scss',
})
export class StockDetailModalComponent {
  private readonly dialogRef = inject(MatDialogRef<StockDetailModalComponent>);
  private readonly data = inject<{ symbol: string }>(MAT_DIALOG_DATA);
  private readonly stockService = inject(StockService);

  readonly symbol = this.data.symbol;
  readonly analysis = signal<StockAnalysis | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.stockService.getAnalysis(this.symbol).subscribe({
      next: (a) => {
        this.analysis.set(a);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
