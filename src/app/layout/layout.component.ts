import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="layout-container">
      <!-- Sidebar -->
      <app-sidebar
        [isCollapsed]="isSidebarCollapsed()"
        (toggleSidebar)="toggleSidebar()"
        (sidebarStateChange)="onSidebarStateChange($event)">
      </app-sidebar>

      <!-- Main Content Area -->
      <main
        class="main-content"
        [class.sidebar-collapsed]="isSidebarCollapsed()">
        <div class="content-wrapper">
          <!-- Router outlet will go here for different pages -->
          <ng-content></ng-content>
        </div>
      </main>

      <!-- Mobile Overlay -->
      <div
        class="mobile-overlay"
        [class.active]="!isSidebarCollapsed()"
        (click)="closeSidebar()"
        *ngIf="isMobile">
      </div>
    </div>
  `,
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  // Sidebar state management using Angular signals
  isSidebarCollapsed = signal(false);
  isMobile = signal(window.innerWidth < 768);

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
   * Close sidebar (mainly for mobile)
   */
  closeSidebar(): void {
    if (this.isMobile()) {
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
      const mobile = window.innerWidth < 768;
      this.isMobile.set(mobile);

      // Auto-collapse on mobile, auto-expand on desktop
      if (mobile) {
        this.isSidebarCollapsed.set(true);
      } else {
        this.isSidebarCollapsed.set(false);
      }
    });
  }
}
