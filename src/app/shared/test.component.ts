import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NetworkNode {
  id: string;
  label: string;
  position: { x: number; y: number };
  type: 'user' | 'server' | 'endpoint';
  status: 'active' | 'error';
  metadata?: {
    ip?: string;
    description?: string;
    details?: any;
    pills1?: string[]; // first row of pills
    pills2?: string[]; // second row
    altPills?: string[]; // alternative grouping
    highlightA?: string; // yellow highlight text
    highlightB?: string; // green highlight text
    code?: string; // blue code/number pill
    titleBar?: string; // custom title for user popover
  };
}

interface Connection {
  from: string;
  to: string;
}

@Component({
  selector: 'app-network-diagram',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="network-container">
      <svg class="network-svg" viewBox="0 0 1200 400">
        <!-- Connection Lines (with fork for last two endpoints) -->
        <g class="connections">
          <!-- Straight / simple connections except fork source -->
          <ng-container *ngFor="let connection of baseConnections">
            <line
              [attr.x1]="getNodePosition(connection.from).x"
              [attr.y1]="getNodePosition(connection.from).y"
              [attr.x2]="getNodePosition(connection.to).x"
              [attr.y2]="getNodePosition(connection.to).y"
              stroke="#E0E4EA"
              stroke-width="2.5"
              class="connection-line"
              stroke-linecap="round"
            />
          </ng-container>

          <!-- Fork group -->
          <path
            *ngIf="fork"
            [attr.d]="forkPath"
            stroke="#646F7D"
            stroke-width="2.5"
            fill="none"
            stroke-linecap="round"
            class="connection-line fork-trunk"
          />
          <path
            *ngIf="fork"
            [attr.d]="upperBranchPath"
            stroke="#646F7D"
            stroke-width="2.5"
            fill="none"
            stroke-linecap="round"
            class="connection-line fork-branch"
          />
          <path
            *ngIf="fork"
            [attr.d]="lowerBranchPath"
            stroke="#646F7D"
            stroke-width="2.5"
            fill="none"
            stroke-linecap="round"
            class="connection-line fork-branch"
          />
          <!-- Arrowheads (optional) -->
          <g *ngIf="fork" class="arrows">
            <circle [attr.cx]="getNodePosition(fork.upperTarget).x - 8" [attr.cy]="getNodePosition(fork.upperTarget).y" r="1.5" fill="#646F7D" />
            <circle [attr.cx]="getNodePosition(fork.lowerTarget).x - 8" [attr.cy]="getNodePosition(fork.lowerTarget).y" r="1.5" fill="#646F7D" />
          </g>
        </g>

        <!-- Network Nodes -->
        <g class="nodes">
          <g
            *ngFor="let node of nodes"
            [attr.transform]="'translate(' + node.position.x + ',' + node.position.y + ')'"
            class="node-group"
            (mouseenter)="onNodeEnter(node)"
            (mouseleave)="onNodeLeave()"
          >
            <!-- Node Circle Background (hidden for user composite asset) -->
            <circle
              *ngIf="node.type !== 'user'"
              [attr.r]="getNodeRadius(node)"
              [attr.fill]="getNodeFill(node)"
              stroke="#ffffff"
              stroke-width="4"
              class="node-circle"
              [class.error]="node.status === 'error'"
            />
            <!-- Node Icon (Replaced with actual asset image) -->
            <g class="node-icon">
              <!-- For user node use full size asset replacing circle -->
              <image *ngIf="node.type === 'user'"
                [attr.href]="getNodeIcon(node)"
                [attr.xlink:href]="getNodeIcon(node)"
                [attr.x]="-getNodeRadius(node)"
                [attr.y]="-getNodeRadius(node)"
                [attr.width]="getNodeRadius(node) * 2"
                [attr.height]="getNodeRadius(node) * 2"
                preserveAspectRatio="xMidYMid meet"
              ></image>
              <!-- Inner icon for other types -->
              <image *ngIf="node.type !== 'user'"
                [attr.href]="getNodeIcon(node)"
                [attr.xlink:href]="getNodeIcon(node)"
                [attr.x]="-getNodeRadius(node) * 0.55"
                [attr.y]="-getNodeRadius(node) * 0.55"
                [attr.width]="getNodeRadius(node) * 1.1"
                [attr.height]="getNodeRadius(node) * 1.1"
                preserveAspectRatio="xMidYMid meet"
              ></image>
            </g>

            <!-- Status Badge (error only; user asset already contains badge) -->
            <g *ngIf="node.status === 'error' && node.type !== 'user'" class="status-badge" [attr.transform]="'translate(' + (getNodeRadius(node)-10) + ',' + (-getNodeRadius(node)+10) + ')'">
              <circle r="12" [attr.fill]="node.status === 'error' ? '#DC3D3D' : '#5B4CCE'"></circle>
              <g *ngIf="node.status === 'error'">
                <line x1="-5" y1="-5" x2="5" y2="5" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <line x1="5" y1="-5" x2="-5" y2="5" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </g>
            </g>

            <!-- Node Label -->
            <text
              [attr.y]="getNodeRadius(node) + 20"
              text-anchor="middle"
              class="node-label"
              fill="#374151"
              font-family="system-ui, -apple-system, sans-serif"
              font-size="16"
              font-weight="600"
            >
              {{ node.label }}
            </text>

            <!-- IP Address (if available) -->
            <text
              *ngIf="node.metadata?.ip"
              [attr.y]="getNodeRadius(node) + 38"
              text-anchor="middle"
              class="node-ip"
              fill="#6b7280"
              font-family="system-ui, -apple-system, sans-serif"
              font-size="13"
            >
              {{ node.metadata?.ip }}
            </text>
          </g>
        </g>
      </svg>

      <!-- Hover Tooltip/Component -->
      <div *ngIf="hoveredNode" class="node-tooltip" [ngClass]="{'user-tooltip': hoveredNode.id==='user'}" [style.left.px]="tooltipPosition.x" [style.top.px]="tooltipPosition.y">
        <!-- Variant Popovers -->
        <ng-container [ngSwitch]="hoveredNode.id">
          <!-- 1. User variant (compact redesign) -->
          <div *ngSwitchCase="'user'" class="popover popover-user user-compact">
            <div class="user-compact-title">{{ hoveredNode.metadata?.titleBar || (hoveredNode.label | titlecase) }}</div>
            <div class="user-compact-grid">
              <ng-container *ngFor="let p of (hoveredNode.metadata?.pills1 || []); let i = index">
                <span class="user-compact-pill">{{p}}</span>
              </ng-container>
              <ng-container *ngFor="let p of (hoveredNode.metadata?.pills2 || []); let i = index">
                <span class="user-compact-pill">{{p}}</span>
              </ng-container>
            </div>
            <div class="user-compact-footer" *ngIf="hoveredNode.metadata?.code">{{ hoveredNode.metadata?.code }}</div>
          </div>

          <!-- 2. Server1 variant (design 2) -->
          <div *ngSwitchCase="'server1'" class="popover popover-server">
              <div class="node-row">
                <div class="icon-col">
        <img src="assets/icons/status/stack-bars.svg" class="inline-node-icon" alt="server" />
                </div>
                <div class="header-text">
                  <div class="label-strong">{{ hoveredNode.label }}</div>
                </div>
              </div>
              <div class="section">
                <div class="line"><span class="icon-doc"></span><span class="label-strong">Lorem:</span> <span class="label-strong">Loremipsum Loremipsum</span> <span class="pill pill-purple align-right" *ngIf="hoveredNode.metadata?.code">{{ hoveredNode.metadata?.code }}</span></div>
                <div class="pill-row">
                  <span *ngFor="let p of hoveredNode.metadata?.pills1" class="pill pill-purple">{{p}}</span>
                  <span class="label-strong">Loremipsum</span>
                  <span *ngFor="let p of hoveredNode.metadata?.pills2" class="pill pill-purple">{{p}}</span>
                </div>
              </div>
            </div>

          <!-- 3. Server2 variant (compact redesign) -->
          <div *ngSwitchCase="'server2'" class="popover popover-server2-compact">
            <div class="s2-header">
              <img src="assets/icons/status/stack-bars.svg" class="s2-icon" alt="server" />
              <div class="s2-label">{{ hoveredNode.label }}</div>
            </div>
            <div class="s2-log">
              <span class="icon-doc small"></span><span class="s2-strong">Lorem:</span>
              <span class="s2-yellow">Lorem</span>
              <span class="s2-green">“Ipsum”</span>
              <span class="s2-green">{{ hoveredNode.metadata?.highlightB }}</span>
              <span class="s2-strong">Loremipsum Loremipsum</span>
            </div>
            <div class="s2-pills-row first">
              <span *ngFor="let p of hoveredNode.metadata?.pills1" class="s2-pill purple">{{p}}</span>
              <span class="s2-strong">Loremipsum</span>
              <span *ngFor="let p of hoveredNode.metadata?.pills2" class="s2-pill purple">{{p}}</span>
            </div>
            <div class="s2-log second">
              <span class="icon-doc small"></span><span class="s2-strong">Lorem:</span>
              <span class="s2-yellow">Lorem</span>
              <span class="s2-green">“Ipsum”</span>
              <span class="s2-strong">Loremipsum Loremipsum</span>
            </div>
            <div class="s2-pills-row second">
              <span *ngFor="let p of hoveredNode.metadata?.altPills" class="s2-pill purple">{{p}}</span>
              <span class="s2-code-pill" *ngIf="hoveredNode.metadata?.code">{{ hoveredNode.metadata?.code }}</span>
            </div>
          </div>

          <!-- 4. Endpoint1 variant (design 5 without blue outline) -->
      <div *ngSwitchCase="'endpoint1'" class="popover popover-endpoint" [class.error]="hoveredNode.status==='error'">
            <div class="endpoint-header">
              <div class="endpoint-icon-wrapper">
        <img src="assets/icons/status/unprotected-bar.svg" class="endpoint-icon" alt="endpoint" />
        <div class="error-badge" *ngIf="hoveredNode.status==='error'"><div class="x"></div></div>
              </div>
              <div class="endpoint-head-text">
        <div class="endpoint-label">{{ hoveredNode.label }}</div>
        <div class="endpoint-ip" *ngIf="hoveredNode.metadata?.ip">{{ hoveredNode.metadata?.ip }}</div>
              </div>
            </div>
            <div class="log-line"><span class="icon-doc"></span><span class="label-strong">Lorem:</span> <span class="highlight-yellow">Lorem “Ipsum"</span></div>
      <div class="second-line"><span class="label-strong">Loremipsum</span> <span class="pill pill-blue">{{ hoveredNode.metadata?.code }}</span></div>
          </div>

          <!-- 5. Endpoint2 variant (design 4 simplified) -->
      <div *ngSwitchCase="'endpoint2'" class="popover popover-endpoint" [class.error]="hoveredNode.status==='error'">
            <div class="endpoint-header">
              <div class="endpoint-icon-wrapper">
        <img src="assets/icons/status/unprotected-bar.svg" class="endpoint-icon" alt="endpoint" />
        <div class="error-badge" *ngIf="hoveredNode.status==='error'"><div class="x"></div></div>
              </div>
              <div class="endpoint-head-text">
        <div class="endpoint-label">{{ hoveredNode.label }}</div>
        <div class="endpoint-ip" *ngIf="hoveredNode.metadata?.ip">{{ hoveredNode.metadata?.ip }}</div>
              </div>
            </div>
            <div class="log-line"><span class="icon-doc"></span><span class="label-strong">Lorem:</span> <span class="highlight-yellow">Lorem “Ipsum"</span></div>
      <div class="second-line"><span class="label-strong">Loremipsum</span> <span class="pill pill-blue">{{ hoveredNode.metadata?.code }}</span></div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .network-container {
      position: relative;
      width: 100%;
      height: 400px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 12px;
  /* allow popovers to escape original clipping */
  overflow: visible;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .network-svg {
      width: 100%;
      height: 100%;
    }

    .connection-line {
      transition: stroke 0.3s ease;
    }

    .node-group {
      cursor: pointer;
      transition: filter 0.25s ease;
    }

    .node-group:hover .node-circle, .node-group:hover image {
      filter: brightness(1.05) drop-shadow(0 8px 14px rgba(0,0,0,0.14));
    }

    .node-circle {
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
      transition: all 0.3s ease;
    }

    .node-circle.error {
      animation: pulse-error 2s infinite;
    }

    @keyframes pulse-error {
      0%, 100% { filter: drop-shadow(0 4px 6px rgba(239, 68, 68, 0.3)); }
      50% { filter: drop-shadow(0 4px 12px rgba(239, 68, 68, 0.6)); }
    }

    .node-tooltip {
      position: absolute;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      padding: 16px;
      min-width: 250px;
      max-width: 350px;
      z-index: 1000;
      pointer-events: none; /* keep so it doesn't steal hover */
      transform: translate(-50%, -100%);
      margin-top: -14px;
      animation: fadeIn 120ms ease;
    }

    @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -90%); } to { opacity: 1; transform: translate(-50%, -100%); } }

    .tooltip-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .tooltip-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
    }

    .tooltip-header h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #111827;
    }

    .tooltip-header p {
      margin: 0;
      font-size: 12px;
      color: #6b7280;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      background: #10b981;
      color: white;
      margin-bottom: 8px;
    }

    .status-badge.error {
      background: #ef4444;
    }

    .tooltip-content p {
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #4b5563;
    }

    .details h5 {
      margin: 8px 0 4px 0;
      font-size: 12px;
      font-weight: 600;
      color: #374151;
    }

    .details ul {
      margin: 0;
      padding-left: 16px;
    }

    .details li {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 2px;
    }
  /* Popover Base */
  .popover { font-family: system-ui,-apple-system,sans-serif; color:#2d3748; max-height:280px; overflow:auto; scrollbar-width: thin; }
  .popover-user { width: 360px; }
  .popover { font-family: system-ui,-apple-system,sans-serif; color:#2d3748; max-height:280px; overflow:auto; scrollbar-width: thin; }
  .popover-user { width: 500px; padding: 8px 44px 18px 44px; }
  .popover-server { width: 400px; }
  .popover-server.multi { width: 430px; }
  .popover-endpoint { width: 320px; }
  .popover-title { font-size:16px; font-weight:600; padding:4px 10px; border-radius:6px; margin-bottom:12px; display:inline-block; }
  .popover-title { font-size:16px; font-weight:600; padding:4px 10px; border-radius:6px; margin-bottom:12px; display:inline-block; }
  .red-bg { background:#FFF1F0; color:#C53030; }
  .pill-grid { display:flex; flex-wrap:wrap; gap:8px 18px; padding:0 10px; }
  .pill-grid { display:flex; flex-wrap:wrap; gap:8px 18px; padding:0 10px; }
  .popover-endpoint { width: 320px; }
  /* User popover specific */
  .user-tooltip { border-radius:20px; }
  .popover-user::-webkit-scrollbar { width:6px; }
  .popover-user::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }
  .user-title-pill { background:#FFF1F0; color:#A11E1E; font-weight:600; font-size:15px; padding:6px 14px; border-radius:8px; margin:4px 0 20px 0; letter-spacing:0.5px; }
  .user-pill-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:16px 34px; margin-bottom:26px; }
  .user-pill { background:#FFF1F0; color:#A11E1E; font-weight:600; font-size:14px; padding:10px 18px; border-radius:12px; text-align:left; min-width:110px; }
  .user-footer-pill { background:#F0EAFF; color:#4338CA; font-weight:600; font-size:14px; padding:8px 16px; border-radius:10px; display:inline-block; letter-spacing:0.5px; }
  /* Compact user redesign */
  .user-compact { width:320px; padding:10px 18px 14px 18px; }
  .user-compact-title { background:#FFF1F0; color:#A11E1E; font-weight:600; font-size:13px; padding:6px 12px 6px 12px; border-radius:8px; margin:2px 0 14px 0; letter-spacing:0.3px; line-height:1.15; }
  .user-compact-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:10px 16px; margin-bottom:14px; }
  .user-compact-pill { background:#FFF1F0; color:#A11E1E; font-weight:600; font-size:12px; padding:6px 10px; border-radius:10px; text-align:left; line-height:1.1; }
  .user-compact-footer { background:#F0EAFF; color:#4338CA; font-weight:600; font-size:12.5px; padding:7px 12px; border-radius:10px; display:inline-block; letter-spacing:0.3px; }
  /* Server2 compact redesign */
  .popover-server2-compact { width:360px; padding:8px 14px 12px 14px; }
  .s2-header { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
  .s2-icon { width:36px; height:36px; border-radius:50%; }
  .s2-label { font-weight:600; font-size:13px; }
  .s2-log { display:flex; align-items:center; flex-wrap:wrap; gap:3px; font-size:10.5px; line-height:1.22; margin-top:2px; }
  .s2-log.second { margin-top:6px; }
  .s2-strong { font-weight:600; font-size:11px; }
  .s2-yellow { background:#FFF5DB; padding:1px 4px; border-radius:4px; font-weight:600; color:#9A6B00; font-size:10.5px; }
  .s2-green { background:#E3FCE8; padding:1px 4px; border-radius:4px; font-weight:600; color:#136C27; font-size:10.5px; }
  .s2-pills-row { display:flex; align-items:center; flex-wrap:wrap; gap:5px; margin-top:4px; }
  .s2-pills-row.first { margin-left:22px; }
  .s2-pills-row.second { margin-left:22px; }
  .s2-pill { background:#F0EAFF; color:#4338CA; font-weight:600; font-size:10.5px; padding:4px 8px; border-radius:9px; }
  .s2-pill.purple { background:#F0EAFF; color:#4338CA; }
  .s2-code-pill { background:#E7F0FF; color:#154BA6; font-weight:600; font-size:10.5px; padding:5px 8px; border-radius:9px; letter-spacing:0.25px; }
  .pill { display:inline-block; padding:4px 12px; border-radius:10px; font-weight:600; font-size:12px; letter-spacing:0.5px; }
  .pill-red { background:#FFF1F0; color:#A11E1E; }
  .pill-purple { background:#F0EAFF; color:#4338CA; }
  .pill-blue { background:#E7F0FF; color:#154BA6; }
  .pill .code { font-family:monospace; }
  .footer-pill.big { font-size:14px; margin:18px 0 2px 10px; }
  .node-row { display:flex; align-items:center; gap:12px; margin-bottom:6px; }
  .inline-node-icon { width:46px; height:46px; border-radius:50%; object-fit:contain; }
  .label-strong { font-weight:600; font-size:13px; }
  .icon-doc { width:18px; height:22px; background:#F5F7F9; border:1px solid #d0d7df; border-radius:3px; display:inline-block; margin-right:6px; vertical-align:middle; }
  .section { margin-top:4px; }
  .line { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
  .pill-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:8px; }
  .highlight-yellow { background:#FFF5DB; padding:2px 4px; border-radius:4px; font-weight:600; color:#9A6B00; font-size:12px; }
  .highlight-green { background:#E3FCE8; padding:2px 4px; border-radius:4px; font-weight:600; color:#136C27; font-size:12px; }
  .log-block { margin-top:6px; }
  .log-line { font-size:12px; line-height:1.35; margin-top:4px; display:flex; align-items:center; gap:4px; flex-wrap:wrap; }
  .endpoint-header { display:flex; gap:10px; align-items:flex-start; margin-bottom:8px; }
  .endpoint-icon-wrapper { position:relative; width:60px; height:60px; }
  .endpoint-icon { width:60px; height:60px; border-radius:50%; object-fit:contain; }
  .error-badge { position:absolute; top:-4px; left:40px; background:#DC3D3D; width:26px; height:26px; border-radius:50%; display:flex; justify-content:center; align-items:center; }
  .error-badge .x { position:relative; width:16px; height:16px; }
  .error-badge .x:before, .error-badge .x:after { content:''; position:absolute; top:7px; left:0; right:0; height:2px; background:#fff; }
  .error-badge .x:before { transform:rotate(45deg); }
  .error-badge .x:after { transform:rotate(-45deg); }
  .endpoint-label { font-weight:600; font-size:15px; }
  .endpoint-ip { font-size:12px; color:#4a5568; margin-top:2px; }
  .second-line { margin-top:10px; display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
  .second-line .pill-blue { font-size:14px; font-weight:600; letter-spacing:0.5px; }
  .popover-endpoint.error { border:2px solid transparent; }
  .popover-endpoint:focus-within, .popover-endpoint:hover { outline: none; }
  .popover-endpoint.focused { box-shadow:0 0 0 2px #2563EB inset; }
  .arrows circle { opacity:0.9; }
  .fork-trunk, .fork-branch { stroke-linejoin:round; }
  .connection-line { transition:stroke 0.3s ease; }
  .connection-line:hover { stroke:#1E3A8A; }
  `]
})
export class NetworkDiagramComponent implements OnDestroy {
  hoveredNode: NetworkNode | null = null;
  tooltipPosition = { x: 0, y: 0 };
  customTooltipComponent: any = null;
  private showTimer: any = null;
  private hideTimer: any = null;

  nodes: NetworkNode[] = [
    {
      id: 'user',
      label: 'Loremipsum',
      position: { x: 150, y: 200 },
      type: 'user',
      status: 'active',
      metadata: {
        description: 'Client workstation',
        details: {
          'OS': 'Windows 11',
          'Browser': 'Chrome 118',
          'Location': 'Office Network'
        },
        pills1: ['1.2.3.4', '1.2.3.4', '1.2.3.4'],
        pills2: ['1.2.3.4', '1.2.3.4', '1.2.3.4'],
        code: 'Lorem: 1.2.3.4',
        titleBar: 'Lorem Ipsum Dolor Sit'
      }
    },
    {
      id: 'server1',
      label: 'Loremipsu',
      position: { x: 350, y: 200 },
      type: 'server',
      status: 'active',
      metadata: {
        description: 'Application server',
        details: {
          'CPU': '85%',
          'Memory': '12GB/16GB',
          'Uptime': '15 days'
        },
        pills1: ['1.2.3.4'],
        pills2: ['1.2.3.4', '1.2.3.4'],
        code: '1.2.3.4'
      }
    },
    {
      id: 'server2',
      label: 'Loremipsu',
      position: { x: 550, y: 200 },
      type: 'server',
      status: 'active',
      metadata: {
        description: 'Database server',
        details: {
          'CPU': '45%',
          'Memory': '8GB/16GB',
          'Storage': '450GB/1TB'
        },
        pills1: ['1.2.3.4', '1.2.3.4'],
        pills2: ['1.2.3.4'],
        altPills: ['1.2.3.4', '1.2.3.4', '1.2.3.4'],
        highlightB: 'Lorem',
        code: 'Lorem 1234,5678'
      }
    },
    {
      id: 'endpoint1',
      label: 'Loremipsumdolorsit',
      // Raised higher for more pronounced fork
      position: { x: 980, y: 90 },
      type: 'endpoint',
      status: 'error',
      metadata: {
        ip: '192.168.1.1',
        description: 'External API endpoint - Connection timeout',
        details: {
          'Last Response': '2 hours ago',
          'Error': 'Connection timeout',
          'Retry Count': '3'
        },
        code: 'Lorem 1234,5678'
      }
    },
    {
      id: 'endpoint2',
      label: 'Loremipsumdolorsit002',
      // Lower further for spacing
      position: { x: 980, y: 310 },
      type: 'endpoint',
      status: 'error',
      metadata: {
        ip: '192.168.1.2',
        description: 'Backup server - Service unavailable',
        details: {
          'Last Backup': 'Failed',
          'Error': 'Service unavailable',
          'Status Code': '503'
        },
        code: 'Lorem 1234,5678'
      }
    }
  ];

  // Base straight connections (exclude forked ones)
  baseConnections: Connection[] = [
    { from: 'user', to: 'server1' },
    { from: 'server1', to: 'server2' }
  ];

  fork = {
    source: 'server2',
    upperTarget: 'endpoint1',
    lowerTarget: 'endpoint2'
  };

  // Computed path strings
  forkPath = '';
  upperBranchPath = '';
  lowerBranchPath = '';

  getNodePosition(nodeId: string): { x: number; y: number } {
    const node = this.nodes.find(n => n.id === nodeId);
    return node ? node.position : { x: 0, y: 0 };
  }

  getNodeColor(node: NetworkNode): string {
    if (node.status === 'error') {
      return '#ef4444'; // Red for error
    }

    switch (node.type) {
      case 'user':
        return '#8b5cf6'; // Purple
      case 'server':
        return '#3b82f6'; // Blue
      case 'endpoint':
        return '#10b981'; // Green
      default:
        return '#6b7280'; // Gray
    }
  }

  onNodeEnter(node: NetworkNode): void {
    // Cancel pending hide
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    // If already showing same node just keep it
    if (this.hoveredNode && this.hoveredNode.id === node.id) return;
    if (this.showTimer) clearTimeout(this.showTimer);
    this.showTimer = setTimeout(() => {
      this.hoveredNode = node;
      this.positionTooltipForNode(node);
    }, 120); // small delay to prevent flicker when moving across nodes
  }

  onNodeLeave(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    // Delay hiding slightly so small gaps don't cause flicker
    this.hideTimer = setTimeout(() => {
      this.hoveredNode = null;
      this.customTooltipComponent = null;
    }, 120);
  }

  private positionTooltipForNode(node: NetworkNode) {
    const container: HTMLElement | null = document.querySelector('.network-container');
    const popoverWidth = this.getPopoverWidth(node.id);
    const radius = this.getNodeRadius(node);
    let x = node.position.x;
    let y = node.position.y - (radius + 25); // default above

    if (container) {
      const rect = container.getBoundingClientRect();
      // horizontal clamp
      const half = popoverWidth / 2;
      const minX = 20 + half;
      const maxX = rect.width - 20 - half;
      x = Math.min(Math.max(x, minX), maxX);

      // If not enough space above (y < 140) place below
      if (y < 10) {
        y = node.position.y + radius + 24; // below
      }

      // If still bottom overflow adjust upward
      const approxHeight = 240; // average; could measure later
      if (y - approxHeight < -40) {
        y = approxHeight + 10;
      }
      const bottomOverflow = y + 20 - rect.height;
      if (bottomOverflow > 0) {
        y -= bottomOverflow + 20;
      }
    }
    this.tooltipPosition = { x, y };
  }
  getNodeIcon(node: NetworkNode): string {
    if (node.type === 'user') return 'assets/icons/status/amaya-users.svg';
    if (node.type === 'server') return 'assets/icons/status/stack-bars.svg';
    if (node.type === 'endpoint') {
      return node.status === 'error' ? 'assets/icons/status/unprotected.svg' : 'assets/icons/status/protected.svg';
    }
    return 'assets/icons/status/protected.svg';
  }

  getNodeFill(node: NetworkNode): string {
    if (node.type === 'user') return '#FFF1F0';
    return '#E6F1FF';
  }

  getNodeRadius(node: NetworkNode): number {
    return 55; // centralised radius; adjust here if needed per type later
  }

  private getPopoverWidth(id: string): number {
    switch (id) {
      case 'user': return 320;
      case 'server1': return 400;
      case 'server2': return 360;
      // server2 old width replaced by compact redesign width
      case 'endpoint1':
      case 'endpoint2': return 320;
      default: return 360;
    }
  }

  ngOnDestroy(): void {
    if (this.showTimer) clearTimeout(this.showTimer);
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }

  ngAfterViewInit(): void {
    this.buildForkPaths();
  }

  private buildForkPaths() {
    const src = this.getNodePosition(this.fork.source);
    const upper = this.getNodePosition(this.fork.upperTarget);
    const lower = this.getNodePosition(this.fork.lowerTarget);

    // Horizontal trunk to branching point (mid X between source and targets)
    const branchX = src.x + (upper.x - src.x) * 0.45; // control where split occurs
    const r = this.getNodeRadius({} as any) - 5; // approximate radius for offset
    const startX = src.x + r;
    const startY = src.y;

    // Trunk path (slightly curved for elegance)
    const ctrl1X = startX + (branchX - startX) * 0.5;
    this.forkPath = `M ${startX} ${startY} Q ${ctrl1X} ${startY} ${branchX} ${startY}`;

    // Upper branch (smooth curve upward)
    const midUpperY = (startY + upper.y) / 2;
    const ctrlUpper1X = branchX + (upper.x - branchX) * 0.15;
    const ctrlUpper1Y = startY - 20;
    const ctrlUpper2X = branchX + (upper.x - branchX) * 0.55;
    const ctrlUpper2Y = upper.y - 30;
    this.upperBranchPath = `M ${branchX} ${startY} C ${ctrlUpper1X} ${ctrlUpper1Y}, ${ctrlUpper2X} ${ctrlUpper2Y}, ${upper.x - r} ${upper.y}`;

    // Lower branch (smooth curve downward)
    const ctrlLower1X = branchX + (lower.x - branchX) * 0.15;
    const ctrlLower1Y = startY + 20;
    const ctrlLower2X = branchX + (lower.x - branchX) * 0.55;
    const ctrlLower2Y = lower.y + 30;
    this.lowerBranchPath = `M ${branchX} ${startY} C ${ctrlLower1X} ${ctrlLower1Y}, ${ctrlLower2X} ${ctrlLower2Y}, ${lower.x - r} ${lower.y}`;
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  // Method to set custom tooltip component
  setCustomTooltipComponent(component: any): void {
    this.customTooltipComponent = component;
  }

  // Helper method for dependency injection (if needed for custom components)
  createInjector(node: NetworkNode): any {
    // You can create a custom injector here to pass data to custom components
    return null; // Simplified for this example
  }
}
