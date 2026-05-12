import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Save, Link2, Plus, Search, 
  User, Briefcase, Mail, Phone, 
  MapPin, Calendar, Tag, Shield, 
  ExternalLink, Trash2, CheckCircle2,
  Globe, Zap, Terminal
} from 'lucide-react';
import { Neuron, NeuronType } from '../types';

interface NeuronFormProps {
  type: NeuronType;
  initialData?: Partial<Neuron>;
  allNeurons: Neuron[];
  onSave: (type: NeuronType, data: Partial<Neuron>) => void;
  onCancel: () => void;
}

export function NeuronForm({ type, initialData, allNeurons, onSave, onCancel }: NeuronFormProps) {
  const [formData, setFormData] = useState<Partial<Neuron>>({
    id: initialData?.id,
    type: type,
    title: initialData?.title || '',
    description: initialData?.description || '',
    tags: initialData?.tags || [type],
    importance: initialData?.importance || 5,
    connections: initialData?.connections || [],
    metadata: initialData?.metadata || {},
    ...initialData
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'connections' | 'details'>('info');
  const [connectionFilter, setConnectionFilter] = useState<NeuronType | 'all'>('all');

  const filteredNeurons = allNeurons.filter(n => 
    n.id !== formData.id && 
    (connectionFilter === 'all' || n.type === connectionFilter) &&
    (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     n.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleConnection = (id: string) => {
    setFormData(prev => {
      const current = prev.connections || [];
      const updated = current.includes(id) 
        ? current.filter(c => c !== id) 
        : [...current, id];
      return { ...prev, connections: updated };
    });
  };

  const updateMetadata = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value }
    }));
  };

  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tag.toLowerCase()]
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="w-full max-w-2xl bg-bg-alt/95 border border-white/10 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden rounded-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-glow/20 border border-cyan-glow/40 flex items-center justify-center rounded-sm">
            <span className="text-xl font-bold text-cyan-glow">{type[0].toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-xl font-serif italic text-white">
              {formData.id ? 'Modify' : 'Initialize'} Neural {type}
            </h2>
            <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted font-black">Memory Sector {Math.floor(Math.random() * 9999)}</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-rose-glow/10 hover:text-rose-glow transition-all">
          <X size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-8 border-b border-white/5">
        <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="Core Info" />
        <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')} label="Detailed Specs" />
        <TabButton active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} label="Neural Bridges" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar max-h-[60vh]">
        {activeTab === 'info' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.4em] text-cyan-glow font-black block">Identification</label>
              <input 
                autoFocus
                type="text"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder={`Name this ${type}...`}
                className="w-full bg-white/5 border border-white/10 p-5 text-2xl font-serif italic text-white outline-none focus:border-cyan-glow/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-black block">Neural Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Expand on the context of this node..."
                className="w-full bg-white/5 border border-white/10 p-5 h-32 text-base font-serif italic text-text-primary outline-none focus:border-cyan-glow/30 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-black block">Visual Weight</label>
                <input 
                  type="range"
                  min="5"
                  max="20"
                  value={formData.size || 10}
                  onChange={e => setFormData(p => ({ ...p, size: parseInt(e.target.value) }))}
                  className="w-full accent-cyan-glow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-black block">Priority Index</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(i => (
                    <button 
                      key={i}
                      onClick={() => setFormData(p => ({ ...p, importance: i }))}
                      className={`w-8 h-8 border text-[10px] flex items-center justify-center transition-all ${formData.importance === i ? 'bg-cyan-glow text-bg border-cyan-glow' : 'border-white/10 text-text-muted hover:border-white/30'}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-8">
            {type === 'contact' && (
              <div className="space-y-6">
                <InputGroup label="Identity Context">
                  <DetailInput icon={<Briefcase size={16} />} placeholder="Role / Title" value={formData.metadata?.role || ''} onChange={v => updateMetadata('role', v)} />
                  <DetailInput icon={<Shield size={16} />} placeholder="Company / Group" value={formData.metadata?.company || ''} onChange={v => updateMetadata('company', v)} />
                </InputGroup>
                <InputGroup label="Contact Origin">
                  <DetailInput icon={<Link2 size={16} />} placeholder="Introduced By (Name/ID)" value={formData.metadata?.introducedBy || ''} onChange={v => updateMetadata('introducedBy', v)} />
                  <DetailInput icon={<Globe size={16} />} placeholder="Nationality / Location" value={formData.metadata?.nationality || ''} onChange={v => updateMetadata('nationality', v)} />
                </InputGroup>
                <InputGroup label="Communication Nodes">
                  <DetailInput icon={<Mail size={16} />} placeholder="Email Address" value={formData.metadata?.email || ''} onChange={v => updateMetadata('email', v)} />
                  <DetailInput icon={<Phone size={16} />} placeholder="Direct Line" value={formData.metadata?.phone || ''} onChange={v => updateMetadata('phone', v)} />
                </InputGroup>
                <InputGroup label="Personal Frequency">
                  <DetailInput icon={<Calendar size={16} />} placeholder="Birthday / Key Anniversary" value={formData.metadata?.birthday || ''} onChange={v => updateMetadata('birthday', v)} />
                  <DetailInput icon={<Zap size={16} />} placeholder="Personality Traits" value={formData.metadata?.traits || ''} onChange={v => updateMetadata('traits', v)} />
                </InputGroup>
              </div>
            )}

            {type === 'project' && (
              <div className="space-y-6">
                <InputGroup label="Mission Timeline">
                  <DetailInput icon={<Calendar size={16} />} placeholder="Deadline / Target" value={formData.metadata?.deadline || ''} onChange={v => updateMetadata('deadline', v)} />
                  <DetailInput icon={<Tag size={16} />} placeholder="Status (Live, Concept, Frozen)" value={formData.metadata?.status || ''} onChange={v => updateMetadata('status', v)} />
                </InputGroup>
                <InputGroup label="Strategic Specs">
                  <DetailInput icon={<Zap size={16} />} placeholder="Core Objectives / Key Results" value={formData.metadata?.okrs || ''} onChange={v => updateMetadata('okrs', v)} />
                  <DetailInput icon={<Terminal size={16} />} placeholder="Technical Stack / Protocol" value={formData.metadata?.stack || ''} onChange={v => updateMetadata('stack', v)} />
                </InputGroup>
                <InputGroup label="Resource Matrix">
                  <DetailInput icon={<Shield size={16} />} placeholder="Budget / Resources" value={formData.metadata?.budget || ''} onChange={v => updateMetadata('budget', v)} />
                  <DetailInput icon={<MapPin size={16} />} placeholder="Primary Sector / Domain" value={formData.metadata?.sector || ''} onChange={v => updateMetadata('sector', v)} />
                </InputGroup>
              </div>
            )}

            {(type !== 'contact' && type !== 'project') && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
                <Tag size={40} className="text-text-muted" />
                <p className="text-sm font-serif italic text-text-secondary">No advanced specs for this node type.</p>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-black block">Semantic Tags</label>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map(t => (
                  <span key={t} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 text-[10px] uppercase tracking-widest text-text-primary">
                    {t}
                    <button onClick={() => setFormData(p => ({ ...p, tags: p.tags?.filter(tag => tag !== t) }))} className="hover:text-rose-glow"><X size={12} /></button>
                  </span>
                ))}
                <input 
                  type="text"
                  placeholder="+ Tag"
                  className="bg-transparent border-none text-[10px] uppercase tracking-widest text-cyan-glow focus:outline-none w-20"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      addTag((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter neural nodes..."
                className="w-full bg-white/5 border border-white/10 px-12 py-4 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-cyan-glow/50 transition-all placeholder:text-text-dark"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-black block">
                  Bridge Targets
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setConnectionFilter('all')}
                    className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest border transition-all ${connectionFilter === 'all' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-text-muted hover:text-white'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setConnectionFilter('contact')}
                    className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest border transition-all ${connectionFilter === 'contact' ? 'bg-cyan-glow/20 border-cyan-glow/40 text-cyan-glow' : 'border-white/5 text-text-muted hover:text-cyan-glow'}`}
                  >
                    Contacts
                  </button>
                  <button 
                    onClick={() => setConnectionFilter('project')}
                    className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest border transition-all ${connectionFilter === 'project' ? 'bg-violet-glow/20 border-violet-glow/40 text-violet-glow' : 'border-white/5 text-text-muted hover:text-violet-glow'}`}
                  >
                    Projects
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {filteredNeurons.map(n => {
                  const isConnected = formData.connections?.includes(n.id);
                  return (
                    <div 
                      key={n.id}
                      className={`flex flex-col border transition-all ${isConnected ? 'bg-cyan-glow/5 border-cyan-glow/40' : 'bg-white/5 border-white/5 opacity-60'}`}
                    >
                      <div className="flex items-center gap-3 p-3">
                        <div className={`w-8 h-8 flex items-center justify-center border ${isConnected ? 'border-cyan-glow bg-cyan-glow/20' : 'border-white/10 bg-white/5'}`}>
                          {n.type === 'contact' && <User size={12} />}
                          {n.type === 'project' && <Briefcase size={12} />}
                          {n.type === 'thought' && <Plus size={12} />}
                          {n.type === 'place' && <MapPin size={12} />}
                          {!['contact', 'project', 'thought', 'place'].includes(n.type) && <Tag size={12} />}
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-[11px] font-black uppercase tracking-widest truncate">{n.title}</p>
                          <p className="text-[9px] opacity-60 uppercase">{n.type}</p>
                        </div>
                        <button 
                          onClick={() => toggleConnection(n.id)}
                          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${isConnected ? 'bg-cyan-glow text-bg' : 'text-text-muted hover:text-white'}`}
                        >
                          {isConnected ? 'Active' : 'Bridge'}
                        </button>
                      </div>
                      
                      {isConnected && (
                        <div className="px-3 pb-3 pt-0 flex gap-2">
                           <input 
                            type="text"
                            placeholder="Describe Relationship (e.g. Mentor, Introduced By, Partner)"
                            value={formData.metadata?.[`rel_${n.id}`] || ''}
                            onChange={(e) => updateMetadata(`rel_${n.id}`, e.target.value)}
                            className="flex-1 bg-black/40 border border-white/5 px-3 py-2 text-[9px] uppercase tracking-widest text-text-primary focus:outline-none focus:border-cyan-glow/30"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-6 bg-white/5 border-t border-white/5 flex items-center justify-between">
        <div className="text-[9px] uppercase tracking-widest text-text-muted animate-pulse">
          Ready for synchronization
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors"
          >
            Abort
          </button>
          <button 
            onClick={() => onSave(type, formData)}
            className="flex items-center gap-2 bg-cyan-glow text-bg font-black px-10 py-3 text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-glow/20"
          >
            <Save size={16} /> COMMMIT DATA
          </button>
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

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${active ? 'text-cyan-glow' : 'text-text-muted hover:text-text-primary'}`}
    >
      {label}
      {active && (
        <motion.div 
          layoutId="tab-active"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-glow shadow-[0_0_10px_rgba(94,227,255,0.5)]"
        />
      )}
    </button>
  );
}

function InputGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-black block">{label}</label>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function DetailInput({ icon, placeholder, value, onChange }: { icon: React.ReactNode, placeholder: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-3 group focus-within:border-cyan-glow/30 transition-all">
      <div className="text-text-muted group-focus-within:text-cyan-glow transition-colors">
        {icon}
      </div>
      <input 
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-white placeholder:text-text-dark focus:outline-none"
      />
    </div>
  );
}
