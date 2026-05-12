import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Activity, Shield, Database, 
  Search, Settings, ArrowUpRight, BarChart3, 
  Cpu, Lock, X, Check, AlertTriangle, 
  Trash2, Edit3, Filter, MoreHorizontal,
  TrendingUp, CreditCard, User as UserIcon,
  Save, Sparkles, Zap, Crown, Star,
  Brain, Share2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Logo } from './Logo';
import { Neuron, UserProfile, SubscriptionTier, AuthState } from '../types';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  tier: SubscriptionTier;
  neurons: number;
  lastActive: number;
  status: 'Active' | 'Suspended' | 'Pending';
}

interface AdminPanelProps {
  neurons: Neuron[];
  profile: UserProfile | null;
  auth: AuthState;
  onUpdateProfile: (p: UserProfile) => void;
  onUpdateAuth: (a: AuthState) => void;
  onShowExport: () => void;
  onLogout: () => void;
  onClose: () => void;
}

const MOCK_USERS: UserRecord[] = [
  { id: 'u1', name: 'The Architect', email: 'drbrius@gmail.com', tier: 'Quantum', neurons: 42, lastActive: Date.now() - 1000 * 60 * 5, status: 'Active' },
  { id: 'u2', name: 'Alpha Tester', email: 'tester@example.com', tier: 'Pro', neurons: 128, lastActive: Date.now() - 1000 * 60 * 60 * 2, status: 'Active' },
  { id: 'u3', name: 'New User', email: 'new@glia.io', tier: 'Free', neurons: 14, lastActive: Date.now() - 1000 * 60 * 60 * 24, status: 'Active' },
  { id: 'u4', name: 'Ghost Node', email: 'ghost@null.void', tier: 'Pro', neurons: 3, lastActive: Date.now() - 1000 * 60 * 60 * 24 * 7, status: 'Suspended' },
];

const TIERS = [
  { id: 'Free' as SubscriptionTier, name: 'Neural Spark', icon: <Zap size={14} />, color: 'border-white/20' },
  { id: 'Basic' as SubscriptionTier, name: 'Cortex Plus', icon: <Activity size={14} />, color: 'border-cyan-glow/40' },
  { id: 'Pro' as SubscriptionTier, name: 'Synapse Elite', icon: <Star size={14} />, color: 'border-amber-glow/40' },
  { id: 'Quantum' as SubscriptionTier, name: 'Glia Overlord', icon: <Crown size={14} />, color: 'border-violet-glow/40' },
];

export function AdminPanel({ neurons, profile, auth, onUpdateProfile, onUpdateAuth, onShowExport, onLogout, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'logs' | 'dashboard' | 'settings'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Profile Editing State
  const [editProfile, setEditProfile] = useState<UserProfile | null>(profile);
  const [editAuth, setEditAuth] = useState<AuthState>(auth);
  const [password, setPassword] = useState('••••••••');

  // Generate some chart data from actual neurons
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = neurons.filter(n => {
      const nd = new Date(n.created);
      return nd.toDateString() === d.toDateString();
    }).length;
    
    // Cumulative logic for better visual
    const cumulative = neurons.filter(n => n.created <= d.getTime()).length;

    return { name: dayLabel, count, total: cumulative };
  });

  const handleSaveSettings = async () => {
    if (editProfile && auth.uid) {
      const { firebaseService } = await import('../services/firebaseService');
      await firebaseService.updateUserProfile(auth.uid, editProfile);
      onUpdateProfile(editProfile);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[250] bg-bg/95 backdrop-blur-3xl flex items-center justify-center md:p-8 overflow-hidden"
    >
      <div className="w-full max-w-7xl h-full md:h-[90vh] bg-bg-alt/40 border border-white/10 flex flex-col rounded-sm shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-10 py-6 md:py-8 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-4 md:gap-6">
            <Logo size={40} mdSize={56} className="text-rose-glow" />
            <div>
              <h1 className="text-xl md:text-[25px] font-display font-bold text-white leading-tight underline decoration-rose-glow/30 tracking-[0.2em] uppercase">Cortex Command</h1>
              <p className="text-[8px] md:text-[10px] uppercase tracking-[0.5em] text-rose-glow font-black">Superuser Access Terminal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 md:p-4 hover:bg-rose-glow/10 hover:text-rose-glow transition-all rounded-sm border border-transparent hover:border-rose-glow/20">
            <X size={24} md:size={32} />
          </button>
        </div>

        {/* Sidebar + Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Admin Nav */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 p-4 md:p-8 space-y-2 bg-black/20 overflow-x-auto md:overflow-y-auto no-scrollbar md:custom-scrollbar flex md:flex-col shrink-0">
            <AdminNavButton icon={<TrendingUp size={16} />} label="Stats" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <AdminNavButton icon={<UserIcon size={16} />} label="Account" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            
            {auth.isAdmin && (
              <>
                <div className="hidden md:block h-px bg-white/5 my-4" />
                <AdminNavButton icon={<Users size={16} />} label="Network" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                <AdminNavButton icon={<Activity size={16} />} label="System" active={activeTab === 'system'} onClick={() => setActiveTab('system')} />
              </>
            )}
            
            <div className="hidden md:block pt-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-text-muted font-bold block">Neural Capacity</label>
                <div className="h-1 bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${Math.min(100, (neurons.length / 500) * 100)}%` }} 
                    className="h-full bg-cyan-glow shadow-[0_0_10px_rgba(94,227,255,0.5)]" 
                  />
                </div>
              </div>

              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 p-4 bg-rose-glow/10 border border-rose-glow/30 text-rose-glow text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-glow hover:text-bg transition-all"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Main Display */}
          <div className="flex-1 flex flex-col overflow-y-auto p-6 md:p-10 custom-scrollbar">
            {activeTab === 'dashboard' && (
              <div className="space-y-8 md:space-y-10">
                <div>
                  <h2 className="text-2xl md:text-4xl font-serif italic text-white underline decoration-white/10 underline-offset-8">Neural Progression</h2>
                  <p className="text-xs md:text-sm text-text-muted mt-4">Growth analytics and connectivity metrics.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <StatCard icon={<TrendingUp className="text-cyan-glow" size={18} />} label="Velocity" value="4.2/d" sub="Increasing" />
                  <StatCard icon={<Brain className="text-violet-glow" size={18} />} label="Synaptic" value={`${neurons.reduce((acc, n) => acc + (n.connections?.length || 0), 0)}`} sub="Bridges" />
                  <StatCard icon={<Sparkles className="text-amber-glow" size={18} />} label="Insight" value="84%" sub="Coherent" />
                </div>

                <div className="bg-white/5 border border-white/5 p-4 md:p-8 rounded-sm overflow-hidden flex flex-col h-[300px] md:h-auto">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Mind Evolvement</h3>
                  <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5ee3ff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#5ee3ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#ffffff33" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis 
                          stroke="#ffffff33" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ background: '#0a0a0c', border: '1px solid #ffffff11', borderRadius: '4px', fontSize: '10px' }}
                          itemStyle={{ color: '#5ee3ff' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#5ee3ff" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorTotal)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-10 flex-1 overflow-y-auto custom-scrollbar pr-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-serif italic text-white underline decoration-white/10 underline-offset-8">Neural Identity</h2>
                    <p className="text-sm text-text-muted mt-4">Manage your profile coordinate, neural cipher, and protocol access.</p>
                  </div>
                  <button 
                    onClick={handleSaveSettings}
                    className="flex items-center gap-3 bg-cyan-glow text-bg font-black px-8 py-4 uppercase tracking-[0.2em] hover:scale-105 transition-all text-sm"
                  >
                    <Save size={18} /> Commit Changes
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                       <UserIcon size={14} className="text-cyan-glow" /> Personal Matrix
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-text-muted font-bold">Observer Nickname</label>
                        <input 
                          type="text" 
                          className="w-full bg-white/5 border border-white/10 p-4 text-xs font-black uppercase tracking-widest outline-none focus:border-cyan-glow/50 transition-all text-white"
                          value={editProfile?.nickname || ''}
                          onChange={e => setEditProfile(prev => prev ? { ...prev, nickname: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-text-muted font-bold">Email Coordinate</label>
                        <input 
                          type="text" 
                          className="w-full bg-white/5 border border-white/10 p-4 text-xs font-black uppercase tracking-widest outline-none focus:border-cyan-glow/50 transition-all text-white"
                          value={editAuth.email || ''}
                          onChange={e => setEditAuth(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-text-muted font-bold">Neural Cipher (Password)</label>
                        <input 
                          type="password" 
                          className="w-full bg-white/5 border border-white/10 p-4 text-xs font-black uppercase tracking-widest outline-none focus:border-cyan-glow/50 transition-all text-white"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-text-muted font-bold">Primary Goal</label>
                        <textarea 
                          className="w-full bg-white/5 border border-white/10 p-4 text-xs font-black uppercase tracking-widest outline-none focus:border-cyan-glow/50 transition-all text-white h-32 resize-none"
                          value={editProfile?.longTermGoal || ''}
                          onChange={e => setEditProfile(prev => prev ? { ...prev, longTermGoal: e.target.value } : null)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                       <CreditCard size={14} className="text-rose-glow" /> Subscription Protocol
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {TIERS.map(tier => (
                        <button
                          key={tier.id}
                          onClick={() => setEditProfile(prev => prev ? { ...prev, tier: tier.id } : null)}
                          className={`flex items-center justify-between p-6 border transition-all ${editProfile?.tier === tier.id ? tier.color + ' bg-white/5' : 'border-white/5 hover:border-white/10 opacity-60'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 border border-white/10 flex items-center justify-center ${editProfile?.tier === tier.id ? 'text-cyan-glow border-cyan-glow/30' : ''}`}>
                              {tier.icon}
                            </div>
                            <div>
                              <p className="text-sm font-black uppercase tracking-widest text-white">{tier.name}</p>
                              <p className="text-[9px] text-text-muted uppercase tracking-tighter">Capacity Limit: {tier.id === 'Quantum' ? 'Infinite' : tier.id === 'Pro' ? '500' : tier.id === 'Basic' ? '100' : '15'} Nodes</p>
                            </div>
                          </div>
                          {editProfile?.tier === tier.id && <Check size={20} className="text-cyan-glow" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-8 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-serif italic text-white underline decoration-white/10 underline-offset-8">Operator Network</h2>
                    <p className="text-sm text-text-muted mt-4">Authorized entities within the Glia neural network.</p>
                  </div>
                  <div className="relative w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                      type="text" 
                      placeholder="SCAN OPERATORS..." 
                      className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-xs font-black uppercase tracking-widest outline-none focus:border-rose-glow/50 transition-all text-white"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar border border-white/5 bg-black/20">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 group">
                        <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-text-muted">Operator</th>
                        <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-text-muted">Protocol Tier</th>
                        <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-text-muted">Neural Density</th>
                        <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-text-muted">Status</th>
                        <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-text-muted text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {MOCK_USERS.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center font-serif text-xl italic text-white border border-white/10">
                                {user.name[0]}
                              </div>
                              <div>
                                <p className="text-sm font-black text-white uppercase tracking-widest leading-none">{user.name}</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-tighter mt-1">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${
                              user.tier === 'Quantum' ? 'border-violet-glow/40 text-violet-glow bg-violet-glow/5' :
                              user.tier === 'Pro' ? 'border-amber-glow/40 text-amber-glow bg-amber-glow/5' :
                              'border-white/20 text-text-muted'
                            }`}>
                              {user.tier} Protocol
                            </span>
                          </td>
                          <td className="p-6">
                            <p className="text-sm font-black text-white">{user.neurons} <span className="text-[10px] text-text-muted uppercase font-normal ml-1">Synapses</span></p>
                            <div className="w-24 h-1 bg-white/5 mt-2 overflow-hidden">
                              <div className="h-full bg-cyan-glow" style={{ width: `${Math.min(100, (user.neurons/100)*100)}%` }} />
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-glow animate-pulse' : 'bg-rose-glow'}`} />
                              <span className="text-[11px] font-black uppercase tracking-widest text-text-secondary">{user.status}</span>
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-3 hover:bg-cyan-glow/10 hover:text-cyan-glow transition-all border border-transparent hover:border-cyan-glow/20"><Edit3 size={16} /></button>
                              <button className="p-3 hover:bg-rose-glow/10 hover:text-rose-glow transition-all border border-transparent hover:border-rose-glow/20"><Trash2 size={16} /></button>
                              <button className="p-3 hover:bg-white/10 text-white transition-all"><MoreHorizontal size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-12 h-full overflow-y-auto custom-scrollbar pr-4">
                <div className="grid grid-cols-4 gap-6">
                  <StatCard icon={<Cpu className="text-cyan-glow" />} label="Process Load" value="4.2 GHz" sub="Neural Core 01" />
                  <StatCard icon={<ArrowUpRight className="text-green-glow" />} label="Inbound Sync" value="1.4 GB/s" sub="Traffic Steady" />
                  <StatCard icon={<AlertTriangle className="text-amber-glow" />} label="Anomalies" value="0" sub="Zero Containment Breaches" />
                  <StatCard icon={<BarChart3 className="text-violet-glow" />} label="Network Efficiency" value="99.8%" sub="Quantum Coherence" />
                </div>

                <div className="grid grid-cols-2 gap-10 pb-10">
                  <div className="space-y-6">
                    <h3 className="text-xl font-serif italic text-white flex items-center gap-3">
                      <Settings size={20} className="text-rose-glow" /> Protocol Overrides
                    </h3>
                    <div className="space-y-4">
                      <ToggleSetting label="Auto-Containment Protocol" desc="Automatically suspends non-compliant neural nodes." active={true} />
                      <ToggleSetting label="Quantum Backup Mode" desc="Redundant storage in distributed sectors." active={true} />
                      <ToggleSetting label="AI Proactive Guidance" desc="Enable Jarvis higher-order intervention." active={false} />
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-8 flex flex-col justify-center items-center text-center space-y-6">
                    <div className="w-24 h-24 rounded-full border-4 border-rose-glow/20 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-rose-glow/10 rounded-full animate-ping" />
                      <Shield className="text-rose-glow" size={40} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-[0.2em] text-white">Full Wipe Protocol</h4>
                      <p className="text-xs text-text-muted uppercase tracking-widest mt-2 px-10">Initiates total memory purge of all connected neural nodes. Irreversible.</p>
                    </div>
                    <button className="bg-rose-glow text-bg font-black px-12 py-4 uppercase tracking-[0.3em] hover:scale-105 transition-all text-xs">
                      INITIATE RESET
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="flex-1 flex flex-col overflow-hidden space-y-6">
                <div className="flex items-center justify-between">
                   <h2 className="text-4xl font-serif italic text-white underline decoration-white/10 underline-offset-8">Memory Logs</h2>
                   <div className="flex gap-4">
                     <button className="flex items-center gap-2 px-6 py-3 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all">
                       <Filter size={14} /> All Levels
                     </button>
                     <button className="flex items-center gap-2 px-6 py-3 bg-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20 transition-all">
                       Export CSV
                     </button>
                   </div>
                </div>
                <div className="flex-1 bg-black/40 border border-white/5 font-mono p-8 overflow-y-auto custom-scrollbar">
                  <div className="space-y-3 opacity-80">
                    <LogEntry time="08:14:22" sector="KERN" msg="Neural core synchronized with main cluster." level="info" />
                    <LogEntry time="08:15:01" sector="AUTH" msg="Admin session initiated via drbrius@gmail.com." level="warn" />
                    <LogEntry time="08:15:45" sector="DATA" msg="New node identified (type: thought) in sector 7GX." level="info" />
                    <LogEntry time="08:18:12" sector="SYNC" msg="Quota check passed for user 0x92f...A2 (Tier: Pro)." level="info" />
                    <LogEntry time="08:22:01" sector="SYS" msg="Jarvis submodule recalibration complete." level="info" />
                    <LogEntry time="08:25:34" sector="NET" msg="External query blocked from unauthorized IP (45.1.xx.xx)." level="error" />
                    <LogEntry time="08:27:11" sector="USER" msg="Profile updated: The Architect (Goal: Neural Singularity)." level="info" />
                    <LogEntry time="08:28:02" sector="KERN" msg="Garbage collection initiated: 1.4MB purged." level="info" />
                    <LogEntry time="08:29:10" sector="ADMIN" msg="Cortex Command Panel mounted." level="info" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 51, 102, 0.2); border-radius: 10px; }
      `}</style>
    </motion.div>
  );
}

function AdminNavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-5 border transition-all relative group ${active ? 'bg-rose-glow/10 border-rose-glow/40 text-rose-glow' : 'border-transparent text-text-muted hover:text-white hover:bg-white/5'}`}
    >
      {icon}
      <span className="text-xs font-black uppercase tracking-[0.2em]">{label}</span>
      {active && (
        <motion.div layoutId="admin-nav-active" className="absolute left-0 top-2 bottom-2 w-1 bg-rose-glow shadow-[0_0_10px_rgba(255,51,102,0.8)]" />
      )}
    </button>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string, sub: string }) {
  return (
    <div className="p-8 bg-white/5 border border-white/5 rounded-sm space-y-4">
      <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">{label}</p>
        <p className="text-3xl font-black text-white">{value}</p>
        <p className="text-[9px] uppercase tracking-widest text-text-muted mt-2 opacity-60">{sub}</p>
      </div>
    </div>
  );
}

function ToggleSetting({ label, desc, active }: { label: string, desc: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
      <div className="flex-1 mr-8">
        <p className="text-sm font-black uppercase tracking-widest text-white group-hover:text-rose-glow transition-colors">{label}</p>
        <p className="text-[10px] text-text-muted uppercase tracking-tighter mt-1">{desc}</p>
      </div>
      <button className={`w-14 h-7 rounded-full relative transition-all ${active ? 'bg-rose-glow shadow-[0_0_15px_rgba(255,51,102,0.4)]' : 'bg-white/10'}`}>
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${active ? 'left-8' : 'left-1'}`} />
      </button>
    </div>
  );
}

function LogEntry({ time, sector, msg, level }: { time: string, sector: string, msg: string, level: 'info' | 'warn' | 'error' }) {
  const color = level === 'error' ? 'text-rose-glow' : level === 'warn' ? 'text-amber-glow' : 'text-cyan-glow';
  return (
    <div className="flex gap-4 text-[11px] font-mono leading-relaxed">
      <span className="text-text-muted">[{time}]</span>
      <span className={`font-bold ${color}`}>[{sector}]</span>
      <span className="text-text-primary">{msg}</span>
    </div>
  );
}
