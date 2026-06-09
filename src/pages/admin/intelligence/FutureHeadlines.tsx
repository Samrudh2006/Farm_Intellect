import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, Newspaper, Globe, TrendingUp, Sparkles } from "lucide-react";

const HEADLINES = [
  {
    year: 2028,
    title: "India's Agricultural Intelligence Network Goes Nationwide",
    outlet: "The Economic Times",
    snippet: "Following a successful pilot in 4 states, the Farm Intellect platform has now been deployed across all 28 Indian states, fundamentally changing how agricultural data is processed and distributed.",
    icon: Globe,
    color: "from-blue-500/20 to-blue-900/5",
    border: "border-blue-500/30"
  },
  {
    year: 2030,
    title: "AI Agriculture Platform Reaches 50 Million Farmers",
    outlet: "TechCrunch Future",
    snippet: "The unicorn agritech startup has crossed a massive milestone. Over 50 million farmers now rely on AI-driven crop scanning and localized weather telemetry to protect their daily harvests.",
    icon: UsersIcon,
    color: "from-emerald-500/20 to-emerald-900/5",
    border: "border-emerald-500/30"
  },
  {
    year: 2032,
    title: "Digital Farming Revolution Improves Rural Incomes by 40%",
    outlet: "World Economic Forum",
    snippet: "A decade of data-driven farming has yielded results. By eliminating middle-man inefficiencies and preventing disease outbreaks, rural Indian farmers are experiencing unprecedented economic growth.",
    icon: TrendingUp,
    color: "from-amber-500/20 to-amber-900/5",
    border: "border-amber-500/30"
  },
  {
    year: 2035,
    title: "Farm Intellect Helps Eradicate Preventable Crop Loss Across India",
    outlet: "Global Agriculture Review",
    snippet: "For the first time in history, predictive AI models have successfully forecasted and prevented 98% of preventable crop diseases before they could spread across district borders.",
    icon: Sparkles,
    color: "from-purple-500/20 to-purple-900/5",
    border: "border-purple-500/30"
  }
];

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}


const FutureHeadlines = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden relative font-sans selection:bg-primary/30">
      
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
         <div className="w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <div className="absolute top-0 left-0 p-8 z-50">
        <Link to="/admin/intelligence-center" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Hub
        </Link>
      </div>

      <div className="relative z-10 container mx-auto px-6 h-screen flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
        
        {/* Timeline Navigation */}
        <div className="flex flex-row md:flex-col gap-6 md:gap-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 md:w-0.5 md:h-full md:top-0 md:left-1/2 -translate-y-1/2 md:-translate-x-1/2 bg-white/10 -z-10" />
          
          {HEADLINES.map((headline, idx) => (
            <button
              key={headline.year}
              onClick={() => setActiveIdx(idx)}
              className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500 ${
                activeIdx === idx 
                  ? "bg-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)]" 
                  : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 border border-white/5"
              }`}
            >
              <span className="font-bold font-serif">{headline.year}</span>
            </button>
          ))}
        </div>

        {/* Article Display */}
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className={`p-8 md:p-12 rounded-3xl border bg-gradient-to-b ${HEADLINES[activeIdx].color} ${HEADLINES[activeIdx].border} backdrop-blur-xl relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 {React.createElement(HEADLINES[activeIdx].icon, { className: "w-48 h-48" })}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 text-sm text-zinc-400 uppercase tracking-widest font-semibold mb-6">
                  <Newspaper className="w-4 h-4" />
                  {HEADLINES[activeIdx].outlet} • {HEADLINES[activeIdx].year}
                </div>
                
                <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-6">
                  "{HEADLINES[activeIdx].title}"
                </h2>
                
                <p className="text-lg md:text-xl text-zinc-300 font-light leading-relaxed">
                  {HEADLINES[activeIdx].snippet}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default FutureHeadlines;
