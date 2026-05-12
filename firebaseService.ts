import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { 
  Zap, Shield, Sparkles, Brain, Check, Star, 
  Crown, Lock, Globe, Terminal, Users, 
  ChevronRight, ArrowRight, Layers, Cpu, 
  Network, Database, Share2, Rocket, X,
  Activity, Command, Box, Disc
} from 'lucide-react';
import { Logo } from './Logo';
import { NeuralBackground } from './NeuralBackground';
import { SubscriptionTier, AuthState } from '../types';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe((import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || '');

import { signInWithGoogle } from '../lib/firebase';

interface LandingPageProps {
  onLogin: (auth: AuthState, tier: SubscriptionTier) => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('Free');
  const [isSyncing, setIsSyncing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const heroZ = useTransform(smoothProgress, [0, 0.2], [0, -500]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const portalScale = useTransform(smoothProgress, [0, 0.3], [0.5, 2.5]);
  const portalRotate = useTransform(smoothProgress, [0, 1], [0, 180]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGoogleAuth = async () => {
    setIsSyncing(true);
    setAuthError(null);
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      
      const authState: AuthState = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || 'Unknown',
        loggedIn: true,
        isAdmin: user.email === 'admin@glia.core' || user.email === 'drbrius@gmail.com'
      };

      onLogin(authState, selectedTier);
    } catch (error: any) {
      console.error("Authentication failed:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError("Sync Interrupted: Connection portal closed manually.");
      } else {
        setAuthError("Sync Failed: Protocol error during initialization.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div ref={containerRef} className="relative bg-bg text-white font-sans selection:bg-cyan-glow selection:text-bg overflow-x-hidden min-h-[600vh]">
      <NeuralBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[200] border-b border-white/5 bg-bg/40 backdrop-blur-3xl px-4 md:px-12 py-5 flex items-center justify-between transition-all">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-4 group cursor-pointer outline-none"
        >
          <Logo size={44} className="group-hover:rotate-12 transition-transform" />
          <span className="font-display font-bold text-[25px] tracking-[0.3em] hidden sm:block uppercase">
            <span className="text-white">Glia</span> <span className="text-cyan-glow">Core</span>
          </span>
        </button>
        
        <div className="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">
          {['Vision', 'Benchmark', 'Pricing', 'Sync'].map((item) => (
            <button 
              key={item} 
              onClick={() => scrollToSection(item.toLowerCase())} 
              className="hover:text-cyan-glow transition-all relative group py-2"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-glow transition-all group-hover:w-full" />
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => scrollToSection('access')}
          className="px-6 md:px-10 py-3.5 border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] hover:bg-cyan-glow hover:text-bg hover:border-cyan-glow transition-all whitespace-nowrap outline-none shadow-xl hover:shadow-cyan-glow/20"
        >
          Initialize Sync
        </button>
      </nav>

      {/* Hero Section - Sticky Reveal */}
      <section className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden perspective-1000 z-10">
        <motion.div 
          style={{ translateZ: heroZ, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 preserve-3d"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 bg-cyan-glow/5 border border-cyan-glow/20 rounded-full mb-10 backdrop-blur-md"
          >
            <Activity size={14} className="text-cyan-glow animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-glow">V4.1 Quantum Protocol Active</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-display mb-12 leading-[0.85] tracking-tighter"
          >
            THE NEURO <br/>
            <span className="text-amber-glow stroke-text">OPERATING</span> <br/>
            SYSTEM.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-text-secondary font-serif italic mb-12 leading-relaxed px-4"
          >
            Unlock the bridge between human intuition and artificial logic. 
            Map your mind, resonant with intelligence.
          </motion.p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <button 
              onClick={() => scrollToSection('access')}
              className="w-full sm:w-auto bg-cyan-glow text-bg px-14 py-6 font-black uppercase tracking-[0.4em] text-xs shadow-[0_20px_60px_rgba(94,227,255,0.4)] hover:shadow-cyan-glow/60 hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-4 group"
            >
              IGNITE SYNC <Zap size={20} className="group-hover:rotate-12" />
            </button>
            <div className="text-[10px] font-black uppercase tracking-[0.6em] text-text-muted flex items-center gap-4">
              <span className="w-12 h-px bg-white/10" />
              BEYOND SEARCH
              <span className="w-12 h-px bg-white/10" />
            </div>
          </div>
        </motion.div>

        {/* Neural Orb Effect */}
        <motion.div 
          style={{ scale: portalScale, rotate: portalRotate }}
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        >
          <div className="relative w-[150vw] h-[150vw] max-w-[2000px] max-h-[2000px]">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{ duration: 30 + i * 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-cyan-glow/5 rounded-full"
                style={{ scale: 1 - i * 0.08, opacity: (12 - i) / 12 }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-radial from-cyan-glow/20 via-transparent to-transparent blur-[160px] opacity-40" />
            <div className="absolute inset-0 bg-gradient-conic from-cyan-glow/10 via-transparent to-cyan-glow/10 blur-3xl opacity-20" />
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-text-muted opacity-30"
        >
          <span className="text-[10px] uppercase tracking-[0.6em] font-black">DIVE INTO CORTEX</span>
          <ChevronRight size={20} className="rotate-90" />
        </motion.div>
      </section>

      {/* Spacer */}
      <div className="h-[40vh]" />

      {/* Vision Section */}
      <section id="vision" className="relative z-20 py-32 md:py-64 px-4 md:px-12 bg-bg shadow-[0_-100px_200px_rgba(4,6,13,1)] border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => <FloatingElement key={i} index={i} />)}
        </div>
        
        <SectionEntrance className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="preserve-3d space-y-12">
              <div>
                <p className="text-cyan-glow text-[11px] font-black uppercase tracking-[0.8em] mb-8">NODE_PROTOCOL_01</p>
                <h2 className="text-5xl md:text-8xl font-serif italic mb-10 leading-tight tracking-tighter">Resonant <br/> Intelligence.</h2>
                <p className="text-text-secondary text-xl font-serif italic leading-relaxed opacity-70 max-w-xl">
                  Glia Core isn't a chatbot. It's an extension of your creative self. We map your projects, connections, and silent insights into a living neural graph.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <ThreeDCard title="Neuro Sync" desc="Real-time bridge to every major LLM." icon={<Brain size={24} />} delay={0.1} />
                <ThreeDCard title="Context Mesh" desc="No more re-prompting. AI knows you." icon={<Network size={24} />} delay={0.2} />
                <ThreeDCard title="Encrypted Core" desc="Your thoughts are yours alone." icon={<Shield size={24} />} delay={0.3} />
                <ThreeDCard title="Quantum Speed" desc="Context injection in <200ms." icon={<Zap size={24} />} delay={0.4} />
              </div>
            </div>

            <div className="relative aspect-square flex items-center justify-center perspective-1000">
               <motion.div 
                 animate={{ rotateY: [0, 360], rotateX: [0, 10, 0] }}
                 transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                 className="relative w-full h-full preserve-3d"
               >
                 {/* Futuristic 3D Spinner */}
                 {[...Array(30)].map((_, i) => (
                   <div 
                      key={i}
                      className="absolute left-1/2 top-1/2 w-1 h-32 bg-gradient-to-b from-cyan-glow/40 to-transparent"
                      style={{ 
                        transform: `rotate(${i * 12}deg) translateY(${150 + Math.sin(i) * 50}px) perspective(1000px) rotateX(90deg)`,
                        opacity: 0.2 + Math.random() * 0.5
                      }}
                   />
                 ))}
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-64 h-64 border-4 border-cyan-glow/20 rounded-full animate-[spin_20s_linear_infinite]" />
                   <div className="absolute w-48 h-48 border border-white/10 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
                   <Logo size={160} className="drop-shadow-[0_0_50px_rgba(94,227,255,0.4)]" />
                 </div>
               </motion.div>
            </div>
          </div>
        </SectionEntrance>
      </section>

      {/* Benchmark Section */}
      <section id="benchmark" className="py-32 md:py-64 px-4 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => <FloatingElement key={i} index={i} />)}
        </div>
        
        <SectionEntrance className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-40 relative z-10">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.04 }}
              className="text-[10rem] md:text-[20rem] font-serif italic select-none absolute -top-40 left-1/2 -translate-x-1/2 tracking-[0.2em] w-full"
            >
              DATA
            </motion.h2>
            <p className="text-amber-glow text-[12px] font-black uppercase tracking-[1em] mb-6">EMPIRICAL_EVIDENCE</p>
            <h3 className="text-5xl md:text-8xl font-serif italic tracking-tighter leading-none">Superior Performance. <br/> Period.</h3>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
            <BenchmarkCard label="Sync Latency" val="180ms" increase="+99.2%" desc="Direct cortex injection bypasses standard prompt parsing overhead." />
            <BenchmarkCard label="Model Drift" val="0.04%" decrease="-96%" desc="Neural grounding prevents hallucinatory drift in long-term reasoning cycles." />
            <BenchmarkCard label="Cognitive Load" val="~0" increase="NATIVE" desc="Experience zero-friction context sharing between your thoughts and the AI." />
          </div>
        </SectionEntrance>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 md:py-64 px-4 md:px-12 bg-bg-alt/30 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => <FloatingElement key={i} index={i} />)}
        </div>
        
        <SectionEntrance className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mb-32">
            <p className="text-violet-glow text-[11px] font-black uppercase tracking-[0.8em] mb-8">CALIBRATION_TIERS</p>
            <h2 className="text-5xl md:text-8xl font-serif italic mb-10 tracking-tighter">Choose Your <br/> Bandwidth.</h2>
            <p className="text-text-secondary text-2xl font-serif italic opacity-60 leading-relaxed max-w-2xl">
              Scale your neural infrastructure from hobbyist mapping to enterprise-grade mesh webs.
            </p>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <PriceCard 
              tier="Free" price="0" 
              desc="Observation protocol for individual nodes." 
              features={['Up to 50 Neurons', 'Standard Sync', 'Neural Search', 'Local History']} 
              onClick={() => { setSelectedTier('Free'); scrollToSection('access'); }}
            />
            <PriceCard 
              tier="Pro" price="39" 
              active
              desc="High-resolution mapping for the creative elite." 
              features={['1000 Strong Nodes', 'Quantum Sync Bridge', 'Stripe Integration', 'Advanced AI Grounding', 'Priority Access']} 
              onClick={() => { setSelectedTier('Pro'); scrollToSection('access'); }}
            />
            <PriceCard 
              tier="Quantum" price="149" 
              desc="The absolute ceiling of human-AI synergy." 
              features={['99,999+ Nodes', 'Omni-Channel Sync', 'Team Mesh Networks', 'Dedicated Neural Support', 'Admin Dashboard']} 
              onClick={() => { setSelectedTier('Quantum'); scrollToSection('access'); }}
            />
          </div>
        </SectionEntrance>
      </section>

      {/* Final Access Terminal */}
      <section id="access" className="py-32 md:py-64 px-4 md:px-12 relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="max-w-xl w-full relative z-10">
          <div className="text-center mb-16">
            <motion.div 
               animate={{ rotate: [0, 360] }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="inline-block mb-12"
            >
              <Logo size={120} />
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-serif italic mb-6 tracking-tighter">Initialize Access.</h2>
            <p className="text-[11px] uppercase tracking-[0.6em] text-cyan-glow font-black italic opacity-60">Authorize Neural Credentials</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 md:p-16 border border-cyan-glow/20 bg-bg/80 backdrop-blur-3xl shadow-[0_40px_120px_rgba(0,0,0,0.8)] relative group overflow-hidden"
          >
            {/* Scanning Line Effect */}
            <motion.div 
               animate={{ top: ['-10%', '110%'] }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="absolute left-0 right-0 h-px bg-cyan-glow/30 z-20 pointer-events-none"
            />
            
            <div className="space-y-12 relative z-10">
              <div className="space-y-6">
                <label className="text-[11px] uppercase tracking-[0.8em] text-text-muted font-black block text-center">Sync Tier Selection</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {(['Free', 'Pro', 'Quantum'] as SubscriptionTier[]).map(t => (
                    <button 
                      key={t}
                      type="button"
                      onClick={() => setSelectedTier(t)}
                      className={`py-6 text-[10px] font-black uppercase tracking-[0.3em] border transition-all ${selectedTier === t ? 'bg-cyan-glow text-bg border-cyan-glow shadow-[0_0_40px_rgba(94,227,255,0.3)] scale-105' : 'border-white/10 text-white hover:border-white/30 hover:bg-white/5'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <button 
                  onClick={handleGoogleAuth}
                  disabled={isSyncing}
                  className="w-full bg-white text-bg font-black py-8 uppercase tracking-[0.6em] text-xs hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-50 flex items-center justify-center gap-6 group"
                >
                  {isSyncing ? (
                    <>STABILIZING CORTEX... <Activity size={24} className="animate-spin" /></>
                  ) : (
                    <>
                      <Globe size={24} className="group-hover:rotate-[360deg] transition-transform duration-1000" />
                      SYNC VIA GOOGLE
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {authError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-rose-glow/10 border border-rose-glow/20 p-6"
                    >
                      <p className="text-[11px] text-rose-glow font-black uppercase tracking-widest text-center leading-relaxed">
                        {authError}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-center gap-6 pt-4">
                   <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-text-muted font-bold">
                     <Lock size={12} className="text-cyan-glow/40" /> End-to-End
                   </div>
                   <div className="w-1 h-1 bg-white/10 rounded-full" />
                   <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-text-muted font-bold">
                     <Shield size={12} className="text-cyan-glow/40" /> Biometric Ready
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pulsing Core behind form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1200px] bg-cyan-glow/5 blur-[200px] rounded-full pointer-events-none animate-pulse" />
      </section>

      {/* Footer */}
      <footer className="py-32 px-12 border-t border-white/5 bg-bg-alt/40 backdrop-blur-3xl relative z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mb-24">
            <div className="flex flex-col items-center lg:items-start gap-6">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-6 group cursor-pointer"
              >
                <Logo size={48} className="group-hover:rotate-12 transition-transform duration-500" />
                <span className="font-display font-bold text-[28px] tracking-[0.4em] uppercase">
                  <span className="text-white">Glia</span> <span className="text-cyan-glow">Core</span>
                </span>
              </button>
              <p className="text-text-muted text-sm font-serif italic max-w-sm text-center lg:text-left opacity-60">
                The foundational mesh for the future of human-artificial collaboration. Developed by neural architects.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 text-[11px] font-black uppercase tracking-[0.5em] text-text-muted">
              <div className="flex flex-col gap-6">
                <p className="text-white/40 mb-2 font-mono">_PRODUCT</p>
                <button onClick={() => scrollToSection('vision')} className="hover:text-cyan-glow transition-colors text-left">Vision</button>
                <button onClick={() => scrollToSection('benchmark')} className="hover:text-cyan-glow transition-colors text-left">Data</button>
                <button onClick={() => scrollToSection('pricing')} className="hover:text-cyan-glow transition-colors text-left">Protocols</button>
              </div>
              <div className="flex flex-col gap-6">
                <p className="text-white/40 mb-2 font-mono">_LEGAL</p>
                <a href="#" className="hover:text-cyan-glow transition-colors">Privacy</a>
                <a href="#" className="hover:text-cyan-glow transition-colors">Neural_TOS</a>
                <a href="#" className="hover:text-cyan-glow transition-colors">Ethics</a>
              </div>
              <div className="flex flex-col gap-6">
                <p className="text-white/40 mb-2 font-mono">_CONNECT</p>
                <a href="#" className="hover:text-cyan-glow transition-colors">X_Neural</a>
                <a href="#" className="hover:text-cyan-glow transition-colors">Discord</a>
                <a href="#" className="hover:text-cyan-glow transition-colors">GitHub</a>
              </div>
            </div>
          </div>
          
          <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] text-text-muted italic font-serif opacity-40">
              © 2026 GLIA NEURAL SYSTEMS • ALL SYNAPSES ENCRYPTED • QUANTUM_LOAD_STABLE
            </p>
            <div className="flex gap-10">
               <div className="flex items-center gap-2 group">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-glow group-hover:animate-ping" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Mainframe Online</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">v4.1.0-RC</span>
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BenchmarkCard({ label, val, desc, increase, decrease }: { label: string, val: string, desc: string, increase?: string, decrease?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, rotateX: 20, y: 50 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ 
        y: -15, 
        scale: 1.02,
        rotateX: -5,
        rotateY: 5,
        z: 50
      }}
      className="p-12 border border-white/10 bg-white/[0.01] hover:bg-white/[0.04] transition-all hover:border-cyan-glow/30 group preserve-3d"
    >
      <div className="text-[11px] font-black uppercase tracking-[1em] text-text-muted mb-10 group-hover:text-cyan-glow transition-colors" style={{ transform: 'translateZ(20px)' }}>{label}</div>
      <div className="flex items-baseline gap-6 mb-8" style={{ transform: 'translateZ(40px)' }}>
        <span className="text-8xl font-serif italic text-white tracking-tighter leading-none">{val}</span>
        {increase && <span className="text-sm font-black text-green-glow bg-green-glow/10 px-3 py-1 rounded-sm">{increase}</span>}
        {decrease && <span className="text-sm font-black text-cyan-glow bg-cyan-glow/10 px-3 py-1 rounded-sm">{decrease}</span>}
      </div>
      <p className="text-lg text-text-secondary font-serif italic leading-relaxed opacity-50 group-hover:opacity-100 transition-opacity" style={{ transform: 'translateZ(30px)' }}>{desc}</p>
    </motion.div>
  );
}

function PriceCard({ tier, price, desc, features, active = false, onClick }: { tier: string, price: string, desc: string, features: string[], active?: boolean, onClick: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, rotateY: active ? 0 : 15 }}
      whileInView={{ opacity: 1, scale: active ? 1.05 : 1, rotateY: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -20, rotateY: active ? 0 : -5, z: 20 }}
      className={`p-12 border transition-all flex flex-col relative group preserve-3d ${active ? 'bg-bg border-cyan-glow/50 shadow-[0_40px_100px_rgba(94,227,255,0.1)] z-10' : 'bg-white/[0.01] border-white/10 hover:border-white/30'}`}
    >
      {active && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-cyan-glow text-bg text-[10px] font-black uppercase tracking-[0.5em] px-8 py-2.5 shadow-2xl z-20" style={{ transform: 'translateZ(60px)' }}>
          OPTIMIZED PROTOCOL
        </div>
      )}
      
      <div className="mb-16" style={{ transform: 'translateZ(40px)' }}>
        <h4 className="text-3xl font-serif italic mb-3 text-white tracking-tight">{tier}</h4>
        <div className="flex items-baseline gap-3 mb-8">
          <span className="text-7xl font-serif italic text-white leading-none">${price}</span>
          <span className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-black opacity-60">/ cycle</span>
        </div>
        <p className="text-sm text-text-secondary italic leading-relaxed min-h-[4rem] opacity-70 group-hover:opacity-100 transition-opacity">{desc}</p>
      </div>

      <div className="space-y-5 mb-20 flex-1" style={{ transform: 'translateZ(20px)' }}>
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow/40" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted italic group-hover:text-text-primary transition-colors">{f}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={onClick}
        className={`w-full py-7 text-[11px] font-black uppercase tracking-[0.6em] transition-all ${active ? 'bg-cyan-glow text-bg shadow-xl hover:scale-105 active:scale-95' : 'border border-white/10 text-white hover:bg-white/5 hover:border-white/40'}`}
        style={{ transform: 'translateZ(40px)' }}
      >
        ACCESS
      </button>
    </motion.div>
  );
}

function FloatingElement({ index }: { index: number, key?: React.Key }) {
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const size = 1 + Math.random() * 3;
  const duration = 10 + Math.random() * 20;
  const delay = Math.random() * -20;

  return (
    <motion.div
      className="absolute bg-cyan-glow/20 rounded-full blur-[1px] pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
      }}
      animate={{
        y: [0, -100, 0],
        x: [0, 50, 0],
        opacity: [0, 0.5, 0],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "linear"
      }}
    />
  );
}

function SectionEntrance({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 10, y: 100 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
      viewport={{ once: true, margin: "-150px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`perspective-2000 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ThreeDCard({ icon, title, desc, delay = 0 }: { icon: React.ReactNode, title: string, desc: string, delay?: number }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setRotate({ x: rotateX, y: rotateY });
  };

  const onMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      className="p-12 bg-white/5 border border-white/10 rounded-sm hover:border-cyan-glow/30 transition-all preserve-3d"
    >
      <div className="text-cyan-glow mb-8" style={{ transform: 'translateZ(50px)' }}>{icon}</div>
      <h4 className="text-2xl font-serif italic text-white mb-3" style={{ transform: 'translateZ(40px)' }}>{title}</h4>
      <p className="text-[12px] uppercase tracking-widest text-text-muted font-bold leading-relaxed" style={{ transform: 'translateZ(30px)' }}>{desc}</p>
    </motion.div>
  );
}

