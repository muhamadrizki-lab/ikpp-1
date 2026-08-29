import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  totalLabel?: string;
  totalValue: number;
}

export default function DonutChart({ data, totalLabel = "Total", totalValue }: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Helper to get gradients for different chart entries
  const getGradientId = (index: number) => `donut-grad-${index}`;

  const getLighterColor = (hex: string) => {
    // Basic tint function for hex values
    const color = hex.toLowerCase();
    if (color.includes("3b82f6")) return "#60a5fa";
    if (color.includes("10b981")) return "#34d399";
    if (color.includes("0ea5e9")) return "#38bdf8";
    if (color.includes("f43f5e")) return "#fb7185";
    if (color.includes("f59e0b")) return "#fbbf24";
    return `${hex}aa`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-52 relative w-full">
      {/* Absolute overlay for perfect centering of Total Count with spring-like scale */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-10px]">
        <span className="text-3xl font-black text-gray-800 tracking-tighter tabular-nums leading-none transition-transform duration-300 transform scale-100">
          {totalValue}
        </span>
        <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-1.5">
          {totalLabel}
        </span>
      </div>

      {/* Pie Chart */}
      <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {data.map((item, index) => (
                <linearGradient key={index} id={getGradientId(index)} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={item.color} />
                  <stop offset="100%" stopColor={getLighterColor(item.color)} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={68}
              paddingAngle={4}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#${getGradientId(index)})`} 
                  stroke="#fff" 
                  strokeWidth={2}
                  style={{
                    transform: activeIndex === index ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: '50% 50%',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    filter: activeIndex === index ? 'drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.08))' : 'none'
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as DonutChartData;
                  return (
                    <div className="bg-gray-900/95 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-xl border border-gray-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-gray-300">{item.name}:</span>
                      <span className="font-mono text-amber-300 font-bold">{item.value} Units</span>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-3 gap-4 mt-1.5 w-full max-w-[240px]">
        {data.map((item, idx) => {
          const isHovered = activeIndex === idx;
          const isAnyHovered = activeIndex !== null;

          return (
            <div 
              key={idx} 
              className="flex flex-col items-center text-center cursor-pointer transition-all duration-300"
              style={{
                opacity: isAnyHovered ? (isHovered ? 1 : 0.5) : 1,
                transform: isHovered ? "scale(1.05)" : "none"
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-[10px] font-black text-gray-500 capitalize tracking-tight">{item.name}</span>
              </div>
              <span className="text-xs font-black text-gray-700 mt-0.5 tabular-nums">
                {item.value} <span className="text-[9px] text-gray-400 font-bold">({Math.round((item.value / totalValue) * 100)}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
