/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Mic, Search, Settings, User as UserIcon, Plus, 
  MessageSquare, Sliders, Globe, Terminal, 
  Target, Zap, Clock, Shield, Sparkles, X,
  Trash2, Link2, CheckCircle2, ChevronRight, ChevronLeft,
  Users, Briefcase, MapPin, Milestone, Star, Crown, Lock, Grid, Share2
} from 'lucide-react';
import { BrainCanvas } from './components/BrainCanvas';
import { NeuronForm } from './components/NeuronForm';
import { AdminPanel } from './components/AdminPanel';
import { Directory } from './components/Directory';
import { ExportPanel } from './components/ExportPanel';
import { Logo } from './components/Logo';
import { NeuralBackground } from './components/NeuralBackground';
import { LandingPage } from './components/LandingPage';
import { Neuron, UserProfile, AuthState, NeuronType, SubscriptionTier } from './types';
import { GoogleGenAI } from "@google/genai";

const AI_PROGRAMS = [
  { id: 'claude', name: 'Claude', provider: 'Anthropic', icon: '🤖' },
  { id: 'chatgpt', name: 'ChatGPT', provider: 'OpenAI', icon: '💬' },
  { id: 'gemini', name: 'Gemini', provider: 'Google', icon: '✨' },
  { id: 'mistral', name: 'Mistral', provider: 'Mistral AI', icon: '🌪️' },
  { id: 'llama', name: 'Llama 3', provider: 'Meta', icon: '🦙' },
  { id: 'perplexity', name: 'Perplexity', provider: 'Perplexity AI', icon: '🔍' },
  { id: 'grok', name: 'Grok-1', provider: 'xAI', icon: '✖️' },
  { id: 'deepseek', name: 'DeepSeek', provider: 'DeepSeek', icon: '🐋' },
  { id: 'midjourney', name: 'Midjourney', provider: 'Midjourney', icon: '🎨' },
  { id: 'stable', name: 'Stable Diffusion', provider: 'Stability AI', icon: '🌀' },
  { id: 'elevenlabs', name: 'ElevenLabs', provider: 'ElevenLabs', icon: '🗣️' },
  { id: 'replicate', name: 'Replicate', provider: 'Replicate', icon: '🏗️' },
  { id: 'langchain', name: 'LangChain', provider: 'LangChain', icon: '🔗' },
];

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth as firebaseAuth } from './lib/firebase';
import { firebaseService } from './services/firebaseService';

export default function App() {
  // State
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [auth, setAuth] = useState<AuthState>({ uid: null, email: null, name: null, loggedIn: false });
  const [loading, setLoading] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [showJarvis, setShowJarvis] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal State
  const [editingNeuron, setEditingNeuron] = useState<Partial<Neuron> | null>(null);
  const [modalType, setModalType] = useState<NeuronType | null>(null);

  useEffect(() => {
    // Test connection
    firebaseService.testConnection();

    // Listen for auth changes
    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        const isAdmin = user.email === 'admin@glia.core' || user.email === 'drbrius@gmail.com';
        setAuth({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0] || 'Unknown',
          loggedIn: true,
          isAdmin
        });

        // Load profile
        const userProfile = await firebaseService.getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
          setShowOnboarding(false);
        } else {
          // If no profile, they need onboarding
          setShowOnboarding(true);
        }

        // Subscribe to neurons
        const unsubscribeNeurons = firebaseService.subscribeToNeurons(user.uid, (data) => {
          setNeurons(data);
        });

        setLoading(false);
        return () => unsubscribeNeurons();
      } else {
        setAuth({ uid: null, email: null, name: null, loggedIn: false });
        setProfile(null);
        setNeurons([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const NEURON_LIMITS: Record<SubscriptionTier, number> = {
    'Free': 50,
    'Basic': 100,
    'Pro': 1000,
    'Quantum': 99999
  };

  const handleLogin = async (a: AuthState, tier: SubscriptionTier) => {
    if (!a.uid) return;
    
    setAuth(a);
    let userProfile = await firebaseService.getUserProfile(a.uid);
    
    if (!userProfile) {
      userProfile = await firebaseService.createUserProfile(a.uid, a.email!, a.name!, tier);
      setProfile(userProfile);
      setShowOnboarding(true);
    } else {
      setProfile(userProfile);
      if (userProfile.tier !== tier) {
        await firebaseService.updateUserProfile(a.uid, { tier });
      }
    }
  };

  const addNeuron = async (type: NeuronType, initialData: Partial<Neuron> = {}) => {
    if (!auth.uid) return;

    const limit = NEURON_LIMITS[profile?.tier || 'Free'];
    if (neurons.length >= limit && !initialData.id) {
      alert(`Neural limit reached for ${profile?.tier} protocol (${limit} neurons). Upgrade required.`);
      return;
    }

    if (initialData.id) {
      // Update
      await firebaseService.updateNeuron(initialData.id, initialData);
    } else {
      // Create
      const newNeuron: any = {
        type: type,
        title: initialData.title || 'New Entry',
        description: initialData.description || `A new ${type} recorded in the web.`,
        tags: initialData.tags || [type],
        size: initialData.size || (8 + Math.random() * 6),
        importance: initialData.importance || 5,
        connections: initialData.connections || (selectedId ? [selectedId] : []),
        phi: initialData.phi || ((Math.random() - 0.5) * 2 * Math.PI),
        theta: initialData.theta || ((Math.random() - 0.5) * Math.PI),
        r3: initialData.r3 || (0.8 + Math.random() * 0.2),
        pp: initialData.pp || (Math.random() * Math.PI * 2),
        metadata: initialData.metadata || {},
        content: initialData.content || ''
      };
      
      const id = await firebaseService.addNeuron(auth.uid, newNeuron);
      if (id) setSelectedId(id);
    }

    setEditingNeuron(null);
    setModalType(null);
  };

  const handleSummarize = async () => {
    if (!transcription) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const prompt = `Summarize the following spoken transcription into a concise thought for a personal neural brain. Return ONLY the summary.\n\nTranscription: ${transcription}`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      const text = response.text || "Insight crystallized.";
      
      addNeuron('insight', { title: text });
      setTranscription('');
      setIsRecording(false);
    } catch (err) {
      console.error(err);
      addNeuron('insight', { title: 'Transcription recorded without AI enrichment.' });
    }
  };

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    setAuth({ uid: null, email: null, name: null, loggedIn: false });
    setProfile(null);
    setNeurons([]);
    setShowAdmin(false);
  };

  const selectedNeuron = neurons.find(n => n.id === selectedId);

  // Onboarding Questions
  const onboardingSteps = [
    { title: "Identity", desc: "How should Glia Core address the architect?", fields: ["name", "nickname"] },
    { title: "Domain Mapping", desc: "Which regions of reality do you navigate?", fields: ["domains"], multi: true, options: ["Work", "Finance", "Creative", "Health", "Social", "Legacy"] },
    { title: "Decision Engine", desc: "How do you resolve complexity?", fields: ["decisionStyle"], options: ["Intuitive", "Analytical", "Pragmatic", "Collaborative"] },
    { title: "Temporal Preference", desc: "When is your neural load highest?", fields: ["peakTime"], options: ["Dawn", "Noon", "Dusk", "Night"] },
    { title: "Social Load", desc: "What is your typical interaction depth?", fields: ["socialEnergy"], options: ["Deep Reflection", "Ambivert", "High Output"] },
    { title: "North Star", desc: "What is the primary directive for the next 12 months?", fields: ["longTermGoal"] },
    { title: "Current Friction", desc: "What is the biggest barrier to progress?", fields: ["currentChallenge"] },
    { title: "Technical Calibration", desc: "How deep into the machine do we go?", fields: ["technicalLevel"], options: ["Beginner", "Intermediate", "Expert"] },
    { title: "Update Frequency", desc: "At what rate do you ingest new protocols?", fields: ["learningRate"], options: ["Slow", "Normal", "Hyper"] },
    { title: "Execution Protocol", desc: "How do you finalize tasks?", fields: ["productivityMethod"], options: ["Deep Work", "Pomodoro", "Flow State", "Chaos"] }
  ];

  if (loading) {
    return (
      <div className="h-screen w-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Logo size={100} className="animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-cyan-glow animate-pulse">Initializing Neural Core...</p>
        </div>
      </div>
    );
  }

  if (!auth.loggedIn) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen bg-bg relative overflow-hidden font-sans selection:bg-cyan-glow selection:text-bg">
      <NeuralBackground />
      
      <BrainCanvas 
        neurons={neurons}
        selectedId={selectedId}
        onSelect={setSelectedId}
        searchQuery={searchQuery}
      />

      {/* TOP NAVIGATION */}
      <nav className="fixed top-0 inset-x-0 h-20 flex items-center px-4 md:px-10 z-30 bg-bg/40 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4 md:gap-6 flex-1">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-3 cursor-pointer shrink-0"
          >
            <Logo size={40} mdSize={48} />
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-[25px] tracking-[0.2em] text-white mb-0 leading-none uppercase">Glia</h1>
              <p className="text-[9px] uppercase tracking-[0.6em] text-cyan-glow font-medium mt-1">Neural Core Hub</p>
            </div>
          </motion.div>

          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-cyan-glow transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH NEURAL NET..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-10 py-2.5 text-xs md:text-sm tracking-widest text-white focus:border-cyan-glow/50 focus:bg-white/10 outline-none transition-all placeholder:text-text-dark"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-4">
          <div className="hidden xl:flex items-center gap-4 px-6 border-r border-white/10 mr-2">
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-text-muted">Subscription</p>
              <div className="flex items-center gap-2 justify-end">
                {profile?.tier === 'Quantum' && <Crown size={12} className="text-violet-glow" />}
                {profile?.tier === 'Pro' && <Star size={12} className="text-amber-glow" />}
                <p className="text-sm font-bold text-cyan-glow uppercase">{profile?.tier || 'Free'}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAdmin(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-glow/10 border border-rose-glow/40 text-[10px] font-black text-rose-glow uppercase tracking-[0.2em] hover:bg-rose-glow/20 transition-all cursor-pointer group"
            >
              <Shield size={14} className="group-hover:rotate-12 transition-transform" />
              Command
            </button>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowJarvis(true)} 
            className="flex items-center gap-2 bg-cyan-glow/10 hover:bg-cyan-glow/20 border border-cyan-glow/30 px-3 md:px-6 py-2.5 rounded-sm transition-all group"
          >
            <Sparkles size={18} className="text-cyan-glow group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-cyan-glow hidden sm:block">Jarvis</span>
          </motion.button>
          
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 md:p-2 md:pr-6 rounded-sm">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-violet-glow to-cyan-glow flex items-center justify-center font-serif italic text-bg font-bold border border-white/20">
              {profile?.name?.[0] || 'G'}
            </div>
            <div className="hidden lg:block">
              <p className="text-[10px] font-bold text-white tracking-widest uppercase truncate max-w-[80px]">{profile?.nickname || 'ADMIN'}</p>
              <p className="text-[9px] text-cyan-glow opacity-60 uppercase tracking-tighter truncate">{neurons.length} Nodes</p>
            </div>
          </div>

          <button onClick={() => setShowAdmin(true)} className="lg:hidden p-2 text-text-muted hover:text-white">
            <Settings size={20} />
          </button>
        </div>
      </nav>

      {/* DOCK */}
      <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-full px-4 flex justify-center">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="flex gap-2 md:gap-3 p-2 md:p-3 bg-bg-alt/90 border border-white/10 backdrop-blur-2xl shadow-2xl pointer-events-auto rounded-sm overflow-x-auto max-w-full no-scrollbar"
        >
          <button onClick={() => setModalType('thought')} className="flex items-center gap-2 bg-cyan-glow text-bg font-black px-4 md:px-6 py-2.5 md:py-3 text-[10px] md:text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
            <Plus size={16} /> <span className="hidden sm:inline">ADD THOUGHT</span><span className="sm:hidden">ADD</span>
          </button>
          <div className="w-px bg-white/10 my-2 shrink-0" />
          <div className="flex items-center">
            <DockButton icon={<Briefcase size={18} />} label="Project" onClick={() => setModalType('project')} />
            <DockButton icon={<Users size={18} />} label="Contact" onClick={() => setModalType('contact')} />
            <DockButton icon={<Grid size={18} />} label="Directory" onClick={() => setShowDirectory(true)} />
            <DockButton icon={<Share2 size={18} />} label="Sync AI" onClick={() => setShowExport(true)} />
            <DockButton icon={<MapPin size={18} />} label="Place" onClick={() => setModalType('place')} />
            <DockButton icon={<Milestone size={18} />} label="Plan" onClick={() => setModalType('event')} />
          </div>
          <div className="w-px bg-white/10 my-2 shrink-0" />
          <button onClick={() => setSelectedId(null)} title="Clear Selection" className="p-2 md:p-3 text-text-muted hover:text-white transition-colors shrink-0">
            <Zap size={20} />
          </button>
        </motion.div>
      </div>

      {/* SELECTION DETAIL OVERLAY */}
      <AnimatePresence>
        {selectedNeuron && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed left-4 right-4 md:left-10 md:right-auto bottom-32 md:top-32 md:bottom-auto md:w-85 bg-bg-alt/90 border border-white/10 p-6 md:p-8 z-20 backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[50vh] md:max-h-[70vh]"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-widest text-cyan-glow font-bold bg-cyan-glow/10 px-2 py-0.5 border border-cyan-glow/20">
                {selectedNeuron.type}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingNeuron(selectedNeuron);
                    setModalType(selectedNeuron.type);
                  }}
                  className="text-text-muted hover:text-cyan-glow transition-colors"
                  title="Modify Hub"
                >
                  <Settings size={16} />
                </button>
                <button 
                  onClick={() => {
                    firebaseService.deleteNeuron(selectedId);
                    setSelectedId(null);
                  }} 
                  className="text-text-muted hover:text-rose-glow transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="text-2xl font-serif italic text-white mb-2">{selectedNeuron.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed font-serif italic mb-6">
              {selectedNeuron.description}
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-text-muted uppercase tracking-widest">
                <Clock size={12} /> {new Date(selectedNeuron.created).toLocaleDateString()}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedNeuron.tags.map(t => (
                  <span key={t} className="text-[9px] bg-white/5 border border-white/10 px-2 py-1 uppercase tracking-widest text-text-muted">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JARVIS PANEL */}
      <AnimatePresence>
        {showJarvis && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowJarvis(false)}
              className="fixed inset-0 bg-bg/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 500, y: typeof window !== 'undefined' && window.innerWidth < 768 ? 500 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 500, y: typeof window !== 'undefined' && window.innerWidth < 768 ? 500 : 0 }}
              className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-[#070b18]/98 border-l border-white/10 z-50 flex flex-col p-6 md:p-10 backdrop-blur-3xl shadow-[-50px_0_100px_rgba(0,0,0,0.5)] h-full overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8 md:mb-10 shrink-0">
                <div>
                  <h2 className="font-serif italic text-3xl md:text-4xl text-white">Jarvis <em>Core</em></h2>
                  <p className="text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-cyan-glow font-black mt-1">Neural AI Hub</p>
                </div>
                <button onClick={() => setShowJarvis(false)} className="btn-icon w-10 h-10 md:w-12 md:h-12 hover:bg-rose-glow/10 hover:text-rose-glow group">
                  <X size={20} md:size={24} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 md:space-y-8 pr-2 md:pr-4 custom-scrollbar">
                <section className="bg-amber-glow/5 border border-amber-glow/20 p-5 md:p-6 rounded-sm space-y-3">
                  <div className="flex items-center gap-2 text-amber-glow text-[9px] md:text-[10px] uppercase tracking-widest font-bold">
                    <Sparkles size={14} /> JARVIS PROACTIVE
                  </div>
                  <p className="text-xs md:text-sm font-serif italic text-text-primary leading-relaxed">
                    {profile ? `Greetings, Architect ${profile.nickname || profile.name}. Analysis of the neural web shows ${neurons.length} connections. To optimize towards your "${profile.longTermGoal}" goal, I recommend recording more detailed insights regarding your ${profile.currentChallenge} factor.` : "Calibration incomplete. Proceed with onboarding for Jarvis assistance."}
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-[10px] md:text-xs uppercase tracking-[0.3em] flex items-center gap-3 text-text-muted font-bold">
                    <Mic size={16} /> Speak to the Core
                  </h3>
                  <div className="bg-white/5 border border-white/10 p-4 md:p-6 space-y-4 md:space-y-5 rounded-sm">
                    <textarea 
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      placeholder="Share a realization..."
                      className="w-full bg-transparent border-none outline-none text-base md:text-lg leading-relaxed resize-none h-32 md:h-40 text-text-primary placeholder:text-text-dark font-serif italic"
                    />
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button 
                        onClick={() => {
                          const mockVoice = "Just spoke with Sarah about the venture capital round. She's interested in the seed series if we can hit our alpha milestone by Q3.";
                          setTranscription(mockVoice);
                          setIsRecording(true);
                          setTimeout(() => setIsRecording(false), 2000);
                        }}
                        className={`w-full sm:flex-1 flex items-center justify-center gap-3 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${isRecording ? 'bg-rose-glow/20 text-rose-glow border border-rose-glow/40 animate-pulse' : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'}`}
                      >
                        <Mic size={18} /> {isRecording ? 'CAPTURING...' : 'SPEECH'}
                      </button>
                      <button 
                        onClick={handleSummarize}
                        disabled={!transcription || isRecording}
                        className="w-full sm:w-auto bg-cyan-glow text-bg font-black px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs uppercase tracking-widest disabled:opacity-30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                      >
                        <Sparkles size={16} /> ANALYZE
                      </button>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-[10px] md:text-xs uppercase tracking-[0.3em] flex items-center gap-3 text-text-muted font-bold">
                    <Globe size={16} /> External AI Nodes
                  </h3>
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 pb-10">
                    {AI_PROGRAMS.map(ai => (
                      <button 
                        key={ai.id} 
                        className="bg-white/5 border border-white/10 p-3 md:p-4 group hover:border-cyan-glow transition-all text-center rounded-sm"
                      >
                        <span className="text-xl md:text-2xl mb-1 md:mb-2 block group-hover:scale-110 transition-transform">{ai.icon}</span>
                        <p className="text-[8px] md:text-[9px] font-black tracking-widest truncate text-text-primary uppercase">{ai.name}</p>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 10-STEP ONBOARDING */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-bg shadow-[inset_0_0_200px_rgba(0,0,0,0.8)] overflow-y-auto"
          >
            <div className="max-w-2xl w-full py-10 md:py-0">
              <div className="flex gap-1 md:gap-2 mb-10 md:mb-16">
                {onboardingSteps.map((_, i) => (
                  <div key={i} className={`h-1 md:h-1.5 flex-1 transition-all duration-700 rounded-full ${i === onboardingStep ? 'bg-cyan-glow shadow-[0_0_15px_rgba(94,227,255,0.8)]' : i < onboardingStep ? 'bg-cyan-glow/20' : 'bg-white/5'}`} />
                ))}
              </div>

              <motion.div 
                key={onboardingStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 md:space-y-10"
              >
                <div className="space-y-3 md:space-y-4">
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.5em] md:tracking-[0.8em] text-cyan-glow font-black block">Cortex Calibration : {onboardingStep + 1} / 10</span>
                  <h2 className="text-4xl md:text-6xl font-serif italic text-white tracking-tighter">{onboardingSteps[onboardingStep].title}</h2>
                  <p className="font-serif italic text-lg md:text-xl text-text-secondary opacity-60 leading-relaxed max-w-lg">{onboardingSteps[onboardingStep].desc}</p>
                </div>

                <div className="py-2 md:py-4">
                  {onboardingSteps[onboardingStep].options ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      {onboardingSteps[onboardingStep].options?.map(opt => {
                        const field = onboardingSteps[onboardingStep].fields[0];
                        const isSelected = onboardingSteps[onboardingStep].multi 
                          ? profile?.[field as keyof UserProfile]?.includes(opt)
                          : profile?.[field as keyof UserProfile] === opt;

                        return (
                          <motion.button 
                            key={opt}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (onboardingSteps[onboardingStep].multi) {
                                const current = (profile?.[field as keyof UserProfile] as string[]) || [];
                                const next = current.includes(opt) ? current.filter(c => c !== opt) : [...current, opt];
                                setProfile(p => ({ ...p, [field]: next } as UserProfile));
                              } else {
                                setProfile(p => ({ ...p, [field]: opt } as UserProfile));
                              }
                            }}
                            className={`p-4 md:p-6 border text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-sm ${isSelected ? 'border-cyan-glow bg-cyan-glow/10 text-cyan-glow shadow-[0_0_30px_rgba(94,227,255,0.1)]' : 'border-white/10 hover:border-white/30 text-text-muted hover:text-white bg-white/5'}`}
                          >
                            {opt}
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="relative group">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="INPUT NEURAL PROTOCOL..."
                        className="w-full bg-transparent border-b border-white/10 py-4 md:py-6 text-2xl md:text-4xl font-serif italic outline-none focus:border-cyan-glow transition-all text-white placeholder:text-text-dark"
                        value={(profile?.[onboardingSteps[onboardingStep].fields[0] as keyof UserProfile] as string) || ''}
                        onChange={(e) => {
                          const field = onboardingSteps[onboardingStep].fields[0];
                          setProfile(p => ({ ...p, [field]: e.target.value } as UserProfile));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (onboardingStep < onboardingSteps.length - 1) setOnboardingStep(s => s + 1);
                            else {
                               setShowOnboarding(false);
                               if (auth.uid && profile) firebaseService.updateUserProfile(auth.uid, profile);
                            }
                          }
                        }}
                      />
                      <div className="absolute bottom-0 left-0 h-0.5 bg-cyan-glow w-0 group-focus-within:w-full transition-all duration-1000" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 md:pt-10">
                  <button 
                    disabled={onboardingStep === 0}
                    onClick={() => setOnboardingStep(s => s - 1)} 
                    className="order-2 sm:order-1 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors disabled:opacity-0"
                  >
                    <ChevronLeft className="inline mr-2" size={14} /> Back
                  </button>
                  <button 
                    onClick={() => {
                      if (onboardingStep < onboardingSteps.length - 1) setOnboardingStep(s => s + 1);
                      else {
                        setShowOnboarding(false);
                        if (auth.uid && profile) firebaseService.updateUserProfile(auth.uid, profile);
                      }
                    }}
                    className="order-1 sm:order-2 w-full sm:w-auto flex justify-center items-center gap-4 bg-cyan-glow text-bg font-black px-10 md:px-12 py-4 md:py-5 text-[10px] md:text-xs uppercase tracking-widest hover:translate-x-2 transition-all shadow-[0_10px_30px_rgba(94,227,255,0.2)]"
                  >
                    {onboardingStep === onboardingSteps.length - 1 ? 'INITIATE BRAIN' : 'Next Protocol'} <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEURON CREATION / EDIT MODAL */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-bg/80 backdrop-blur-xl">
            <NeuronForm 
              type={modalType}
              initialData={editingNeuron || {}}
              allNeurons={neurons}
              onSave={addNeuron}
              onCancel={() => {
                setModalType(null);
                setEditingNeuron(null);
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN PANEL */}
      <AnimatePresence>
        {showAdmin && (
          <AdminPanel 
            neurons={neurons}
            profile={profile}
            auth={auth}
            onUpdateProfile={setProfile}
            onUpdateAuth={setAuth}
            onShowExport={() => setShowExport(true)}
            onLogout={handleLogout}
            onClose={() => setShowAdmin(false)}
          />
        )}
      </AnimatePresence>

      {/* DIRECTORY */}
      <AnimatePresence>
        {showDirectory && (
          <Directory 
            neurons={neurons}
            onEdit={(n) => {
              setEditingNeuron(n);
              setModalType(n.type);
              setShowDirectory(false);
            }}
            onDelete={(id) => {
              firebaseService.deleteNeuron(id);
            }}
            onClose={() => setShowDirectory(false)}
          />
        )}
      </AnimatePresence>

      {/* EXPORT */}
      <AnimatePresence>
        {showExport && (
          <ExportPanel 
            neurons={neurons}
            profile={profile}
            onClose={() => setShowExport(false)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(94, 227, 255, 0.2); }
      `}</style>
    </div>
  );
}

function DockButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="p-3 text-text-secondary hover:text-white transition-all relative group flex flex-col items-center gap-1"
    >
      <div className="p-2 border border-transparent group-hover:border-white/10 group-hover:bg-white/5 rounded-sm">
        {icon}
      </div>
      <span className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-bg-alt border border-white/20 px-3 py-1 text-[9px] uppercase tracking-widest pointer-events-none transition-opacity whitespace-nowrap">
        Add {label}
      </span>
    </motion.button>
  );
}
