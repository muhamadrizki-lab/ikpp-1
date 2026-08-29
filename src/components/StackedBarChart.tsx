import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface StackedSegment {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface StackedBarChartProps {
  segments: StackedSegment[];
  total: number;
}

export default function StackedBarChart({ segments, total }: StackedBarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Map tailwind bg classes to inline linear-gradients for premium aesthetics
  const getGradientFromClass = (bgClass: string) => {
    if (bgClass.includes("sky-500")) return "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)";
    if (bgClass.includes("blue-600")) return "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)";
    if (bgClass.includes("emerald-500")) return "linear-gradient(135deg, #10b981 0%, #059669 100%)";
    return undefined;
  };

  return (
    <div className="w-full py-2">
      {/* Percentage Display */}
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">
        <span>Allocation breakdown</span>
        <span className="font-mono text-gray-400 bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded-md">Total: {total} Units</span>
      </div>

      {/* Stacked Horizontal Progress Bar */}
      <div className="w-full h-7 bg-gray-50 rounded-xl overflow-hidden flex shadow-inner relative border border-gray-200/50 p-[2px]">
        {segments.map((segment, idx) => {
          if (segment.count === 0) return null;
          const isHovered = hoveredIdx === idx;
          const isAnyHovered = hoveredIdx !== null;
          const gradient = getGradientFromClass(segment.color);

          return (
            <motion.div
              key={idx}
              initial={{ width: 0 }}
              animate={{ width: `${segment.percentage}%` }}
              transition={{ duration: 1.2, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="h-full cursor-pointer flex items-center justify-center text-white text-[10px] font-black relative border-r last:border-r-0 border-white/20 transition-all duration-300 first:rounded-l-lg last:rounded-r-lg"
              style={{
                background: gradient || undefined,
                backgroundColor: !gradient ? segment.color : undefined,
                opacity: isAnyHovered ? (isHovered ? 1 : 0.5) : 0.95,
                transform: isHovered ? "scaleY(1.06)" : "none",
                zIndex: isHovered ? 20 : 10,
              }}
            >
              {/* Scan laser effect inside each segment */}
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 3,
                  delay: idx * 0.4,
                  ease: "linear"
                }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none"
              />

              {segment.percentage >= 10 && (
                <span className="truncate px-1.5 drop-shadow-sm relative z-10 font-bold">
                  {segment.percentage}%
                </span>
              )}

              {/* Float Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: -48, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 bg-gray-900/95 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-xl border border-gray-800 pointer-events-none flex items-center gap-2 whitespace-nowrap"
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ 
                        background: gradient || undefined,
                        backgroundColor: !gradient ? segment.color : undefined,
                        boxShadow: `0 0 6px ${gradient ? "#fff" : "transparent"}`
                      }}
                    ></span>
                    <span className="capitalize text-gray-300">{segment.label}:</span>
                    <span className="text-cyan-300 font-black font-mono">{segment.count} Orders ({segment.percentage}%)</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Legend Block */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
        {segments.map((segment, idx) => {
          const isHovered = hoveredIdx === idx;
          const isAnyHovered = hoveredIdx !== null;
          const gradient = getGradientFromClass(segment.color);

          return (
            <div 
              key={idx} 
              className="flex items-center gap-2 cursor-pointer transition-all duration-300"
              style={{
                opacity: isAnyHovered ? (isHovered ? 1 : 0.5) : 1,
                transform: isHovered ? "translateX(2px)" : "none"
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span 
                className="w-3 h-3 rounded-md border border-white/10 shadow-xs block transition-transform duration-300"
                style={{
                  background: gradient || undefined,
                  backgroundColor: !gradient ? segment.color : undefined,
                  transform: isHovered ? "scale(1.15)" : "none"
                }}
              ></span>
              <span className="text-[10px] font-black text-gray-700 capitalize tracking-tight">{segment.label}</span>
              <span className="text-[10px] text-gray-400 font-extrabold font-mono">
                ({segment.count} units)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
