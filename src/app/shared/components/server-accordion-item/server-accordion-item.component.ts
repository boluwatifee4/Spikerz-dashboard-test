import { Component, Input, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

export interface ServerAccordionItem {
  title: string;
  type: string; // e.g., 'Server'
  subtitle: string; // short desc for collapsed state
  description: string; // full body when expanded
  iconPath: string; // relative path under public assets
}

@Component({
  selector: 'app-server-accordion-item',
  standalone: true,
  imports: [NgIf],
  templateUrl: './server-accordion-item.component.html',
  styleUrl: './server-accordion-item.component.scss',
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class ServerAccordionItemComponent {
  @Input() item!: ServerAccordionItem;
  @Input() defaultOpen = false;

  open = signal(false);

  ngOnInit() {
    this.open.set(this.defaultOpen);
  }

  toggle() {
    this.open.update(v => !v);
  }
}
