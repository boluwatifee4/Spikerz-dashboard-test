import { Component, signal } from '@angular/core';
import { ServerAccordionItem, ServerAccordionItemComponent } from '../../shared/components/server-accordion-item/server-accordion-item.component';

@Component({
  selector: 'app-dashboard',
  imports: [ServerAccordionItemComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  serverItems = signal<ServerAccordionItem[]>([
    {
      title: 'Lorem S',
      type: 'Server',
      subtitle: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
      description: 'Lorem Ipsum Dolor Sit Amet Consectetur. Quis Viverra Etiam Pellentesque Lectus Semper In Massa Purus. Auctor Aenean Aenean Senectus Massa Dignissim Vehicula Mi Erat Purus. Praesent Scelerisque Aliquet Metus Sagittis Dictum Sed Sed. Sed Venenatis Sed Una Quam.',
      iconPath: 'assets/icons/status/stack-bars.svg'
    },
    {
      title: 'Lorem S',
      type: 'Server',
      subtitle: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
      description: 'Lorem Ipsum Dolor Sit Amet Consectetur. Quis Viverra Etiam Pellentesque Lectus Semper In Massa Purus. Auctor Aenean Aenean Senectus Massa Dignissim Vehicula Mi Erat Purus. Praesent Scelerisque Aliquet Metus Sagittis Dictum Sed Sed. Sed Venenatis Sed Una Quam.',
      iconPath: 'assets/icons/status/stack-bars.svg'
    },
    {
      title: 'Lorem S',
      type: 'Server',
      subtitle: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
      description: 'Lorem Ipsum Dolor Sit Amet Consectetur. Quis Viverra Etiam Pellentesque Lectus Semper In Massa Purus. Auctor Aenean Aenean Senectus Massa Dignissim Vehicula Mi Erat Purus. Praesent Scelerisque Aliquet Metus Sagittis Dictum Sed Sed. Sed Venenatis Sed Una Quam.',
      iconPath: 'assets/icons/status/stack-bars.svg'
    }
  ]);

}
