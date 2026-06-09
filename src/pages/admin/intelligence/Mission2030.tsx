import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { ChevronLeft } from "lucide-react";

const Mission2030 = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative font-sans">
      {/* Background Map & Overlays */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] md:w-[100vw] md:h-[100vw] opacity-20 z-0">
          <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e4/India_satellite_image.png')] bg-contain bg-center bg-no-repeat blur-[1px]" />
        </div>
        {/* Glowing Agricultural Zones */}
        <div className="absolute top-[40%] left-[30%] w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[60%] left-[60%] w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[20%] left-[50%] w-72 h-72 bg-blue-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      {/* Navigation */}
      <div className="absolute top-0 left-0 p-8 z-50">
        <Link to="/admin/intelligence-center" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Hub
        </Link>
      </div>

      <div className="relative z-20 container mx-auto px-6 h-screen flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="mb-24"
        >
          <h1 className="text-[12vw] md:text-[8vw] font-black tracking-tighter leading-none mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Mission 2030
          </h1>
          <h2 className="text-2xl md:text-5xl font-light tracking-wide text-zinc-300">
            Digitize Every Farmer. <span className="text-emerald-400 font-medium">Protect Every Harvest.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 max-w-5xl mx-auto w-full">
          {[
            { end: 140, suffix: "M+", label: "Farmers" },
            { end: 28, suffix: "", label: "States Covered" },
            { end: 22, suffix: "", label: "Languages" },
            { end: 1, suffix: "", label: "Intelligence Platform" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
              className="flex flex-col items-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md"
            >
              <div className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tighter flex items-center">
                <CountUp end={stat.end} duration={3} delay={0.5} />
                <span>{stat.suffix}</span>
              </div>
              <div className="text-sm md:text-base text-zinc-400 uppercase tracking-widest font-semibold">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Mission2030;
