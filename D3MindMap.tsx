import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SmartNote } from '../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Home,
  Search,
  Download,
  Sparkles,
  Play,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
  Target,
  Compass
} from 'lucide-react';

interface D3MindMapProps {
  note: SmartNote;
  onAskAI?: (prompt: string) => void;
  onPlayTimestamp?: (seconds: number) => void;
}

interface MindMapNodeDatum {
  id: string;
  name: string;
  description: string;
  group: 'core' | 'insight' | 'action' | 'decision' | 'deadline' | 'concept';
  timestamp?: string;
  seconds?: number;
  children?: MindMapNodeDatum[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export const D3MindMap: React.FC<D3MindMapProps> = ({ note, onAskAI, onPlayTimestamp }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<MindMapNodeDatum | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const zoomBehaviorRef = useRef<any>(null);
  const svgSelectionRef = useRef<any>(null);
  const gSelectionRef = useRef<any>(null);

  // Build hierarchical data structure
  const buildHierarchy = (): MindMapNodeDatum => {
    const coreNode: MindMapNodeDatum = {
      id: 'core',
      name: note.title || 'Voice Note Mind Map',
      description: note.summary || 'Primary subject and overview of the recording.',
      group: 'core',
      timestamp: '00:00',
      seconds: 0,
      children: []
    };

    const childrenMap: MindMapNodeDatum[] = [];

    // Key Insights
    if (note.keyPoints && note.keyPoints.length > 0) {
      const insightChild: MindMapNodeDatum = {
        id: 'insights_branch',
        name: 'Key Insights',
        description: 'Major takeaways and strategic insights extracted from discussion.',
        group: 'insight',
        children: note.keyPoints.map((pt, idx) => ({
          id: `insight_${idx}`,
          name: pt,
          description: `Key insight #${idx + 1}: ${pt}`,
          group: 'insight',
          timestamp: `0${Math.floor(idx * 1.5)}:15`,
          seconds: idx * 90
        }))
      };
      childrenMap.push(insightChild);
    }

    // Action Items
    if (note.actionItems && note.actionItems.length > 0) {
      const actionChild: MindMapNodeDatum = {
        id: 'actions_branch',
        name: 'Action Items',
        description: 'Tasks assigned and follow-up activities.',
        group: 'action',
        children: note.actionItems.map((act, idx) => ({
          id: `action_${idx}`,
          name: act.task,
          description: `Assigned to: ${act.assignee || 'Team'}${act.dueDate ? ` | Due: ${act.dueDate}` : ''}`,
          group: 'action',
          timestamp: `0${idx + 2}:00`,
          seconds: (idx + 2) * 60
        }))
      };
      childrenMap.push(actionChild);
    }

    // Decisions
    if (note.decisionMatrix && note.decisionMatrix.options) {
      const decisionChild: MindMapNodeDatum = {
        id: 'decisions_branch',
        name: 'Decisions & Dilemmas',
        description: note.decisionMatrix.dilemma || 'Key decision paths.',
        group: 'decision',
        children: note.decisionMatrix.options.map((opt, idx) => ({
          id: `decision_${idx}`,
          name: opt.option,
          description: `Suitability: ${opt.suitability || 'High'}`,
          group: 'decision',
          timestamp: `0${idx + 3}:30`,
          seconds: (idx + 3) * 90
        }))
      };
      childrenMap.push(decisionChild);
    }

    // Deadlines
    if (note.deadlines && note.deadlines.length > 0) {
      const deadlineChild: MindMapNodeDatum = {
        id: 'deadlines_branch',
        name: 'Deadlines & Timeline',
        description: 'Scheduled milestones and deliverables.',
        group: 'deadline',
        children: note.deadlines.map((dl, idx) => ({
          id: `deadline_${idx}`,
          name: dl.event,
          description: `Date: ${dl.date}`,
          group: 'deadline',
          timestamp: `0${idx + 4}:00`,
          seconds: (idx + 4) * 60
        }))
      };
      childrenMap.push(deadlineChild);
    }

    // Supporting Concepts / Questions
    if (note.questions && note.questions.length > 0) {
      const conceptChild: MindMapNodeDatum = {
        id: 'concepts_branch',
        name: 'Open Questions',
        description: 'Unresolved queries and discussion points.',
        group: 'concept',
        children: note.questions.map((q, idx) => ({
          id: `question_${idx}`,
          name: q,
          description: 'Open discussion item requiring review.',
          group: 'concept',
          timestamp: `0${idx + 5}:10`,
          seconds: (idx + 5) * 70
        }))
      };
      childrenMap.push(conceptChild);
    }

    coreNode.children = childrenMap;
    return coreNode;
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svgSelectionRef.current = svg;
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = 560;

    svg.attr('width', '100%').attr('height', containerHeight).attr('viewBox', [0, 0, containerWidth, containerHeight]);

    const g = svg.append('g');
    gSelectionRef.current = g;

    // Zoom setup
    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 3.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom as any);

    // Build hierarchical tree layout
    const rootData = buildHierarchy();
    const root = d3.hierarchy(rootData, (d) => (collapsedNodes[d.id] ? undefined : d.children));

    // Tree layout calculation
    const treeLayout = d3
      .tree<MindMapNodeDatum>()
      .size([360, Math.min(containerWidth, containerHeight) * 0.38])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2));

    // For radial tree or standard tidy tree
    // Let's use a radial layout computed from root
    const nodesList = root.descendants();
    const linksList = root.links();

    // Center coordinates
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // Compute radial positions manually or using d3.cluster / tree radial
    // Radial positioning: angle = (node.x / 180) * PI, radius = node.y
    nodesList.forEach((d: any) => {
      if (d.depth === 0) {
        d.px = centerX;
        d.py = centerY;
      } else {
        const angle = ((d.x - 90) * Math.PI) / 180;
        const radius = d.y * 1.1;
        d.px = centerX + radius * Math.cos(angle);
        d.py = centerY + radius * Math.sin(angle);
      }
    });

    // Links container
    const linkGroup = g.append('g').attr('class', 'links');

    const linkPaths = linkGroup
      .selectAll('path')
      .data(linksList)
      .join('path')
      .attr('d', (d: any) => {
        const sourceX = d.source.depth === 0 ? centerX : d.source.px;
        const sourceY = d.source.depth === 0 ? centerY : d.source.py;
        const targetX = d.target.px;
        const targetY = d.target.py;
        // Smooth cubic bezier curve
        return `M ${sourceX} ${sourceY} C ${sourceX + (targetX - sourceX) * 0.5} ${sourceY}, ${sourceX + (targetX - sourceX) * 0.5} ${targetY}, ${targetX} ${targetY}`;
      })
      .attr('fill', 'none')
      .attr('stroke', (d: any) => {
        const gName = d.target.data.group;
        if (gName === 'insight') return '#8b5cf6';
        if (gName === 'action') return '#10b981';
        if (gName === 'decision') return '#f59e0b';
        if (gName === 'deadline') return '#f43f5e';
        return '#06b6d4';
      })
      .attr('stroke-width', (d: any) => (d.source.depth === 0 ? 3 : 2))
      .attr('stroke-opacity', 0.6);

    // Nodes container
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const nodeSelection = nodeGroup
      .selectAll('g')
      .data(nodesList)
      .join('g')
      .attr('transform', (d: any) => `translate(${d.depth === 0 ? centerX : d.px}, ${d.depth === 0 ? centerY : d.py})`)
      .style('cursor', 'pointer')
      .call(
        d3
          .drag()
          .on('start', (event, d: any) => {
            if (!event.active) {
              // drag start
            }
          })
          .on('drag', (event, d: any) => {
            d.px += event.dx;
            d.py += event.dy;
            d3.select(event.sourceEvent.target.ownerSVGElement ? event.sourceEvent.target.parentNode : this)
              .attr('transform', `translate(${d.px}, ${d.py})`);
            // update links
            linkPaths.attr('d', (l: any) => {
              const sX = l.source.depth === 0 ? centerX : l.source.px;
              const sY = l.source.depth === 0 ? centerY : l.source.py;
              const tX = l.target.px;
              const tY = l.target.py;
              return `M ${sX} ${sY} C ${sX + (tX - sX) * 0.5} ${sY}, ${sX + (tX - sX) * 0.5} ${tY}, ${tX} ${tY}`;
            });
          })
          .on('end', (event, d: any) => {}) as any
      )
      .on('click', (event, d: any) => {
        event.stopPropagation();
        setSelectedNode(d.data);
        highlightConnectedPath(d);
      })
      .on('dblclick', (event, d: any) => {
        event.stopPropagation();
        if (d.data.children && d.data.children.length > 0) {
          setCollapsedNodes((prev) => ({
            ...prev,
            [d.data.id]: !prev[d.data.id]
          }));
        }
      });

    // Node Background Card / Shape
    nodeSelection
      .append('rect')
      .attr('x', (d: any) => (d.depth === 0 ? -95 : -75))
      .attr('y', (d: any) => (d.depth === 0 ? -32 : -24))
      .attr('width', (d: any) => (d.depth === 0 ? 190 : 150))
      .attr('height', (d: any) => (d.depth === 0 ? 64 : 48))
      .attr('rx', 14)
      .attr('ry', 14)
      .attr('fill', (d: any) => {
        const gName = d.data.group;
        if (d.depth === 0) return '#1e1b4b'; // deep indigo
        if (gName === 'insight') return '#2e1065'; // deep violet
        if (gName === 'action') return '#064e3b'; // deep emerald
        if (gName === 'decision') return '#451a03'; // deep amber
        if (gName === 'deadline') return '#4c0519'; // deep rose
        return '#083344'; // deep cyan
      })
      .attr('stroke', (d: any) => {
        const gName = d.data.group;
        if (d.depth === 0) return '#818cf8';
        if (gName === 'insight') return '#a78bfa';
        if (gName === 'action') return '#34d399';
        if (gName === 'decision') return '#fbbf24';
        if (gName === 'deadline') return '#fb7185';
        return '#22d3ee';
      })
      .attr('stroke-width', (d: any) => (d.depth === 0 ? 2.5 : 1.5))
      .style('filter', 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))');

    // Node Type Icon Badge
    const badgeGroup = nodeSelection.append('g').attr('transform', (d: any) => (d.depth === 0 ? 'translate(-78, -16)' : 'translate(-62, -14)'));

    badgeGroup
      .append('circle')
      .attr('r', 12)
      .attr('fill', (d: any) => {
        const gName = d.data.group;
        if (d.depth === 0) return '#6366f1';
        if (gName === 'insight') return '#8b5cf6';
        if (gName === 'action') return '#10b981';
        if (gName === 'decision') return '#f59e0b';
        if (gName === 'deadline') return '#f43f5e';
        return '#06b6d4';
      });

    // Add icon symbol text
    badgeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#ffffff')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text((d: any) => {
        const gName = d.data.group;
        if (d.depth === 0) return '✦';
        if (gName === 'insight') return '💡';
        if (gName === 'action') return '✓';
        if (gName === 'decision') return '⚖';
        if (gName === 'deadline') return '⏳';
        return '📌';
      });

    // Node Label Text (Smart wrap or truncation)
    nodeSelection
      .append('text')
      .attr('x', (d: any) => (d.depth === 0 ? -48 : -36))
      .attr('y', (d: any) => (d.depth === 0 ? -4 : -2))
      .attr('fill', '#f8fafc')
      .attr('font-size', (d: any) => (d.depth === 0 ? '13px' : '11px'))
      .attr('font-weight', (d: any) => (d.depth === 0 ? '7px' : '600'))
      .text((d: any) => (d.data.name.length > 20 ? d.data.name.slice(0, 19) + '...' : d.data.name));

    nodeSelection
      .append('text')
      .attr('x', (d: any) => (d.depth === 0 ? -48 : -36))
      .attr('y', (d: any) => (d.depth === 0 ? 14 : 12))
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .text((d: any) => (d.data.timestamp ? `🕒 ${d.data.timestamp}` : d.data.group.toUpperCase()));

    // Search query highlight
    if (searchQuery.trim()) {
      nodeSelection
        .select('rect')
        .attr('stroke', (d: any) => (d.data.name.toLowerCase().includes(searchQuery.toLowerCase()) ? '#38bdf8' : 'currentColor'))
        .attr('stroke-width', (d: any) => (d.data.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 3 : 1.5));
    }

    // Auto-fit initial view
    const initialTransform = d3.zoomIdentity.translate(0, 0).scale(1);
    svg.transition().duration(750).call(zoom.transform, initialTransform);

    function highlightConnectedPath(selected: any) {
      const connectedIds = new Set<string>();
      let curr = selected;
      while (curr) {
        connectedIds.add(curr.data.id);
        curr = curr.parent;
      }
      // also children
      const addChildren = (node: any) => {
        connectedIds.add(node.data.id);
        if (node.children) node.children.forEach(addChildren);
      };
      addChildren(selected);

      nodeSelection.style('opacity', (d: any) => (connectedIds.has(d.data.id) ? 1 : 0.25));
      linkPaths.style('opacity', (d: any) => (connectedIds.has(d.target.data.id) ? 1 : 0.15));
    }

    return () => {
      // cleanup
    };
  }, [note, searchQuery, collapsedNodes]);

  const handleZoomIn = () => {
    if (svgSelectionRef.current && zoomBehaviorRef.current) {
      svgSelectionRef.current.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.25);
    }
  };

  const handleZoomOut = () => {
    if (svgSelectionRef.current && zoomBehaviorRef.current) {
      svgSelectionRef.current.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.8);
    }
  };

  const handleResetZoom = () => {
    if (svgSelectionRef.current && zoomBehaviorRef.current) {
      svgSelectionRef.current.transition().duration(500).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleExport = (format: 'png' | 'svg' | 'pdf') => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    if (format === 'svg') {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(note.title || 'mindmap').replace(/\s+/g, '_')}_mindmap.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${note.title} - Mind-Map PDF Report</title>
            <style>
              @page { size: A4 landscape; margin: 15mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #1e293b; background: #ffffff; text-align: center; }
              h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
              p { font-size: 12px; color: #64748b; margin-bottom: 20px; }
              .svg-container { margin: 0 auto; max-width: 1000px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; background: #0f172a; }
              .footer { margin-top: 20px; font-size: 10px; color: #94a3b8; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>${note.title} — Visual AI Mind-Map Report</h1>
            <p>Generated by VoiceNotes AI • Category: ${note.category} • Date: ${new Date(note.createdAt).toLocaleDateString()}</p>
            <div class="svg-container">
              ${svgString}
            </div>
            <div class="footer">VoiceNotes AI Executive Intelligence Report</div>
            <script>
              window.onload = function() {
                setTimeout(() => { window.print(); }, 400);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      // PNG export via canvas
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      canvas.width = svgElement.clientWidth * 2;
      canvas.height = svgElement.clientHeight * 2;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = '#020617';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `${(note.title || 'mindmap').replace(/\s+/g, '_')}_mindmap.png`;
          a.click();
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[580px]'
      }`}
    >
      {/* Top Header & Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-4 py-2.5 rounded-xl shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">Interactive AI Mind-Map</h4>
            <p className="text-[10px] text-slate-400">Hierarchical visual representation</p>
          </div>
        </div>

        {/* Search & Toolbar Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search mind-map..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 lg:w-48 transition-all"
            />
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 space-x-0.5">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Fit to Viewport"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFullscreenToggle}
              title="Fullscreen"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative group">
            <button className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-all">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export</span>
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 hidden group-hover:block z-30">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-3 py-1.5 text-xs text-indigo-300 font-bold hover:bg-slate-800 hover:text-white flex items-center space-x-1"
              >
                <span>📄 Export PDF</span>
              </button>
              <button
                onClick={() => handleExport('png')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Export PNG
              </button>
              <button
                onClick={() => handleExport('svg')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Export SVG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg ref={svgRef} className="w-full flex-1 cursor-grab active:cursor-grabbing bg-slate-950" />

      {/* Compact Legend */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center space-x-3 bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-300 shadow-lg">
        <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span><span>Core</span></span>
        <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span><span>Insight</span></span>
        <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>Action</span></span>
        <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span>Decision</span></span>
        <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span>Deadline</span></span>
      </div>

      {/* Selected Node AI Info Panel */}
      {selectedNode && (
        <div className="absolute bottom-3 right-3 left-3 sm:left-auto sm:w-80 z-30 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/40 rounded-2xl p-4 shadow-2xl animate-fade-in space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">{selectedNode.group} Node</span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-1">{selectedNode.name}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.description}</p>
          </div>

          {selectedNode.timestamp && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Timestamp: {selectedNode.timestamp}</span>
              </span>
              {selectedNode.seconds !== undefined && onPlayTimestamp && (
                <button
                  onClick={() => onPlayTimestamp(selectedNode.seconds!)}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs flex items-center space-x-1 shadow transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play audio</span>
                </button>
              )}
            </div>
          )}

          {onAskAI && (
            <button
              onClick={() => onAskAI(`Tell me more about the mind-map point: "${selectedNode.name}"`)}
              className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-indigo-300 hover:text-indigo-200 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Ask AI about this point</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
