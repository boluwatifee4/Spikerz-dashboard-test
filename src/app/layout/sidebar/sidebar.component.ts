import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  route?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, RouterLink],
  template: `
    <aside
      class="sidebar"
      [class.collapsed]="isCollapsed"
      [class.mobile-hidden]="isMobileAndCollapsed()">

      <!-- Toggle Button -->
      <button
        class="sidebar-toggle"
        (click)="onToggleClick()"
        [class.collapsed]="isCollapsed"
        aria-label="Toggle sidebar">
        <svg
          class="toggle-icon"
          [class.rotated]="isCollapsed"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none">
          <path
            d="M7 4L13 10L7 16"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <!-- Main Navigation Items -->
        <ul class="nav-list">
          <li *ngFor="let item of navigationItems(); trackBy: trackByItemId" class="nav-item">
            <a
              *ngIf="item.route; else noRoute"
              [routerLink]="item.route"
              class="nav-link"
              [class.active]="item.isActive"
              matTooltip="{{ item.label }}"
              matTooltipClass="sidebar-tooltip"
              [matTooltipDisabled]="!isCollapsed"
              matTooltipPosition="right"
              (click)="onNavItemClick(item, $event)">
              <img
                [src]="'assets/icons/sidebar/' + item.icon"
                [alt]="item.label + ' icon'"
                class="nav-icon">
              <span class="nav-text" *ngIf="!isCollapsed">{{ item.label }}</span>
            </a>
            <ng-template #noRoute>
              <a
                href="#"
                class="nav-link"
                [class.active]="item.isActive"
                matTooltip="{{ item.label }}"
                matTooltipClass="sidebar-tooltip"
                [matTooltipDisabled]="!isCollapsed"
                matTooltipPosition="right"
                (click)="onNavItemClick(item, $event)">
                <img
                  [src]="'assets/icons/sidebar/' + item.icon"
                  [alt]="item.label + ' icon'"
                  class="nav-icon">
                <span class="nav-text" *ngIf="!isCollapsed">{{ item.label }}</span>
              </a>
            </ng-template>
          </li>
        </ul>

        <!-- Settings Section -->
        <div class="settings-section">
          <ul class="nav-list">
            <li class="nav-item">
          <a href="#"
            class="nav-link"
            matTooltip="{{ settingsItem().label }}"
            matTooltipClass="sidebar-tooltip"
            [matTooltipDisabled]="!isCollapsed"
            matTooltipPosition="right"
            (click)="onNavItemClick(settingsItem(), $event)">
                <img
                  src="assets/icons/sidebar/settings.svg"
                  alt="Settings icon"
                  class="nav-icon">
                <span class="nav-text" *ngIf="!isCollapsed">Lorem</span>
              </a>
            </li>
            <li class="nav-item" *ngIf="!isCollapsed">
          <a href="#"
            class="nav-link sub-item"
            matTooltip="{{ underSettingsItem().label }}"
            matTooltipClass="sidebar-tooltip"
            [matTooltipDisabled]="!isCollapsed"
            matTooltipPosition="right"
            (click)="onNavItemClick(underSettingsItem(), $event)">
                <img
                  src="assets/icons/sidebar/undersettings.svg"
                  alt="Sub settings icon"
                  class="nav-icon">
                <span class="nav-text">Lorem</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- User Section -->
      <div class="user-section" *ngIf="!isCollapsed">
        <div class="user-info">
          <img
            src="assets/icons/sidebar/user-icon.svg"
            alt="User avatar"
            class="user-avatar">
          <div class="user-details">
            <span class="user-name">Lorem</span>
            <span class="user-subtitle">Lorem</span>
          </div>
        </div>
        <button
          class="sign-out-btn"
          (click)="onSignOut()"
          aria-label="Sign out">
          <img
            src="assets/icons/sidebar/sign-out.svg"
            alt="Sign out icon"
            class="sign-out-icon">
        </button>
      </div>

      <!-- Collapsed User Section -->
      <div class="user-section-collapsed" *ngIf="isCollapsed">
        <button
          class="user-avatar-btn"
          (click)="onUserClick()"
          aria-label="User menu"
          matTooltip="User Profile"
          matTooltipClass="sidebar-tooltip"
          [matTooltipDisabled]="!isCollapsed"
          matTooltipPosition="right">
          <img
            src="assets/icons/sidebar/user-icon.svg"
            alt="User avatar"
            class="user-avatar-small">
        </button>
      </div>
    </aside>
  `,
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() sidebarStateChange = new EventEmitter<boolean>();

  // Navigation items using signals
  navigationItems = signal<NavigationItem[]>([
    { id: 'menu1', label: 'Lorem', icon: 'menu1.svg', isActive: false },
    { id: 'menu2', label: 'Lorem', icon: 'menu2.svg', isActive: false },
    { id: 'menu3', label: 'Lorem', icon: 'menu3.svg', isActive: false },
    { id: 'menu4', label: 'Lorem', icon: 'menu4.svg', isActive: true, route: '/dashboard' }, // Default active - Dashboard
    { id: 'menu5', label: 'Lorem', icon: 'menu5.svg', isActive: false },
    { id: 'menu6', label: 'Lorem', icon: 'menu6.svg', isActive: false },
    { id: 'menu7', label: 'Lorem', icon: 'menu7.svg', isActive: false }
  ]);

  settingsItem = signal({ id: 'settings', label: 'Settings', icon: 'settings.svg', isActive: false });
  underSettingsItem = signal({ id: 'undersettings', label: 'Under Settings', icon: 'undersettings.svg', isActive: false });

  // Computed property for mobile collapsed state
  isMobileAndCollapsed = computed(() => {
    return window.innerWidth < 768 && this.isCollapsed;
  });

  /**
   * Handle toggle button click
   */
  onToggleClick(): void {
    this.toggleSidebar.emit();
    this.sidebarStateChange.emit(!this.isCollapsed);
  }

  /**
   * Handle navigation item click
   */
  onNavItemClick(item: NavigationItem, event: Event): void {
    event.preventDefault();

    // Update active state - only menu4 (Dashboard) should be active for now
    if (item.id === 'menu4') {
      this.updateActiveItem(item.id);
    }

    // console.log(`Navigation clicked: ${item.label}`);
  }

  /**
   * Update active navigation item
   */
  private updateActiveItem(activeId: string): void {
    this.navigationItems.update(items =>
      items.map(item => ({
        ...item,
        isActive: item.id === activeId
      }))
    );
  }

  /**
   * Handle sign out
   */
  onSignOut(): void {
    // console.log('Sign out clicked');
    // Implement sign out logic
  }

  /**
   * Handle user avatar click in collapsed mode
   */
  onUserClick(): void {
    // console.log('User avatar clicked');
    // Could show user menu or expand sidebar
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByItemId(index: number, item: NavigationItem): string {
    return item.id;
  }
}
