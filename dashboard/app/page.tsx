'use client';

import { AlertTriangle, Activity, ShieldAlert, CheckCircle, ServerCrash } from 'lucide-react';
import ChatWidget from '@/components/ChatWidget';
import LiveLogsViewer from '@/components/LiveLogsViewer';
import UptimeMonitor from '@/components/UptimeMonitor';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, last24h: 0 });
  const [loading, setLoading] = useState(true);
  const [monitoredSites, setMonitoredSites] = useState<string[]>(['prod.main-site.com', 'api.gateway.so', 'db01.cluster.internal']);

  useEffect(() => {
    // In a real app we'd use SWR or React Query, but we keep it simple for now
    const loadData = async () => {
      try {
        // Fetch via server actions (simulated by fetching the actual db functions if they were exported as APIs.
        // For local demo purposes we'll use a mocked initial state if the DB fails)
        const dummyStats = { total: 0, critical: 0, last24h: 0 };
        setStats(dummyStats);
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const healthScore = Math.max(0, 100 - (Number(stats.critical) * 5) - (Number(stats.total) * 1));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <main className="min-h-screen glow-mesh text-slate-100 selection:bg-indigo-500/30">
      <div className="p-4 md:p-8 max-w-7xl mx-auto relative z-10">
      
      {/* Premium Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-700/50 pb-6 mb-8 gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <ShieldAlert className="text-indigo-400" size={28} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Nexus SOC Module
            </h1>
          </div>
          <p className="text-slate-400 text-sm md:text-base ml-1">Autonomous monitoring platform with AI incident resolution.</p>
          <UptimeMonitor onTargetsUpdate={setMonitoredSites} />
        </div>
        <div className="text-left md:text-right glass-panel px-6 py-3 rounded-2xl">
          <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Fleet Health</div>
          <div className={`text-4xl font-black ${healthScore > 80 ? 'text-emerald-400' : healthScore > 50 ? 'text-amber-400' : 'text-rose-500'} drop-shadow-md flex items-baseline gap-1`}>
            {healthScore}<span className="text-lg text-slate-500 font-medium">/100</span>
          </div>
        </div>
      </motion.header>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="glass-panel p-6 rounded-2xl flex items-center gap-5 transition-all cursor-default">
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Activity size={28} />
          </div>
          <div>
            <div className="text-3xl font-black">{stats.total}</div>
            <div className="text-sm font-medium text-slate-400">Total Alerts Processed</div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="glass-panel p-6 rounded-2xl flex items-center gap-5 relative overflow-hidden transition-all cursor-default">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
          <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <AlertTriangle size={28} />
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-rose-400">{stats.critical}</div>
            <div className="text-sm font-medium text-slate-400">Critical Active Threats</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="glass-panel p-6 rounded-2xl flex items-center gap-5 transition-all cursor-default">
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <CheckCircle size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400">{stats.last24h}</div>
            <div className="text-sm font-medium text-slate-400">Anomalies (24 Hours)</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Multi-Website Live Logs Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-12"
      >
         <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-indigo-100">
            Per-Website Telemetry Streams
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {monitoredSites.map((site) => (
              <LiveLogsViewer 
                key={site}
                target={site.includes('.') ? site : undefined}
                siteName={site.replace(/https?:\/\//, '')}
                className="shadow-xl"
              />
            ))}
         </div>
      </motion.div>

      {/* Incident Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          Autonomous Incident Log
        </h2>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-indigo-500/50 before:via-slate-700 before:to-transparent">
          
          {loading ? (
            <div className="flex justify-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : incidents.length === 0 ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-16 px-6 glass-panel rounded-2xl mx-auto max-w-2xl relative z-10"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Systems Operational</h3>
              <p className="text-slate-400">No active incidents detected across the monitored fleet. The AI analyzer is standing by.</p>
              
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 font-medium">WAITING FOR WEBHOOK PAYLOAD ON PORT 3001</p>
                <div className="flex justify-center gap-1 mt-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                </div>
              </div>
            </motion.div>
          ) : (
            incidents.map((incident: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (idx * 0.1), type: 'spring' }}
                key={incident.id} 
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group z-10"
              >
                {/* Timeline Node */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#0b0f19] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-20 ${incident.severity === 'critical' ? 'bg-rose-500 shadow-rose-500/30' : 'bg-amber-500 shadow-amber-500/30'}`}>
                  {incident.severity === 'critical' ? <ServerCrash size={20} className="text-white" /> : <AlertTriangle size={20} className="text-white" />}
                </div>

                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] glass-panel p-6 rounded-2xl hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all cursor-default">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-white tracking-tight">{incident.alert_name}</h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2 py-1.5 rounded-lg border border-slate-700/50">
                      {new Date(incident.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-indigo-500/20 mb-5">
                    <Activity size={12} /> {incident.service}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">AI Summary Analysis</div>
                      <p className="text-sm text-slate-300 leading-relaxed">{incident.summary}</p>
                    </div>
                    
                    <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/30">
                      <div className="text-[10px] text-rose-400/80 uppercase tracking-widest font-bold mb-1.5">Determined Root Cause</div>
                      <p className="text-sm text-slate-200 leading-relaxed">{incident.root_cause}</p>
                    </div>
                    
                    <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/30">
                      <div className="text-[10px] text-emerald-400/80 uppercase tracking-widest font-bold mb-1.5">Recommended Remediation</div>
                      <p className="text-sm text-slate-200 leading-relaxed">{incident.suggested_fix}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      <ChatWidget activeIncident={incidents.length > 0 ? incidents[0] : undefined} />
      </div>
    </main>
  );
}
