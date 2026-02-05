import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, shareReplay } from 'rxjs/operators';
import { UiActions } from '../../core/store';
import { selectSidebarOpen } from '../../core/store/ui/ui.selectors';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export default class MainLayoutComponent {
  private readonly store = inject(Store);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly sidebarOpen = this.store.selectSignal(selectSidebarOpen);
  private readonly isHandset$ = this.breakpointObserver
    .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
    .pipe(
      map((result) => result.matches),
      shareReplay(1)
    );
  readonly isHandset = toSignal(this.isHandset$, { initialValue: false });

  readonly mobileMenuOpen = signal(false);

  /** Sidebar visibly open: on desktop = hover/expanded; on mobile = drawer open */
  readonly sidebarVisible = computed(() =>
    this.isHandset() ? this.mobileMenuOpen() : this.sidebarOpen()
  );

  readonly navItems: NavItem[] = [
    { label: 'Home', icon: 'home', route: '/home' },
    { label: 'Stock', icon: 'candlestick_chart', route: '/stock' },
  ];

  onSidebarMouseEnter(): void {
    this.store.dispatch(UiActions.setSidebarHover({ hover: true }));
  }

  onSidebarMouseLeave(): void {
    this.store.dispatch(UiActions.setSidebarHover({ hover: false }));
  }

  toggleSidebar(): void {
    this.store.dispatch(UiActions.toggleSidebar());
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
