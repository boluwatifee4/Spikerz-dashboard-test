import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="layout-container">
      <!-- Mobile Header (visible below 1024px) -->
      <header class="mobile-header" *ngIf="isTabletOrMobile()">
        <div class="header-content">
          <!-- Hamburger Menu Button -->
          <button
            class="hamburger-btn"
            (click)="toggleSidebar()"
            [class.active]="!isSidebarCollapsed()"
            aria-label="Toggle sidebar">
            <svg
              *ngIf="isSidebarCollapsed(); else closeIcon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <ng-template #closeIcon>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </ng-template>
          </button>

          <!-- Logo -->
          <a class="header-logo" routerLink="/dashboard">
            <img src="/logo.png" alt="Logo" class="logo-image" />
          </a>

          <!-- Spacer for centering -->
          <div class="header-spacer"></div>
        </div>
      </header>

      <!-- Sidebar -->
      <app-sidebar
        [isCollapsed]="isSidebarCollapsed()"
        [isHidden]="isTabletOrMobile() && isSidebarCollapsed()"
        (toggleSidebar)="toggleSidebar()"
        (sidebarStateChange)="onSidebarStateChange($event)">
      </app-sidebar>

      <!-- Main Content Area -->
      <main
        class="main-content"
        [attr.data-mobile]="isTabletOrMobile() ? 'true' : 'false'"
        [class.sidebar-collapsed]="isSidebarCollapsed()"
        [class.sidebar-open]="!isSidebarCollapsed() && isTabletOrMobile()"
        [class.mobile]="isTabletOrMobile()"
        [class.with-header]="isTabletOrMobile()">
        <div class="content-wrapper">
          <!-- Router outlet will go here for different pages -->
          <ng-content></ng-content>
        </div>
      </main>

      <!-- Mobile Overlay -->
      <div
        class="mobile-overlay"
        [class.active]="!isSidebarCollapsed() && isTabletOrMobile()"
        (click)="closeSidebar()"
        *ngIf="isTabletOrMobile()">
      </div>
    </div>
  `,
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  // Sidebar state management using Angular signals
  isSidebarCollapsed = signal(false);
  isTabletOrMobile = signal(window.innerWidth < 1024);

  constructor() {
    // Listen for window resize to handle responsive behavior
    this.handleResize();
  }

  /**
   * Toggle sidebar collapse state
   */
  toggleSidebar(): void {
    this.isSidebarCollapsed.update(collapsed => !collapsed);
  }

  /**
   * Close sidebar (mainly for mobile/tablet)
   */
  closeSidebar(): void {
    if (this.isTabletOrMobile()) {
      this.isSidebarCollapsed.set(true);
    }
  }

  /**
   * Handle sidebar state changes from child component
   */
  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed.set(isCollapsed);
  }

  /**
   * Handle window resize for responsive behavior
   */
  private handleResize(): void {
    window.addEventListener('resize', () => {
      const tabletOrMobile = window.innerWidth < 1024;
      this.isTabletOrMobile.set(tabletOrMobile);

      // Auto-collapse on tablet/mobile, auto-expand on desktop
      if (tabletOrMobile) {
        this.isSidebarCollapsed.set(true);
      } else {
        this.isSidebarCollapsed.set(false);
      }
    });
  }
}
