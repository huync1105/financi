import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <div class="home">
      <mat-card appearance="outlined" class="welcome-card">
        <mat-card-content>
          <h1>Hello</h1>
          <p>Welcome to Financi.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .home {
      padding: 1.5rem;
    }
    .welcome-card {
      max-width: 32rem;
    }
    h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      font-weight: 600;
    }
    p {
      margin: 0;
      color: var(--financi-on-surface);
    }
  `,
})
export default class HomeComponent {}
