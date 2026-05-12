import React, { useEffect, useRef, useMemo } from 'react';
import { Neuron, NeuronType } from '../types';

const TYPES: Record<NeuronType, { color: string; label: string }> = {
  thought: { color: '#5ee3ff', label: 'Thought' },
  idea: { color: '#b388ff', label: 'Idea' },
  project: { color: '#ffb547', label: 'Project' },
  contact: { color: '#ff7a9c', label: 'Contact' },
  meeting: { color: '#6eeb9b', label: 'Meeting' },
  place: { color: '#7fcfff', label: 'Place' },
  task: { color: '#ffd24d', label: 'Task' },
  event: { color: '#ff9d6e', label: 'Event' },
  note: { color: '#a8c0d8', label: 'Note' },
  insight: { color: '#d4c2ff', label: 'Insight' },
};

interface BrainCanvasProps {
  neurons: Neuron[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  searchQuery: string;
}

export const BrainCanvas: React.FC<BrainCanvasProps> = ({
  neurons,
  selectedId,
  onSelect,
  searchQuery
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const viewRef = useRef({ 
    scale: 1, 
    rotX: -0.15, 
    rotY: 0, 
    tx: 0, 
    ty: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0
  });
  const hoverIdRef = useRef<string | null>(null);

  const brainR = () => Math.min(window.innerWidth, window.innerHeight) * 0.38;

  const hex2rgba = (hex: string, a: number) => {
    const h = hex.replace('#', '');
    return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
  };

  const project = (n: Neuron, view: typeof viewRef.current) => {
    const R_base = brainR();
    const R = R_base * (n.r3 || 0.9);
    const phi = (n.phi || 0) + view.rotY;
    const theta = (n.theta || 0) + view.rotX;
    
    const x3 = Math.cos(theta) * Math.sin(phi) * R;
    const y3 = Math.sin(theta) * R;
    const z3 = Math.cos(theta) * Math.cos(phi) * R;
    
    const fov = 850;
    const sc = (fov / Math.max(10, fov + z3)) * view.scale;
    const cx = window.innerWidth / 2 + view.tx;
    const cy = window.innerHeight / 2 + view.ty;
    
    return { sx: cx + x3 * sc, sy: cy + y3 * sc, depth: z3, sc: Math.max(0, sc), R };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const render = (ts: number) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const DPR = window.devicePixelRatio || 1;
      
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      
      timeRef.current = ts / 1000;
      const t = timeRef.current;
      const view = viewRef.current;

      // Auto-rotation when not dragging
      if (!view.isDragging) {
        view.rotY += 0.001;
      }
      
      ctx.clearRect(0, 0, W, H);
      
      const cx = W / 2 + view.tx;
      const cy = H / 2 + view.ty;
      const R_scaled = brainR() * view.scale;

      // 0. Starfield Background (Parallax)
      ctx.save();
      for (let i = 0; i < 150; i++) {
        const seed = i * 1.5;
        const x = ((Math.sin(seed) * 5000 + (view.rotY * 200)) % W + W) % W;
        const y = ((Math.cos(seed) * 5000 + (view.rotX * 200)) % H + H) % H;
        const s = (Math.sin(t + seed) * 0.5 + 0.5) * 1.2;
        ctx.fillStyle = i % 10 === 0 ? '#5ee3ff' : '#fff';
        ctx.globalAlpha = 0.2 + s * 0.3;
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalAlpha = 1.0;

      // 1. Core Atmosphere
      const radiusAtm = Math.max(0.1, R_scaled * 2.2);
      const atm = ctx.createRadialGradient(cx, cy, 0, cx, cy, radiusAtm);
      atm.addColorStop(0, 'rgba(10, 40, 80, 0.12)');
      atm.addColorStop(0.6, 'rgba(5, 15, 30, 0.04)');
      atm.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = atm;
      ctx.beginPath();
      ctx.arc(cx, cy, radiusAtm, 0, Math.PI * 2);
      ctx.fill();

      // 2. Orbital rings
      for (let ri = 0; ri < 3; ri++) {
        const ang = t * 0.15 + ri * (Math.PI * 2 / 3);
        const rx = R_scaled * (1.3 + ri * 0.1);
        const ry = R_scaled * (0.35 + ri * 0.05);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ang * 0.2);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0.2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(94, 227, 255, ${0.03 + ri * 0.02})`;
        ctx.setLineDash([20, 15]);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Grid / Matrix
      ctx.lineWidth = 0.2;
      ctx.strokeStyle = 'rgba(94, 227, 255, 0.02)';
      const step = R_scaled * 0.2;
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * step, 0);
        ctx.lineTo(cx + i * step, H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, cy + i * step);
        ctx.lineTo(W, cy + i * step);
        ctx.stroke();
      }

      // Draw connections
      neurons.forEach(a => {
        if (!a.connections) return;
        const pa = project(a, view);
        a.connections.forEach(cid => {
          const b = neurons.find(n => n.id === cid);
          if (!b) return;
          const pb = project(b, view);
          
          const isSelected = selectedId && (selectedId === a.id || selectedId === b.id);
          const isBothSelected = selectedId && (selectedId === a.id || selectedId === b.id) && (selectedId !== a.id || selectedId !== b.id); // Placeholder for future logic
          const queryMatch = searchQuery && (a.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.title.toLowerCase().includes(searchQuery.toLowerCase()));
          
          const distBase = Math.abs(pa.depth + pb.depth) / 2;
          const opacityBase = Math.max(0, (distBase / brainR() + 1.2) / 2.2);
          
          // Enhanced opacity and visibility
          const opacity = opacityBase * (isSelected || queryMatch ? 1.0 : 0.25);
          
          if (opacity < 0.01) return;

          if (isSelected) {
            ctx.shadowColor = '#5ee3ff';
            ctx.shadowBlur = 10;
          }

          ctx.strokeStyle = isSelected ? `rgba(94, 227, 255, ${opacity})` : `rgba(94, 227, 255, ${opacity * 0.8})`;
          ctx.lineWidth = isSelected ? 2.5 : 0.8;
          ctx.beginPath();
          ctx.moveTo(pa.sx, pa.sy);
          ctx.lineTo(pb.sx, pb.sy);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Traveling pulse on lines - much more intense
          if (isSelected || Math.random() < 0.02) {
            const pulseTime = (t * 0.8 + a.created) % 1;
            const px = pa.sx + (pb.sx - pa.sx) * pulseTime;
            const py = pa.sy + (pb.sy - pa.sy) * pulseTime;
            ctx.fillStyle = isSelected ? '#fff' : `rgba(180, 240, 255, ${opacity * 2.5})`;
            ctx.beginPath();
            ctx.arc(px, py, isSelected ? 4 : 2, 0, Math.PI * 2);
            ctx.fill();
            if (isSelected) {
              ctx.shadowColor = '#fff';
              ctx.shadowBlur = 15;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        });
      });

      // Draw neurons
      const sorted = neurons
        .map(n => ({ n, p: project(n, view) }))
        .sort((a, b) => a.p.depth - b.p.depth);

      sorted.forEach(({ n, p }) => {
        const type = TYPES[n.type] || TYPES.thought;
        const breath = 1 + Math.sin(t * 2 + (n.pp || 0)) * 0.08;
        const df = Math.max(0.1, (p.depth / brainR() + 1.2) / 2.2);
        
        const isMatch = searchQuery && n.title.toLowerCase().includes(searchQuery.toLowerCase());
        const isSelected = selectedId === n.id;
        const isHovered = hoverIdRef.current === n.id;
        
        let r = n.size * breath * p.sc * 0.45 * (0.4 + df * 0.6);
        if (isSelected || isHovered || isMatch) r *= 1.3;

        const opacity = isMatch || isSelected || isHovered ? 1 : Math.max(0.2, df);

        // Selection rings
        if (isSelected) {
          ctx.strokeStyle = hex2rgba(type.color, 0.4);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r * 2.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r * 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Glow
        const gm = isSelected ? 6 : (isHovered || isMatch) ? 4.5 : 2.5;
        const radInner = Math.max(0.01, r * 0.1);
        const radOuter = Math.max(0.02, r * gm);
        const grd = ctx.createRadialGradient(p.sx, p.sy, radInner, p.sx, p.sy, radOuter);
        grd.addColorStop(0, hex2rgba(type.color, (isSelected ? 0.8 : (isHovered || isMatch) ? 0.6 : 0.4) * df));
        grd.addColorStop(1, hex2rgba(type.color, 0));
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radOuter, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = hex2rgba(type.color, opacity);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fill();

        // Label
        if (isSelected || isHovered || isMatch || (view.scale > 1.8 && df > 0.6)) {
          const fontSize = Math.max(9, Math.round(11 * df * (isSelected ? 1.4 : 1)));
          ctx.font = `${isSelected ? 'bold' : 'normal'} ${fontSize}px "JetBrains Mono"`;
          ctx.fillStyle = isSelected ? 'white' : `rgba(234, 246, 255, ${opacity})`;
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText(n.title.toUpperCase(), p.sx, p.sy - r - 10);
          ctx.shadowBlur = 0;
        }
      });

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [neurons, selectedId, searchQuery]);

  const handleMouseDown = (e: React.MouseEvent) => {
    viewRef.current.isDragging = true;
    viewRef.current.lastX = e.clientX;
    viewRef.current.lastY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const view = viewRef.current;
    const mx = e.clientX;
    const my = e.clientY;
    
    if (view.isDragging) {
      const dx = mx - view.lastX;
      const dy = my - view.lastY;
      view.rotY += dx * 0.005;
      view.rotX -= dy * 0.005;
      view.lastX = mx;
      view.lastY = my;
    } else {
      // Hover detection
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = mx - rect.left;
      const cy = my - rect.top;
      
      let foundId = null;
      for (const n of neurons) {
        const p = project(n, view);
        const dist = Math.sqrt((cx-p.sx)**2 + (cy-p.sy)**2);
        if (dist < 15 * p.sc) {
          foundId = n.id;
          break;
        }
      }
      hoverIdRef.current = foundId;
    }
  };

  const handleMouseUp = () => {
    viewRef.current.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    viewRef.current.scale = Math.max(0.3, Math.min(5, viewRef.current.scale * delta));
  };

  return (
    <div className="fixed inset-0 z-0" onWheel={handleWheel}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full touch-none cursor-grab active:cursor-grabbing"
        onClick={(e) => {
          const view = viewRef.current;
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          
          let foundId = null;
          for (const n of neurons) {
            const p = project(n, view);
            const dist = Math.sqrt((mx-p.sx)**2 + (my-p.sy)**2);
            if (dist < 20 * p.sc) {
              foundId = n.id;
              break;
            }
          }
          onSelect(foundId);
        }}
      />
    </div>
  );
};
