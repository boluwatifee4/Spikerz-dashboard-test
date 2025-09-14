import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NetworkNode {
  id: string;
  label: string;
  position: { x: number; y: number };
  type: 'user' | 'server' | 'endpoint';
  status?: string;
  metadata?: {
    pills1?: string[];
    pills2?: string[];
    altPills?: string[];
    highlightA?: string;
    highlightB?: string;
    code?: string;
    titleBar?: string;
    ip?: string;
    description?: string;
    details?: any;
  };
}

interface Connection { from: string; to: string; }

@Component({
  selector: 'app-network-diagram',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './network-diagram.component.html',
  styleUrls: ['./network-diagram.component.scss']
})
export class NetworkDiagramComponent implements OnDestroy {
  hoveredNode: NetworkNode | null = null;
  tooltipPosition = { x: 0, y: 0 };
  customTooltipComponent: any = null;
  private showTimer: any = null;
  private hideTimer: any = null;

  nodes: NetworkNode[] = [
    { id: 'user', label: 'Loremipsum', position: { x: 150, y: 200 }, type: 'user', status: 'active', metadata: { pills1: ['1.2.3.4', '1.2.3.4', '1.2.3.4'], pills2: ['1.2.3.4', '1.2.3.4', '1.2.3.4'], code: 'Lorem: 1.2.3.4', titleBar: 'Lorem Ipsum Dolor Sit' } },
    { id: 'server1', label: 'Loremipsu', position: { x: 350, y: 200 }, type: 'server', status: 'active', metadata: { pills1: ['1.2.3.4'], pills2: ['1.2.3.4', '1.2.3.4'], code: '1.2.3.4' } },
    { id: 'server2', label: 'Loremipsu', position: { x: 550, y: 200 }, type: 'server', status: 'active', metadata: { pills1: ['1.2.3.4', '1.2.3.4'], pills2: ['1.2.3.4'], altPills: ['1.2.3.4', '1.2.3.4', '1.2.3.4'], highlightB: 'Lorem', code: 'Lorem 1234,5678' } },
    { id: 'endpoint1', label: 'Loremipsumdolorsit', position: { x: 980, y: 90 }, type: 'endpoint', status: 'error', metadata: { ip: '192.168.1.1', code: 'Lorem 1234,5678' } },
    { id: 'endpoint2', label: 'Loremipsumdolorsit002', position: { x: 980, y: 310 }, type: 'endpoint', status: 'error', metadata: { ip: '192.168.1.2', code: 'Lorem 1234,5678' } }
  ];

  baseConnections: Connection[] = [
    { from: 'user', to: 'server1' },
    { from: 'server1', to: 'server2' }
  ];
  fork = { source: 'server2', upperTarget: 'endpoint1', lowerTarget: 'endpoint2' };
  forkPath = '';
  upperBranchPath = '';
  lowerBranchPath = '';

  getNodePosition(id: string) { const n = this.nodes.find(x => x.id === id); return n ? n.position : { x: 0, y: 0 }; }
  getNodeIcon(n: NetworkNode) { if (n.type === 'user') return 'assets/icons/status/amaya-users.svg'; if (n.type === 'server') return 'assets/icons/status/stack-bars.svg'; return n.status === 'error' ? 'assets/icons/status/unprotected.svg' : 'assets/icons/status/protected.svg'; }
  getNodeFill(n: NetworkNode) { return n.type === 'user' ? '#FFF1F0' : '#E6F1FF'; }
  getNodeRadius(_n: NetworkNode) { return 55; }
  private getPopoverWidth(id: string) { switch (id) { case 'user': return 320; case 'server1': return 400; case 'server2': return 360; case 'endpoint1': case 'endpoint2': return 320; default: return 360; } }
  onNodeEnter(node: NetworkNode) { if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; } if (this.hoveredNode?.id === node.id) return; if (this.showTimer) clearTimeout(this.showTimer); this.showTimer = setTimeout(() => { this.hoveredNode = node; this.positionTooltipForNode(node); }, 120); }
  onNodeLeave() { if (this.showTimer) { clearTimeout(this.showTimer); this.showTimer = null; } this.hideTimer = setTimeout(() => { this.hoveredNode = null; this.customTooltipComponent = null; }, 120); }
  private positionTooltipForNode(node: NetworkNode) { const container = document.querySelector('.network-container') as HTMLElement | null; const w = this.getPopoverWidth(node.id); const r = this.getNodeRadius(node); let x = node.position.x; let y = node.position.y - (r + 25); if (container) { const rect = container.getBoundingClientRect(); const half = w / 2; const minX = 20 + half; const maxX = rect.width - 20 - half; x = Math.min(Math.max(x, minX), maxX); if (y < 10) y = node.position.y + r + 24; const approxHeight = 240; if (y - approxHeight < -40) y = approxHeight + 10; const bottomOverflow = y + 20 - rect.height; if (bottomOverflow > 0) y -= bottomOverflow + 20; } this.tooltipPosition = { x, y }; }
  ngAfterViewInit() { this.buildForkPaths(); }
  private buildForkPaths() {
    const src = this.getNodePosition(this.fork.source);
    const upper = this.getNodePosition(this.fork.upperTarget);
    const lower = this.getNodePosition(this.fork.lowerTarget);

    const branchX = src.x + (upper.x - src.x) * 0.45;
    const r = this.getNodeRadius({} as any) - 5;
    const startX = src.x + r;
    const startY = src.y;
    const ctrl1X = startX + (branchX - startX) * 0.5;
    this.forkPath = `M ${startX} ${startY} Q ${ctrl1X} ${startY} ${branchX} ${startY}`;

    const ctrlUpper1X = branchX + (upper.x - branchX) * 0.15;
    const ctrlUpper1Y = startY - 20;
    const ctrlUpper2X = branchX + (upper.x - branchX) * 0.55;
    const ctrlUpper2Y = upper.y - 30;
    this.upperBranchPath = `M ${branchX} ${startY} C ${ctrlUpper1X} ${ctrlUpper1Y}, ${ctrlUpper2X} ${ctrlUpper2Y}, ${upper.x - r} ${upper.y}`;

    const ctrlLower1X = branchX + (lower.x - branchX) * 0.15;
    const ctrlLower1Y = startY + 20;
    const ctrlLower2X = branchX + (lower.x - branchX) * 0.55;
    const ctrlLower2Y = lower.y + 30;
    this.lowerBranchPath = `M ${branchX} ${startY} C ${ctrlLower1X} ${ctrlLower1Y}, ${ctrlLower2X} ${ctrlLower2Y}, ${lower.x - r} ${lower.y}`;
  }
  ngOnDestroy() {
    if (this.showTimer) clearTimeout(this.showTimer);
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }
}
