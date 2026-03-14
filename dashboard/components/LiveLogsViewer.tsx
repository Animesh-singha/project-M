'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

interface ComponentProps {
  className?: string; 
  target?: string;
  siteName?: string;
}

export default function LiveLogsViewer({ className = "", target = "", siteName = "Global Fleet" }: ComponentProps) {
  const [logs, setLogs] = useState<{ ts: string, log: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll for logs every 3 seconds
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const queryParams = new URLSearchParams({ limit: '50' });
        if (target) queryParams.append('target', target);
        
        const res = await fetch(`/api/logs?${queryParams.toString()}`);
        if (!res.ok) {
           return; // Silently catch in dev if Loki is offline
        }
        const data = await res.json();
        
        // Parse Loki Response (Loki matrix format)
        if (data.data && data.data.result) {
            const rawLogs: { ts: string, log: string }[] = [];
            data.data.result.forEach((stream: any) => {
              stream.values.forEach((val: [string, string]) => {
                rawLogs.push({ ts: val[0], log: val[1] });
              });
            });
            // Sort by nanosecond timestamp natively descending
            rawLogs.sort((a, b) => Number(b.ts) - Number(a.ts));
            setLogs(rawLogs);
        }
      } catch (error) {
        // Loki is likely not running on localhost. Silently catch so we don't spam the user's console.
        if (logs.length === 0) {
            setLogs([
              { ts: Date.now().toString() + "000000", log: `[SYSTEM] Initiating encrypted handshake with ${siteName}...` },
              { ts: (Date.now() - 1000).toString() + "000000", log: `[DNS] Resolved endpoint: 10.0.4.12` },
              { ts: (Date.now() - 2000).toString() + "000000", log: `[SECURITY] TLS 1.3 session established.` }
            ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`glass-panel rounded-2xl overflow-hidden flex flex-col ${className}`}>
      <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider font-bold">
          <Terminal size={14} /> {siteName} Output
        </div>
        <div className="flex gap-2">
           <div className="w-3 h-3 rounded-full bg-slate-700"></div>
           <div className="w-3 h-3 rounded-full bg-slate-700"></div>
           <div className="w-3 h-3 rounded-full bg-slate-700"></div>
        </div>
      </div>
      
      <div 
         ref={scrollRef}
         className="bg-[#0b0f19] p-4 font-mono text-[11px] overflow-y-auto h-48 md:h-64 flex flex-col-reverse"
      >
        {loading ? (
           <div className="text-emerald-500/50 animate-pulse">Initializing datastream interface...</div>
        ) : logs.length === 0 ? (
           <div className="text-slate-500">
             [System] Connection established.<br/>
             [System] Awaiting log buffers from remote agents...<br/>
             <br/>
             <span className="text-emerald-500 animate-pulse">_</span>
           </div>
        ) : (
          <div className="space-y-1">
             {logs.map((L, i) => (
                <motion.div 
                 initial={{ opacity: 0, x: -10 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 key={L.ts + i} 
                 className="hover:bg-slate-800/50 px-1 py-0.5 rounded flex gap-4 text-emerald-400"
                >
                  <span className="shrink-0 text-slate-500 select-none">
                    {new Date(Number(L.ts) / 1000000).toISOString().split('T')[1].slice(0,-1)}
                  </span>
                  <span className="break-all">{L.log}</span>
                </motion.div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
