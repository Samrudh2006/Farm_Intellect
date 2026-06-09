import React from "react";
import { motion } from "framer-motion";
import { Shield, CloudLightning, Activity, Landmark, Users, TrendingUp, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import CountUp from "react-countup";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const stats = [
  { label: "Crop Health Score", value: 87, suffix: "%", icon: Activity, color: "text-emerald-400" },
  { label: "Disease Alerts", value: 432, icon: Shield, color: "text-rose-400" },
  { label: "Weather Warnings", value: 127, icon: CloudLightning, color: "text-amber-400" },
  { label: "Schemes Matched", value: 2341, icon: Landmark, color: "text-blue-400" },
  { label: "Farmers Protected", value: 18541, icon: Users, color: "text-indigo-400" },
  { label: "Est. Crop Saved", value: 4.2, prefix: "₹", suffix: " Cr", icon: TrendingUp, color: "text-green-400", decimals: 1 },
];

const CommandCenter = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden relative selection:bg-primary/30">
      {/* Cinematic Background Map / Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(22,163,74,0.15),transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e4/India_satellite_image.png')] opacity-10 bg-contain bg-center bg-no-repeat blur-[2px]" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-24 pb-12 h-screen flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-emerald-400 mb-6 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            LIVE: BHARAT NETWORK
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-2xl">
            🇮🇳 INDIA AGRICULTURAL STATUS
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light">
            Real-time telemetry and intelligence from the Farm Intellect Network.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full"
        >
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-xl hover:bg-white/10 transition-colors duration-500"
            >
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                <stat.icon className={`w-24 h-24 ${stat.color} filter blur-xl`} />
              </div>
              
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                
                <p className="text-zinc-400 font-medium mb-2 uppercase tracking-wider text-sm">
                  {stat.label}
                </p>
                
                <div className="flex items-baseline gap-1">
                  <h3 className="text-5xl lg:text-6xl font-bold tracking-tighter text-white">
                    {stat.prefix}
                    <CountUp end={stat.value} duration={2.5} decimals={stat.decimals || 0} separator="," />
                  </h3>
                  <span className="text-2xl text-zinc-500 font-light">{stat.suffix}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation to other War Room pages */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-16 flex justify-center gap-4"
        >
          <Link to="/admin/intelligence-center/mission-2030" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all backdrop-blur-md flex items-center gap-2 text-sm">
            Launch Mission 2030 <ChevronRight className="w-4 h-4" />
          </Link>
          <Link to="/admin/intelligence-center/war-room" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all backdrop-blur-md flex items-center gap-2 text-sm">
            Enter War Room <ChevronRight className="w-4 h-4" />
          </Link>
          <Link to="/admin/intelligence-center/future-headlines" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all backdrop-blur-md flex items-center gap-2 text-sm">
            View Future Impact <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default CommandCenter;
