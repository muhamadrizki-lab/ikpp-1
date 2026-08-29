import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string | React.ReactNode;
  descriptionColor?: string;
  valueOnTop?: boolean;
  statusType?: "success" | "warning" | "info" | "neutral" | "danger";
  breakdown?: {
    label: string;
    value: string | number;
    color: string;
  }[];
  onClick?: () => void;
  id?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  descriptionColor,
  valueOnTop = false,
  statusType = "neutral",
  breakdown,
  onClick,
  id
}: StatCardProps) {
  // Border & Glow Accents based on statusType
  const borderClasses = {
    success: "border-l-4 border-l-emerald-500 border-gray-200 dark:border-slate-800 focus:ring-emerald-400",
    warning: "border-l-4 border-l-sky-500 border-gray-200 dark:border-slate-800 focus:ring-sky-400",
    info: "border-l-4 border-l-blue-600 border-gray-200 dark:border-slate-800 focus:ring-blue-400",
    danger: "border-l-4 border-l-rose-500 border-gray-200 dark:border-slate-800 focus:ring-rose-400",
    neutral: "border-l-4 border-l-[#0B2C6B] border-gray-200 dark:border-slate-800 focus:ring-blue-900"
  }[statusType];

  const valueColor = {
    success: "text-emerald-700 dark:text-emerald-400",
    warning: "text-sky-700 dark:text-sky-400",
    info: "text-blue-700 dark:text-blue-400",
    danger: "text-rose-700 dark:text-rose-400",
    neutral: "text-gray-900 dark:text-slate-100"
  }[statusType];

  return (
    <motion.div
      id={id}
      whileHover={onClick ? { scale: 1.015, y: -2 } : {}}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-xl border p-3.5 sm:p-4 shadow-sm flex flex-col justify-between min-h-[125px] h-full relative transition-colors duration-200 ${borderClasses} ${
        onClick ? "cursor-pointer hover:shadow-md transition-all group hover:border-blue-200 dark:hover:border-slate-700" : ""
      }`}
    >
      {/* Card Header */}
      <div>
        {valueOnTop ? (
          <div>
            <h3 className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight ${valueColor}`}>
              {value}
            </h3>
            <span className="text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-tight text-gray-500 dark:text-slate-400 mt-1 block">
              {title}
            </span>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-1.5 h-[34px]">
              <span className="text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-tight text-gray-500 dark:text-slate-400 leading-tight block line-clamp-2">
                {title}
              </span>
              {Icon && (
                <div className={`p-1 rounded shrink-0 ${
                  onClick ? "bg-blue-50 dark:bg-slate-800 text-[#0B2C6B] dark:text-sky-400 group-hover:bg-[#0B2C6B] group-hover:text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-400"
                } transition-colors`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <h3 className={`text-2xl sm:text-3xl font-black tabular-nums my-1 tracking-tight leading-none ${valueColor}`}>
              {value}
            </h3>
          </div>
        )}
      </div>

      {/* Breakdown or Description */}
      <div className="pt-1.5 mt-auto border-t border-gray-100 dark:border-slate-800/80">
        {breakdown ? (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {breakdown.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-[9px] text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                  {item.label}
                </span>
                <span className={`text-xs font-extrabold mt-0.5 ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          description && (
            <div className="min-h-[22px] flex items-center">
              {typeof description === "string" ? (
                <p className={`text-[9.5px] font-bold tracking-tight leading-tight flex items-center gap-1 truncate ${
                  descriptionColor ? descriptionColor : "text-gray-500 dark:text-slate-400"
                }`}>
                  {statusType === "success" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>}
                  {statusType === "warning" && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block shrink-0"></span>}
                  {statusType === "info" && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shrink-0"></span>}
                  <span className="truncate">{description}</span>
                </p>
              ) : (
                <div className={`text-[9.5px] font-bold tracking-tight leading-tight w-full ${
                  descriptionColor ? descriptionColor : "text-gray-500 dark:text-slate-400"
                }`}>
                  {description}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Dynamic Link Badge if Clickable */}
      {onClick && (
        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider border border-blue-100 dark:border-slate-700">
            View Details →
          </span>
        </div>
      )}
    </motion.div>
  );
}
