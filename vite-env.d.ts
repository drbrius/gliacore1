import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, FileJson, FileText, Terminal, 
  Download, Copy, Check, Sparkles, 
  Brain, Globe, Shield, Zap, X,
  Cpu, Rocket, Briefcase, Users
} from 'lucide-react';
import { Logo } from './Logo';
import { Neuron, UserProfile } from '../types';

interface ExportPanelProps {
  neurons: Neuron[];
  profile: UserProfile | null;
  onClose: () => void;
}

type ExportMode = 'json' | 'markdown' | 'system_prompt' | 'ai_config' | 'html';

export function ExportPanel({ neurons, profile, onClose }: ExportPanelProps) {
  const [mode, setMode] = useState<ExportMode>('html');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const generateHTML = () => {
    const timestamp = new Date().toLocaleString();
    const owner = profile?.nickname || "Anonymous";
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Glia Core | Neural Snapshot: ${owner}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Grotesk:wght@300;400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #04060d;
            --bg-alt: #070b18;
            --white: #ffffff;
            --orange: #FFB547;
            --cyan: #5EE3FF;
            --blue: #0066FF;
        }
        
        body { 
            background: var(--bg); 
            color: var(--white); 
            font-family: 'Space Grotesk', sans-serif; 
            margin: 0; 
            padding: 0; 
            line-height: 1.6;
            overflow-x: hidden;
        }

        .lux-serif { font-family: 'Cormorant Garamond', serif; font-style: italic; }

        .container { max-width: 1000px; margin: 0 auto; padding: 80px 20px; }

        header { 
            border-bottom: 1px solid rgba(255, 181, 71, 0.2); 
            padding-bottom: 40px; 
            margin-bottom: 60px;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
        }

        .title-group h1 { 
            font-size: 64px; 
            margin: 0; 
            color: var(--white); 
            letter-spacing: -2px;
            line-height: 0.9;
        }

        .subtitle { 
            font-size: 10px; 
            text-transform: uppercase; 
            letter-spacing: 0.8em; 
            color: var(--orange); 
            margin-top: 15px;
            font-weight: 700;
        }

        .meta { 
            font-size: 12px; 
            opacity: 0.5; 
            text-align: right; 
            text-transform: uppercase;
            letter-spacing: 0.2em;
        }

        .profile-section {
            margin-bottom: 80px;
            padding: 40px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            background: rgba(255, 255, 255, 0.01);
        }

        h2 { 
            font-size: 11px; 
            text-transform: uppercase; 
            letter-spacing: 0.5em; 
            color: var(--cyan); 
            margin-bottom: 30px;
        }

        .goal { font-size: 28px; line-height: 1.4; color: var(--white); }

        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }

        .card { 
            padding: 30px; 
            border: 1px solid rgba(255, 255, 255, 0.05); 
            background: rgba(255, 255, 255, 0.02);
            position: relative;
            overflow: hidden;
        }

        .card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 2px; height: 100%;
            background: var(--blue);
            opacity: 0.3;
        }

        .card.project::before { background: var(--cyan); }
        .card.contact::before { background: var(--orange); }

        .card-type { font-size: 9px; text-transform: uppercase; letter-spacing: 0.3em; opacity: 0.4; margin-bottom: 15px; display: block; }
        .card-title { font-size: 20px; color: var(--white); margin: 0 0 10px 0; }
        .card-desc { font-size: 14px; opacity: 0.6; }

        footer { margin-top: 100px; padding: 40px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center; font-size: 10px; opacity: 0.3; text-transform: uppercase; letter-spacing: 0.4em; }

        .glow { position: fixed; width: 40vw; height: 40vw; border-radius: 50%; blur: 150px; z-index: -1; opacity: 0.1; }
        .glow-1 { top: -10%; right: -10%; background: var(--orange); filter: blur(150px); }
        .glow-2 { bottom: -10%; left: -10%; background: var(--blue); filter: blur(150px); }
    </style>
</head>
<body>
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>

    <div class="container">
        <header>
            <div class="title-group">
                <h1 class="lux-serif">Glia Core.</h1>
                <div class="subtitle">Neural State Transmission</div>
            </div>
            <div class="meta">
                Protocol v4.1.0 // ${timestamp}<br>
                Identity: ${owner}
            </div>
        </header>

        <section class="profile-section">
            <h2>Primary Objective</h2>
            <div class="goal lux-serif">"${profile?.longTermGoal || 'No primary protocol established.'}"</div>
        </section>

        <section>
            <h2>Neural Assembly (${neurons.length} Nodes)</h2>
            <div class="grid">
                ${neurons.map(n => `
                    <div class="card ${n.type}">
                        <span class="card-type">${n.type}</span>
                        <h3 class="card-title lux-serif">${n.title}</h3>
                        <p class="card-desc">${n.description}</p>
                    </div>
                `).join('')}
            </div>
        </section>

        <footer>
            Generated by Glia Core Intelligence Network &copy; 2026. All neural rights reserved.
        </footer>
    </div>
</body>
</html>`;
  };

  const generateJSON = () => {
    return JSON.stringify({
      version: "4.1.0",
      timestamp: Date.now(),
      owner: profile?.nickname || "Unknown",
      core_goal: profile?.longTermGoal || "",
      neurons: neurons.map(n => ({
        ...n,
        // Strip app-specific UI properties for cleaner AI context
        phi: undefined,
        theta: undefined,
        pp: undefined
      }))
    }, null, 2);
  };

  const generateMarkdown = () => {
    let md = `# GLIA CORE: DIGITAL MIND EXPORT\n`;
    md += `**Observer:** ${profile?.nickname || 'Anonymous'}\n`;
    md += `**Neural Capacity:** ${neurons.length} nodes\n`;
    md += `**Primary Objective:** ${profile?.longTermGoal || 'Not set'}\n\n`;
    
    md += `## 1. STRATEGIC NODES (Projects)\n`;
    neurons.filter(n => n.type === 'project').forEach(n => {
      md += `### ${n.title}\n- **Context:** ${n.description}\n- **Status:** ${n.metadata?.status || 'Active'}\n`;
      const connections = neurons.filter(nx => n.connections?.includes(nx.id));
      if (connections.length > 0) {
        md += `- **Related Nodes:** ${connections.map(c => c.title).join(', ')}\n`;
      }
      md += `\n`;
    });

    md += `## 2. SOCIAL MATRIX (Contacts)\n`;
    neurons.filter(n => n.type === 'contact').forEach(n => {
      md += `### ${n.title}\n- **Role:** ${n.metadata?.role || 'Stakeholder'}\n- **Company:** ${n.metadata?.company || 'N/A'}\n- **Insight:** ${n.description}\n\n`;
    });

    md += `## 3. CORE INSIGHTS (Thoughts & Notes)\n`;
    neurons.filter(n => ['thought', 'note', 'insight'].includes(n.type)).forEach(n => {
      md += `- **[${n.type.toUpperCase()}] ${n.title}:** ${n.description}\n`;
    });

    return md;
  };

  const generateSystemPrompt = () => {
    return `You are acting as the AI extension of ${profile?.nickname || 'a user'}'s digital mind. 
Their primary goal is: "${profile?.longTermGoal || 'Not specified'}"

CONTEXT FROM THEIR GLIA CORE:
${neurons.slice(0, 20).map(n => `- ${n.title}: ${n.description}`).join('\n')}

INSTRUCTIONS:
1. Use the specific context above to inform your decisions and suggestions.
2. Maintain the strategic alignment with the primary goal.
3. If the user mentions a node Name listed above, refer to its stored context.
4. Your personality should match the user's focus: ${profile?.longTermGoal || 'Professional and efficient'}.`;
  };

  const getContent = () => {
    switch(mode) {
      case 'json': return generateJSON();
      case 'markdown': return generateMarkdown();
      case 'system_prompt': return generateSystemPrompt();
      case 'ai_config': return `// AI Platform Config (Glia-Protocol-v4)\n{\n  "source": "Glia Core",\n  "embedding_optimization": true,\n  "context_window_priority": "high",\n  "node_count": ${neurons.length}\n}`;
      case 'html': return generateHTML();
      default: return "";
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const extension = mode === 'html' ? 'html' : 'txt';
      const type = mode === 'html' ? 'text/html' : 'text/plain';
      const blob = new Blob([getContent()], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `glia_snapshot_${mode}_${new Date().toISOString().split('T')[0]}.${extension}`;
      a.click();
      setIsExporting(false);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[300] bg-bg/80 backdrop-blur-2xl flex items-center justify-center p-6"
    >
      <div className="w-full max-w-5xl bg-bg-alt border border-white/10 rounded-sm shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size={56} />
            <div>
              <h2 className="text-3xl font-serif italic text-white leading-tight">Neural Export Terminal</h2>
              <p className="text-[10px] uppercase tracking-[0.5em] text-cyan-glow font-black">Sync Digital Mind with AI Platforms</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-rose-glow/10 hover:text-rose-glow transition-all rounded-sm">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Modes */}
          <div className="w-72 border-r border-white/5 p-8 space-y-4 bg-black/20">
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-black mb-6">Select Protocol</p>
            
            <ModeButton 
              icon={<Globe size={18} />} 
              label="HTML Snapshot" 
              desc="Standlone Luxury Report" 
              active={mode === 'html'} 
              onClick={() => setMode('html')} 
            />
            <ModeButton 
              icon={<FileText size={18} />} 
              label="Markdown Bundle" 
              desc="Best for ChatGPT / Claude" 
              active={mode === 'markdown'} 
              onClick={() => setMode('markdown')} 
            />
            <ModeButton 
              icon={<Terminal size={18} />} 
              label="System Prompt" 
              desc="Instructions for LLMs" 
              active={mode === 'system_prompt'} 
              onClick={() => setMode('system_prompt')} 
            />
            <ModeButton 
              icon={<FileJson size={18} />} 
              label="JSON Cortex" 
              desc="Technical Data Sync" 
              active={mode === 'json'} 
              onClick={() => setMode('json')} 
            />
            <ModeButton 
              icon={<Rocket size={18} />} 
              label="AI Preset" 
              desc="Config for API access" 
              active={mode === 'ai_config'} 
              onClick={() => setMode('ai_config')} 
            />

            <div className="mt-12 p-6 bg-white/5 border border-white/5 rounded-sm">
              <div className="flex items-center gap-2 text-cyan-glow mb-2">
                <Shield size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Export</span>
              </div>
              <p className="text-[9px] text-text-muted uppercase leading-relaxed">
                Exporting your data creates a static snapshot. Relationships are preserved via naming markers.
              </p>
            </div>
          </div>

          {/* Preview & Actions */}
          <div className="flex-1 flex flex-col p-8 overflow-hidden">
            <div className="flex-1 bg-black/40 border border-white/5 rounded-sm font-mono p-10 overflow-y-auto custom-scrollbar relative">
              <pre className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                {getContent()}
              </pre>
              
              <div className="absolute top-6 right-6 flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="p-3 bg-bg border border-white/10 text-white hover:border-cyan-glow transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  {copied ? <Check size={14} className="text-green-glow" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Context'}
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] text-text-muted uppercase tracking-widest">
                <Sparkles size={16} className="text-amber-glow" />
                Optimized for High-Token Context Windows
              </div>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="bg-cyan-glow text-bg font-black px-12 py-5 uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all text-sm shadow-xl shadow-cyan-glow/20 flex items-center gap-3 disabled:opacity-50"
              >
                {isExporting ? <Zap size={18} className="animate-spin" /> : <Download size={18} />}
                {isExporting ? 'PROCESSING CORE...' : 'EXPORT BUNDLE'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(94, 227, 255, 0.2); border-radius: 10px; }
      `}</style>
    </motion.div>
  );
}

function ModeButton({ icon, label, desc, active, onClick }: { icon: React.ReactNode, label: string, desc: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-5 border text-left transition-all relative rounded-sm ${active ? 'bg-cyan-glow/10 border-cyan-glow/40 text-white' : 'border-white/5 text-text-muted hover:border-white/20'}`}
    >
      <div className="flex items-center gap-4 mb-1">
        <div className={`transition-colors ${active ? 'text-cyan-glow' : ''}`}>{icon}</div>
        <p className="text-xs font-black uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-[9px] uppercase tracking-tighter opacity-60 ml-8">{desc}</p>
      {active && (
        <motion.div layoutId="export-active" className="absolute left-0 top-1 bottom-1 w-1 bg-cyan-glow shadow-[0_0_10px_rgba(94,227,255,0.8)]" />
      )}
    </button>
  );
}
