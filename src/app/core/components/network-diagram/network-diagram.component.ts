import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class NetworkDiagramComponent implements OnInit, OnDestroy {
  hoveredNode: NetworkNode | null = null;
  tooltipPosition = { x: 0, y: 0 };
  customTooltipComponent: any = null;
  private showTimer: any = null;
  private hideTimer: any = null;

  nodes: NetworkNode[] = [
    { id: 'user', label: 'Loremipsum', position: { x: 120, y: 200 }, type: 'user', status: 'active', metadata: { pills1: ['1.2.3.4', '1.2.3.4', '1.2.3.4'], pills2: ['1.2.3.4', '1.2.3.4', '1.2.3.4'], code: 'Lorem: 1.2.3.4', titleBar: 'Lorem Ipsum Dolor Sit' } },
    { id: 'server1', label: 'Loremipsu', position: { x: 320, y: 200 }, type: 'server', status: 'active', metadata: { pills1: ['1.2.3.4'], pills2: ['1.2.3.4', '1.2.3.4'], code: '1.2.3.4' } },
    { id: 'server2', label: 'Loremipsu', position: { x: 520, y: 200 }, type: 'server', status: 'active', metadata: { pills1: ['1.2.3.4', '1.2.3.4'], pills2: ['1.2.3.4'], altPills: ['1.2.3.4', '1.2.3.4', '1.2.3.4'], highlightB: 'Lorem', code: 'Lorem 1234,5678' } },
    // Increased spacing between endpoint1 and endpoint2 (previously y:150 and y:250)
    // Further increased spacing (was 140 / 260)
    { id: 'endpoint1', label: 'Loremipsumdolorsit', position: { x: 850, y: 100 }, type: 'endpoint', status: 'error', metadata: { ip: '192.168.1.1', code: 'Lorem 1234,5678' } },
    { id: 'endpoint2', label: 'Loremipsumdolorsit002', position: { x: 850, y: 240 }, type: 'endpoint', status: 'error', metadata: { ip: '192.168.1.2', code: 'Lorem 1234,5678' } }
  ];

  baseConnections: Connection[] = [
    { from: 'user', to: 'server1' },
    { from: 'server1', to: 'server2' }
  ];
  fork = { source: 'server2', upperTarget: 'endpoint1', lowerTarget: 'endpoint2' };
  forkPath = '';
  upperBranchPath = '';
  lowerBranchPath = '';
  forkExactTransform = '';
  useExactFork = true; // toggle if needed
  forkHandlePath = '';
  forkCompression = 0.75; // reduced further (0-1 shrink horizontally; lower = narrower)

  getNodePosition(id: string) { const n = this.nodes.find(x => x.id === id); return n ? n.position : { x: 0, y: 0 }; }
  getNodeIcon(n: NetworkNode) { if (n.type === 'user') return 'assets/icons/status/amaya-users.svg'; if (n.type === 'server') return 'assets/icons/status/stack-bars.svg'; return n.status === 'error' ? 'assets/icons/status/unprotected-bar.svg' : 'assets/icons/status/protected-bar.svg'; }
  getNodeImageSize() { return 72; } // Updated size per latest request
  getDefaultRadius() { return 55; }
  private getPopoverWidth(id: string) { switch (id) { case 'user': return 320; case 'server1': return 400; case 'server2': return 360; case 'endpoint1': case 'endpoint2': return 320; default: return 360; } }
  onNodeEnter(node: NetworkNode) { if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; } if (this.hoveredNode?.id === node.id) return; if (this.showTimer) clearTimeout(this.showTimer); this.showTimer = setTimeout(() => { this.hoveredNode = node; this.positionTooltipForNode(node); }, 120); }
  onNodeLeave() { if (this.showTimer) { clearTimeout(this.showTimer); this.showTimer = null; } this.hideTimer = setTimeout(() => { this.hoveredNode = null; this.customTooltipComponent = null; }, 120); }
  private positionTooltipForNode(node: NetworkNode) { const container = document.querySelector('.network-container') as HTMLElement | null; const w = this.getPopoverWidth(node.id); const r = this.getDefaultRadius(); let x = node.position.x; let y = node.position.y - (r + 25); if (container) { const rect = container.getBoundingClientRect(); const half = w / 2; const minX = 20 + half; const maxX = rect.width - 20 - half; x = Math.min(Math.max(x, minX), maxX); if (y < 10) y = node.position.y + r + 24; const approxHeight = 240; if (y - approxHeight < -40) y = approxHeight + 10; const bottomOverflow = y + 20 - rect.height; if (bottomOverflow > 0) y -= bottomOverflow + 20; } this.tooltipPosition = { x, y }; }
  constructor(private cdr: ChangeDetectorRef) { }
  ngOnInit() {
    // Build immediately so the fork transform is present on first render
    this.buildForkPaths();
    // Rebuild next tick in case images or layout shift sizes slightly
    setTimeout(() => { this.buildForkPaths(); this.cdr.markForCheck(); }, 0);
  }

  private buildForkPaths() {
    const src = this.getNodePosition(this.fork.source);
    const upper = this.getNodePosition(this.fork.upperTarget);
    const lower = this.getNodePosition(this.fork.lowerTarget);
    const r = this.getDefaultRadius();
    // Starting coordinates (right edge of source node)
    const startX = src.x + r;
    const startY = src.y;
    if (!this.useExactFork) {
      // Fallback dynamic version (kept for potential future use)
      const upperEndX = upper.x - r;
      const upperEndY = upper.y;
      const lowerEndX = lower.x - r;
      const lowerEndY = lower.y;
      const totalWidth = Math.min(upperEndX, lowerEndX) - startX;
      const splitRatio = 0.32;
      const splitX = startX + totalWidth * splitRatio;
      const curveWidth = (Math.min(upperEndX, lowerEndX) - splitX);
      const c1 = splitX + curveWidth * 0.25;
      const c2 = splitX + curveWidth * 0.75;
      this.forkPath = `M ${startX} ${startY} L ${splitX} ${startY}`;
      this.upperBranchPath = `M ${splitX} ${startY} C ${c1} ${startY}, ${c2} ${upperEndY}, ${upperEndX} ${upperEndY}`;
      this.lowerBranchPath = `M ${splitX} ${startY} C ${c1} ${startY}, ${c2} ${lowerEndY}, ${lowerEndX} ${lowerEndY}`;
      this.forkExactTransform = '';
      return;
    }

    // EXACT SVG fork approach: we transform the original 208x110 design to fit between server2 and endpoints.
    const endpointUpperXLeft = upper.x - r; // where arrow tip should end
    const endpointLowerXLeft = lower.x - r; // assume same
    const targetArrowX = Math.min(endpointUpperXLeft, endpointLowerXLeft);

    // Original path key x references: trunk start at 80.8318, arrow tip at 208
    const designTrunkStartX = 80.8318;
    const designArrowTipX = 208;
    const designSpan = designArrowTipX - designTrunkStartX; // 127.1682
    const availableSpan = targetArrowX - startX;
    const desiredSpan = availableSpan * this.forkCompression;
    const scaleX = desiredSpan / designSpan;

    // Vertical mapping: design baseline (split) around ~55.5; top arrow tip y≈2.56104 bottom tip y≈107.279
    const designTopY = 2.56104;
    const designBottomY = 107.279;
    const designCenterY = 55.5; // approximate split mid
    const designHeight = designBottomY - designTopY; // 104.718
    const realTopY = upper.y; // endpoint upper center
    const realBottomY = lower.y; // endpoint lower center
    const realHeight = realBottomY - realTopY;
    const scaleY = realHeight / designHeight;

    // Translation so that trunk start aligns to source right edge & vertical center aligns
    // Anchor at arrow tip so it still reaches endpoints after compression
    const tx = targetArrowX - scaleX * designArrowTipX;
    const ty = startY - scaleY * designCenterY;
    this.forkExactTransform = `translate(${tx.toFixed(3)},${ty.toFixed(3)}) scale(${scaleX.toFixed(4)},${scaleY.toFixed(4)})`;

    // Handle (extend a bit to the left before original trunk start)
    const trunkStartTransformed = tx + scaleX * designTrunkStartX;
    // Draw handle from source node edge to new trunk start
    this.forkHandlePath = `M ${startX.toFixed(2)} ${startY} L ${trunkStartTransformed.toFixed(2)} ${startY}`;

    // Clear dynamic stroke paths so template can switch cleanly
    this.forkPath = '';
    this.upperBranchPath = '';
    this.lowerBranchPath = '';
  }
  ngOnDestroy() {
    if (this.showTimer) clearTimeout(this.showTimer);
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }
}
