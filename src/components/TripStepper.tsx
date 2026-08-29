import React from "react";
import { motion } from "motion/react";
import { CircleDot, Truck, ShieldCheck } from "lucide-react";

interface TripStepperProps {
  preTripCount: number;
  onTripCount: number;
  endTripCount: number;
  activeStage?: "pre_trip" | "on_trip" | "end_trip";
  hideCard?: boolean;
  onStepClick?: (stage: "pre_trip" | "on_trip" | "end_trip") => void;
}

export default function TripStepper({
  preTripCount,
  onTripCount,
  endTripCount,
  activeStage,
  hideCard = false,
  onStepClick
}: TripStepperProps) {
  const total = preTripCount + onTripCount + endTripCount || 1;

  const steps = [
    {
      id: "pre_trip",
      label: "PRE-TRIP",
      count: preTripCount,
      percentage: Math.round((preTripCount / total) * 100),
      color: "from-sky-500 to-sky-600",
      textColor: "text-sky-600",
      icon: CircleDot,
      bgColor: "bg-sky-50"
    },
    {
      id: "on_trip",
      label: "ON TRIP",
      count: onTripCount,
      percentage: Math.round((onTripCount / total) * 100),
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      icon: Truck,
      bgColor: "bg-blue-50"
    },
    {
      id: "end_trip",
      label: "END TRIP",
      count: endTripCount,
      percentage: Math.round((endTripCount / total) * 100),
      color: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
      icon: ShieldCheck,
      bgColor: "bg-emerald-50"
    }
  ];

  return (
    <div className={hideCard ? "w-full" : "w-full bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm"}>
      {!hideCard && (
        <div className="flex justify-between items-center text-xs font-bold text-gray-500 mb-6">
          <span className="uppercase tracking-wider">Shipment Pipeline Status</span>
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">
            Total: {total} Trips
          </span>
        </div>
      )}

      <div className={`relative flex items-center justify-between ${hideCard ? "px-2 py-2" : "px-6 py-4"}`}>
        {/* Connection Progress Bar Line Background */}
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-2 bg-gray-100 rounded-full z-0"></div>

        {/* Highlighted active tracker bar with pulsing flow */}
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 rounded-full z-0 overflow-hidden">
          {/* Animated liquid light flowing through the pipeline */}
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "linear",
            }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
          />
        </div>

        {/* Continuous Flowing Miniature Vehicle (Active Transit Indicator) */}
        <div className="absolute left-14 right-14 top-1/2 -translate-y-1/2 h-0 z-10 pointer-events-none">
          {/* Main Truck moving from Pre-Trip to End Trip */}
          <motion.div
            initial={{ left: "0%" }}
            animate={{ left: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 12,
              ease: "linear",
            }}
            className="absolute -translate-y-1/2 -translate-x-1/2 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-md border border-blue-200"
          >
            <Truck className="w-3 h-3 text-blue-600 animate-bounce" />
            <span className="text-[7px] font-black uppercase tracking-widest text-blue-700">on transit</span>
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-ping shrink-0" />
          </motion.div>

          {/* Secondary smaller flowing shipment particles following the pipeline path */}
          <motion.div
            initial={{ left: "0%", opacity: 0 }}
            animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{
              repeat: Infinity,
              duration: 12,
              delay: 4,
              ease: "linear",
            }}
            className="absolute -translate-y-1/2 -translate-x-1/2 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-full shadow border border-sky-100"
          >
            <div className="w-1 h-1 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-[6px] font-bold uppercase tracking-wider text-sky-600">loading</span>
          </motion.div>

          <motion.div
            initial={{ left: "0%", opacity: 0 }}
            animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{
              repeat: Infinity,
              duration: 12,
              delay: 8,
              ease: "linear",
            }}
            className="absolute -translate-y-1/2 -translate-x-1/2 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-full shadow border border-emerald-100"
          >
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[6px] font-bold uppercase tracking-wider text-emerald-600">delivered</span>
          </motion.div>
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isSelected = activeStage === step.id;

          return (
            <div
              key={step.id}
              onClick={() => onStepClick?.(step.id as any)}
              className="flex flex-col items-center z-10 relative cursor-pointer group transition-transform hover:scale-105"
            >
              {/* Count bubble above */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: isSelected ? 1.05 : 1 }}
                className={`mb-3 flex flex-col items-center justify-center w-12 h-12 rounded-full border shadow-sm transition-all duration-300 ${
                  isSelected
                    ? "bg-[#0B2C6B] text-white border-amber-300 ring-4 ring-blue-100 scale-105"
                    : "bg-white text-gray-700 border-gray-200 group-hover:border-blue-400 group-hover:shadow-md"
                }`}
              >
                <span className="text-sm font-black tabular-nums leading-none">
                  {step.count}
                </span>
                <span className="text-[8px] font-bold opacity-75 mt-0.5 leading-none">
                  {step.percentage}%
                </span>
              </motion.div>

              {/* Progress Bullet Node */}
              <div className={`p-2 rounded-full shadow-inner ${step.bgColor} border border-white group-hover:ring-2 group-hover:ring-blue-300 transition-all`}>
                <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${step.color} text-white flex items-center justify-center shadow-md`}>
                  <StepIcon className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Step Label below */}
              <div className="mt-2 text-center">
                <span className={`text-[10px] font-black tracking-widest ${step.textColor} uppercase block group-hover:underline`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
