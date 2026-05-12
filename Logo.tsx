import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Briefcase, Search, Filter, 
  MoreHorizontal, Edit3, Trash2, 
  ExternalLink, Mail, Phone, Plus,
  Tag, MapPin, Grid, List as ListIcon,
  X
} from 'lucide-react';
import { Logo } from './Logo';
import { Neuron, NeuronType } from '../types';

interface DirectoryProps {
  neurons: Neuron[];
  onEdit: (neuron: Neuron) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function Directory({ neurons, onEdit, onDelete, onClose }: DirectoryProps) {
  const [filterType, setFilterType] = useState<NeuronType | 'all' | 'journey'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const sortedNeurons = [...neurons].sort((a, b) => b.created - a.created);

  const filtered = sortedNeurons.filter(n => {
    const matchesType = filterType === 'all' || filterType === 'journey' || n.type === filterType;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const contacts = neurons.filter(n => n.type === 'contact');
  const projects = neurons.filter(n => n.type === 'project');

  return (
    <motion.div 
      initial={{ opacity: 0, x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 20, y: typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 20, y: typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 0 }}
      className="fixed inset-y-0 right-0 w-full md:max-w-4xl bg-bg-alt/95 border-l border-white/10 backdrop-blur-3xl shadow-2xl z-[150] flex flex-col"
    >
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-4">
          <Logo size={40} mdSize={48} />
          <div>
            <h2 className="text-xl md:text-2xl font-serif italic text-white">Neural Directory</h2>
            <p className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-cyan-glow font-black">Registry of Organized Nodes</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 md:p-3 hover:bg-rose-glow/10 hover:text-rose-glow transition-all">
          <X size={24} md:size={28} />
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 md:px-8 py-4 md:py-6 border-b border-white/5 flex flex-col gap-4 md:gap-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <FilterButton active={filterType === 'all'} onClick={() => setFilterType('all')} label="All" count={neurons.length} />
          <FilterButton active={filterType === 'contact'} onClick={() => setFilterType('contact')} label="Contacts" count={contacts.length} />
          <FilterButton active={filterType === 'project'} onClick={() => setFilterType('project')} label="Projects" count={projects.length} />
          <FilterButton active={filterType === 'journey'} onClick={() => setFilterType('journey')} label="Evolution" count={neurons.length} />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search directory..."
              className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-2.5 md:py-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-white outline-none focus:border-cyan-glow/50 transition-all font-sans"
            />
          </div>
          <div className="flex border border-white/10 rounded-sm overflow-hidden shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 md:p-3 ${viewMode === 'grid' ? 'bg-cyan-glow text-bg' : 'text-text-muted hover:text-white'}`}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 md:p-3 ${viewMode === 'list' ? 'bg-cyan-glow text-bg' : 'text-text-muted hover:text-white'}`}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 space-y-4">
            <Search size={64} />
            <p className="text-xl font-serif italic">No signals found in this sector.</p>
          </div>
        ) : filterType === 'journey' ? (
          <div className="relative pl-8 border-l border-white/5 space-y-12">
            {filtered.map((node, i) => (
              <div key={node.id} className="relative">
                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-cyan-glow shadow-[0_0_10px_rgba(94,227,255,0.5)] border-4 border-bg" />
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-[10px] font-mono text-cyan-glow/60">{new Date(node.created).toLocaleDateString()}</span>
                  <span className="text-[8px] uppercase tracking-widest px-1.5 py-0.5 bg-white/5 border border-white/10 text-white opacity-40">{node.type}</span>
                </div>
                <DirectoryListItem node={node} onEdit={() => onEdit(node)} onDelete={() => onDelete(node.id)} />
              </div>
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(node => (
              <DirectoryCard key={node.id} node={node} onEdit={() => onEdit(node)} onDelete={() => onDelete(node.id)} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(node => (
              <DirectoryListItem key={node.id} node={node} onEdit={() => onEdit(node)} onDelete={() => onDelete(node.id)} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(94, 227, 255, 0.2); border-radius: 10px; }
      `}</style>
    </motion.div>
  );
}

function FilterButton({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count: number, key?: any }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-3 ${active ? 'bg-cyan-glow text-bg border-cyan-glow shadow-[0_0_15px_rgba(94,227,255,0.3)]' : 'border-white/10 text-text-muted hover:border-white/30 hover:text-white'}`}
    >
      {label}
      <span className={`px-1.5 py-0.5 rounded-sm ${active ? 'bg-black/20' : 'bg-white/5'}`}>{count}</span>
    </button>
  );
}

function DirectoryCard({ node, onEdit, onDelete }: { node: Neuron, onEdit: () => void, onDelete: () => void, key?: any }) {
  return (
    <motion.div 
      layout
      className="bg-white/5 border border-white/10 p-6 group hover:border-cyan-glow/40 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 flex items-center justify-center border border-cyan-glow/30 text-cyan-glow bg-cyan-glow/5">
                {node.type === 'contact' ? <Users size={14} /> : node.type === 'project' ? <Briefcase size={14} /> : <Tag size={14} />}
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-cyan-glow/60">{node.type}</span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={onEdit} className="p-2 hover:bg-white/10 text-white"><Edit3 size={14} /></button>
            <button onClick={onDelete} className="p-2 hover:bg-rose-glow/10 text-rose-glow"><Trash2 size={14} /></button>
          </div>
        </div>
        <h3 className="text-lg font-serif italic text-white mb-2 truncate">{node.title}</h3>
        <p className="text-[11px] text-text-secondary italic font-serif leading-relaxed line-clamp-2 opacity-70 mb-4 h-8">
          {node.description}
        </p>

        {node.type === 'contact' && (
          <div className="space-y-2 mb-4">
            {node.metadata?.email && <div className="flex items-center gap-2 text-[10px] text-text-muted uppercase"><Mail size={12} /> {node.metadata.email}</div>}
            {node.metadata?.phone && <div className="flex items-center gap-2 text-[10px] text-text-muted uppercase"><Phone size={12} /> {node.metadata.phone}</div>}
          </div>
        )}

        {node.type === 'project' && (
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border border-cyan-glow/30 text-cyan-glow`}>
              {node.metadata?.status || 'Active'}
            </div>
            <div className="flex items-center gap-1 text-[8px] text-text-muted uppercase font-black tracking-widest">
              <Plus size={10} /> {node.connections?.length || 0} BRIDGES
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex -space-x-2">
           {node.connections?.slice(0, 3).map((c, i) => (
             <div key={i} className="w-6 h-6 rounded-full bg-white/10 border border-bg flex items-center justify-center text-[8px] font-black uppercase text-text-muted">
               {i + 1}
             </div>
           ))}
           {node.connections?.length > 3 && (
             <div className="w-6 h-6 rounded-full bg-white/5 border border-bg flex items-center justify-center text-[8px] font-black text-text-muted">
               +{node.connections.length - 3}
             </div>
           )}
        </div>
        <button onClick={onEdit} className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-glow hover:underline">
          Access Metadata
        </button>
      </div>
    </motion.div>
  );
}

function DirectoryListItem({ node, onEdit, onDelete }: { node: Neuron, onEdit: () => void, onDelete: () => void, key?: any }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
      <div className="w-10 h-10 flex items-center justify-center border border-white/10 text-text-muted group-hover:border-cyan-glow group-hover:text-cyan-glow transition-all">
        {node.type === 'contact' ? <Users size={16} /> : node.type === 'project' ? <Briefcase size={16} /> : <Tag size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-black uppercase tracking-widest text-white truncate">{node.title}</h4>
          <span className="text-[8px] uppercase tracking-widest text-text-muted bg-white/5 px-1.5 py-0.5">{node.type}</span>
        </div>
        <p className="text-[10px] text-text-muted truncate opacity-60 uppercase">{node.description}</p>
      </div>
      <div className="hidden md:flex items-center gap-6">
        {node.type === 'contact' && node.metadata?.email && (
          <span className="text-[9px] text-text-muted font-mono">{node.metadata.email}</span>
        )}
        <div className="text-[9px] uppercase tracking-widest text-text-muted">
          {new Date(node.updated).toLocaleDateString()}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="p-2 hover:bg-cyan-glow/10 hover:text-cyan-glow transition-all text-text-muted"><Edit3 size={16} /></button>
        <button onClick={onDelete} className="p-2 hover:bg-rose-glow/10 hover:text-rose-glow transition-all text-text-muted"><Trash2 size={16} /></button>
      </div>
    </div>
  );
}
