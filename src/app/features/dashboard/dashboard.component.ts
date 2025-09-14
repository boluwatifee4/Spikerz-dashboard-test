import { Component, signal, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServerAccordionItem, ServerAccordionItemComponent } from '../../shared/components/server-accordion-item/server-accordion-item.component';
import { NgxGraphModule, DagreNodesOnlyLayout } from '@swimlane/ngx-graph';
import * as shape from 'd3-shape';
import { NetworkDiagramComponent } from '../../core/components/network-diagram/network-diagram.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ServerAccordionItemComponent, NgxGraphModule, NetworkDiagramComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  @ViewChild('nodeTemplate', { static: true }) nodeTemplate!: TemplateRef<any>;

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

  // Flow chart (ngx-graph) data
  nodes = signal<any[]>([
    {
      id: '1',
      label: 'Loremipsumm',
      data: {
        icon: 'assets/icons/status/amaya-users.svg',
        type: 'user',
        status: 'critical'
      }
    },
    {
      id: '2',
      label: 'Loremipsu',
      data: {
        icon: 'assets/icons/status/stack-bars.svg',
        type: 'server',
        status: 'normal'
      }
    },
    {
      id: '3',
      label: 'Loremipsu',
      data: {
        icon: 'assets/icons/status/stack-bars.svg',
        type: 'server',
        status: 'normal'
      }
    },
    {
      id: '4',
      label: 'Loremipsumdolorsit',
      data: {
        icon: 'assets/icons/status/stack-bars.svg',
        type: 'server',
        ip: '192.168.1.1',
        status: 'critical'
      }
    },
    {
      id: '5',
      label: 'Loremipsumdolorsit002',
      data: {
        icon: 'assets/icons/status/stack-bars.svg',
        type: 'server',
        ip: '192.168.1.2',
        status: 'critical'
      }
    }
  ]);

  links = signal<any[]>([
    { id: 'l1', source: '1', target: '2' },
    { id: 'l2', source: '2', target: '3' },
    { id: 'l3', source: '3', target: '4' },
    { id: 'l4', source: '3', target: '5' }
  ]);

  // Layout + curve
  layout = new DagreNodesOnlyLayout();
  layoutSettings = {
    orientation: 'LR',
    edgePadding: 60,
    nodePadding: 40,
    rankPadding: 80
  } as const;
  curved = shape.curveMonotoneX;
}
