import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Activity, Map as MapIcon, Radio, Zap, ShieldAlert, Crosshair, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Fictional Live Alerts Data
const ALERT_FEED = [
  { time: "09:42", type: "DISEASE", loc: "Punjab (Ludhiana)", msg: "Wheat Rust anomaly detected. Probability: 84%.", severity: "high" },
  { time: "09:41", type: "WEATHER", loc: "Maharashtra", msg: "Severe hail warning for Nashik district.", severity: "critical" },
  { time: "09:38", type: "MARKET", loc: "Gujarat", msg: "Cotton prices dropped 4% below MSP.", severity: "medium" },
  { time: "09:30", type: "SYSTEM", loc: "Global", msg: "Satellite telemetry sync complete.", severity: "low" },
  { time: "09:25", type: "PEST", loc: "Haryana", msg: "Locust swarm trajectory updated.", severity: "high" },
];

const WarRoom = () => {
  const [alerts, setAlerts] = useState(ALERT_FEED);

  // Simulate scrolling feed
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(prev => {
        const newAlerts = [...prev];
        const item = newAlerts.pop();
        if (item) newAlerts.unshift(item);
        return newAlerts;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-mono selection:bg-red-950">
      {/* Header */}
      <header className="h-16 border-b border-red-900/30 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md relative z-50">
        <div className="flex items-center gap-6">
          <Link to="/admin/intelligence-center" className="text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <h1 className="text-xl font-bold tracking-widest text-red-500 uppercase">Strategic Ops / War Room</h1>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-zinc-500">
          <span className="flex items-center gap-2"><Radio className="w-4 h-4 text-emerald-500" /> UPLINK ACTIVE</span>
          <span>LAT: 20.5937 N</span>
          <span>LON: 78.9629 E</span>
          <span className="font-bold text-white bg-red-900/30 px-3 py-1 rounded border border-red-900/50">DEFCON 4</span>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="h-[calc(100vh-4rem)] p-4 grid grid-cols-12 grid-rows-6 gap-4">
        
        {/* Left Panel: Alerts & Feeds */}
        <div className="col-span-3 row-span-6 flex flex-col gap-4">
          <div className="flex-1 bg-[#0a0a0a] border border-zinc-900 rounded-xl p-4 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-transparent opacity-50" />
            <h2 className="text-xs text-red-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Live Threat Intel
            </h2>
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence>
                {alerts.map((alert, i) => (
                  <motion.div
                    key={alert.time + alert.msg}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-3 p-3 rounded bg-black border-l-2 text-xs ${
                      alert.severity === 'critical' ? 'border-red-500 text-red-100' :
                      alert.severity === 'high' ? 'border-amber-500 text-amber-100' :
                      alert.severity === 'medium' ? 'border-yellow-500 text-yellow-100' :
                      'border-blue-500 text-blue-100'
                    }`}
                  >
                    <div className="flex justify-between text-[10px] opacity-70 mb-1">
                      <span>{alert.time} // {alert.type}</span>
                      <span>{alert.loc}</span>
                    </div>
                    <p>{alert.msg}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="h-1/3 bg-[#0a0a0a] border border-zinc-900 rounded-xl p-4 relative overflow-hidden">
             <h2 className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> System Telemetry
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Sat Comm Link</span><span className="text-emerald-500">99.8%</span></div>
                <div className="h-1 w-full bg-zinc-900 rounded overflow-hidden"><div className="h-full bg-emerald-500 w-[99.8%]" /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>AI Processing Load</span><span className="text-amber-500">74.2%</span></div>
                <div className="h-1 w-full bg-zinc-900 rounded overflow-hidden"><div className="h-full bg-amber-500 w-[74.2%]" /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Sensor Network Sync</span><span className="text-blue-500">88.5%</span></div>
                <div className="h-1 w-full bg-zinc-900 rounded overflow-hidden"><div className="h-full bg-blue-500 w-[88.5%]" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Map / Main Visualization */}
        <div className="col-span-6 row-span-6 bg-[#0a0a0a] border border-zinc-900 rounded-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e4/India_satellite_image.png')] bg-cover bg-center opacity-30 mix-blend-screen transition-opacity duration-1000 group-hover:opacity-50" />
          
          {/* Scanning line animation */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
            animate={{ y: ["0%", "800%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {/* Map Overlays */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20 pointer-events-none">
            {Array.from({length: 64}).map((_, i) => (
              <div key={i} className="border-[0.5px] border-zinc-800" />
            ))}
          </div>

          <div className="absolute top-4 left-4">
             <div className="bg-black/60 backdrop-blur border border-zinc-800 p-3 rounded-lg flex items-center gap-4">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase">Focus Area</div>
                  <div className="text-sm font-bold text-white flex items-center gap-2"><Crosshair className="w-3 h-3 text-red-500" /> ALL INDIA</div>
                </div>
                <div className="w-px h-8 bg-zinc-800" />
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase">Status</div>
                  <div className="text-sm font-bold text-emerald-500">NOMINAL</div>
                </div>
             </div>
          </div>

          {/* Fictional Targets */}
          <div className="absolute top-1/3 left-1/4">
             <div className="w-4 h-4 border border-red-500 rounded-full animate-ping absolute" />
             <div className="w-4 h-4 bg-red-500/20 border border-red-500 rounded-full relative z-10 flex items-center justify-center">
                <div className="w-1 h-1 bg-red-500 rounded-full" />
             </div>
             <div className="absolute top-6 left-6 bg-red-900/80 border border-red-500/50 text-[10px] p-1 rounded text-red-100 whitespace-nowrap">
               ANOMALY 01 - PUNJAB
             </div>
          </div>

        </div>

        {/* Right Panel: Stats & Details */}
        <div className="col-span-3 row-span-6 flex flex-col gap-4">
          <div className="h-2/5 bg-[#0a0a0a] border border-zinc-900 rounded-xl p-4">
            <h2 className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> District Risk Scores
            </h2>
            <div className="space-y-3">
              {[
                { name: "Nashik, MH", score: 88, trend: "up", color: "text-red-500" },
                { name: "Ludhiana, PB", score: 72, trend: "up", color: "text-amber-500" },
                { name: "Guntur, AP", score: 45, trend: "down", color: "text-yellow-500" },
                { name: "Karnal, HR", score: 21, trend: "down", color: "text-emerald-500" },
              ].map(d => (
                <div key={d.name} className="flex items-center justify-between bg-black p-2 rounded border border-zinc-900">
                  <span className="text-xs">{d.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${d.color}`}>{d.score}</span>
                    <div className="w-8 h-4 bg-zinc-900 rounded flex items-center justify-center text-[8px]">
                      {d.trend === "up" ? "▲" : "▼"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-[#0a0a0a] border border-zinc-900 rounded-xl p-4 flex flex-col">
             <h2 className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-4">
              Scheme Utilization
            </h2>
            <div className="flex-1 flex items-end gap-2 pb-4 border-b border-zinc-900">
              {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 bg-zinc-800 rounded-t relative group">
                  <div 
                    className="absolute bottom-0 w-full bg-blue-500/50 rounded-t transition-all duration-1000 group-hover:bg-blue-400" 
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">4.2M</div>
                <div className="text-[10px] text-zinc-500">PM-KISAN SYNC</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">890k</div>
                <div className="text-[10px] text-zinc-500">FASAL BIMA</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WarRoom;
