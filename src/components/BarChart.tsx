import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface BarChartData {
  name: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarChartData[];
  totalValue: number;
  unit?: string;
}

export default function BarChart({ data, totalValue, unit = "Units" }: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Find maximum value to scale the bars proportionally
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  // Helper to map single solid hex colors to high-end CSS gradients
  const getGradient = (hex: string) => {
    const color = hex.toLowerCase();
    if (color.includes("3b82f6") || color.includes("blue")) {
      return "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)";
    }
    if (color.includes("10b981") || color.includes("emerald")) {
      return "linear-gradient(135deg, #047857 0%, #10b981 100%)";
    }
    if (color.includes("0ea5e9") || color.includes("sky")) {
      return "linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)";
    }
    if (color.includes("f43f5e") || color.includes("rose")) {
      return "linear-gradient(135deg, #be123c 0%, #f43f5e 100%)";
    }
    if (color.includes("f59e0b") || color.includes("amber")) {
      return "linear-gradient(135deg, #b45309 0%, #f59e0b 100%)";
    }
    return `linear-gradient(135deg, ${hex} 0%, ${hex}dd 100%)`;
  };

  return (
    <div className="w-full space-y-2 py-1">
      {/* Dynamic Gridlines in background */}
      <div className="relative">
        <div className="absolute inset-y-0 left-[114px] right-[108px] flex justify-between pointer-events-none">
          <div className="border-l border-dashed border-gray-100 h-full"></div>
          <div className="border-l border-dashed border-gray-100 h-full"></div>
          <div className="border-l border-dashed border-gray-100 h-full"></div>
          <div className="border-l border-dashed border-gray-100 h-full"></div>
        </div>

        {/* Bar rows */}
        <div className="space-y-3 relative z-10">
          {data.map((item, idx) => {
            const percentage = Math.round((item.value / totalValue) * 100);
            const scaleWidth = (item.value / maxValue) * 100;
            const isHovered = hoveredIdx === idx;
            const isAnyHovered = hoveredIdx !== null;

            return (
              <div 
                key={idx} 
                className="flex items-center gap-3 group transition-all duration-300"
                style={{
                  opacity: isAnyHovered ? (isHovered ? 1 : 0.45) : 1,
                  transform: isHovered ? "scale(1.01) translateX(2px)" : "none"
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Y-Axis Label */}
                <div className="w-20 text-right shrink-0">
                  <span className="text-[11px] font-black text-gray-900 block leading-tight tracking-tight uppercase">{item.name}</span>
                  <span className="text-[10px] text-gray-600 font-black block leading-none mt-1">{percentage}%</span>
                </div>

                {/* Color Dot Indicator with pulsing glow on hover */}
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300" 
                  style={{ 
                    backgroundColor: item.color,
                    boxShadow: isHovered ? `0 0 8px ${item.color}` : "none",
                    transform: isHovered ? "scale(1.15)" : "none"
                  }}
                ></span>

                 {/* Bar Container - Reduced height to h-4 (16px) for an elegant, compact pill-like appearance */}
                <div 
                  className="flex-1 bg-gray-50/70 h-4 rounded-full overflow-hidden relative border border-gray-200/50 flex items-center shadow-xs transition-all duration-300"
                  style={{
                    boxShadow: isHovered ? `0 2px 8px ${item.color}15` : "none"
                  }}
                >
                  {/* The animated filled bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scaleWidth}%` }}
                    transition={{ duration: 1.0, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 top-0 bottom-0 rounded-full"
                    style={{ 
                      background: getGradient(item.color)
                    }}
                  >
                    {/* Shimmer scan sweep */}
                    <motion.div
                      initial={{ left: "-100%" }}
                      animate={{ left: "100%" }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 2.5,
                        delay: idx * 0.3,
                        ease: "linear"
                      }}
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 pointer-events-none"
                    />
                  </motion.div>

                  {/* High contrast micro 3D overlay inside the bar */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/12 to-transparent pointer-events-none mix-blend-overlay"></div>
                </div>

                {/* Value Badge placed OUTSIDE the bar on the right with larger, high-visibility, high-contrast numbers */}
                <div className="w-24 shrink-0 text-left">
                  <div className="inline-flex items-center gap-1.5 bg-white border border-gray-300 px-2.5 py-1 rounded-lg text-xs font-black text-gray-900 font-mono shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-gray-400 group-hover:bg-gray-50">
                    <span className="text-sm font-black text-gray-950 leading-none">{item.value}</span>
                    <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-wider leading-none">{unit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X-Axis Scale Indicator at the bottom - Perfect alignment corresponding exactly with bar start and end */}
      <div className="flex justify-between items-center text-[8px] text-gray-400 font-black uppercase tracking-wider pl-[114px] pr-[108px] leading-none pt-1">
        <span>0</span>
        <span>{Math.round(maxValue / 2)}</span>
        <span>{maxValue} {unit}</span>
      </div>
    </div>
  );
}
