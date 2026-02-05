import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then((m) => m.default),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.default),
      },
      {
        path: 'stock',
        loadComponent: () =>
          import('./features/stock/stock-page.component').then((m) => m.default),
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
