import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";

export interface DateFilterState {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  preset: string;    // "auto" | "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "lastMonth" | "thisYear" | "custom"
}

interface DateRangeFilterProps {
  value: DateFilterState;
  onChange: (newValue: DateFilterState) => void;
  availableMonths?: string[];
  align?: "left" | "right";
  dateType?: "booking" | "stuffing";
  onDateTypeChange?: (type: "booking" | "stuffing") => void;
  label?: string;
}

// Robust helper to parse booking date strings from backend/sheets
export function parseBookingDate(str?: string): Date | null {
  if (!str || str === "#N/A" || str === "N/A" || str.trim() === "") return null;
  const clean = str.split(" ")[0].trim();
  
  // DD/MM/YYYY or DD-MM-YYYY
  const dmY = clean.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmY) {
    const day = parseInt(dmY[1], 10);
    const month = parseInt(dmY[2], 10) - 1;
    const year = parseInt(dmY[3], 10);
    return new Date(year, month, day);
  }
  
  // YYYY-MM-DD
  const yMd = clean.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (yMd) {
    const year = parseInt(yMd[1], 10);
    const month = parseInt(yMd[2], 10) - 1;
    const day = parseInt(yMd[3], 10);
    return new Date(year, month, day);
  }

  const parsed = new Date(clean);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Global filter helper function used across all pages
export function filterByDate(bookingDateStr: string | undefined, filter: DateFilterState): boolean {
  if (!filter || filter.preset === "auto" || (!filter.startDate && !filter.endDate)) {
    return true; // No date filter applied
  }

  const dt = parseBookingDate(bookingDateStr);
  if (!dt) return false;

  // Normalize dt to start of day for comparison
  const targetTime = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();

  if (filter.startDate) {
    const startDt = parseBookingDate(filter.startDate);
    if (startDt) {
      const startTime = new Date(startDt.getFullYear(), startDt.getMonth(), startDt.getDate()).getTime();
      if (targetTime < startTime) return false;
    }
  }

  if (filter.endDate) {
    const endDt = parseBookingDate(filter.endDate);
    if (endDt) {
      const endTime = new Date(endDt.getFullYear(), endDt.getMonth(), endDt.getDate(), 23, 59, 59, 999).getTime();
      if (targetTime > endTime) return false;
    }
  }

  return true;
}

export const MONTH_NAMES_INDO = [
  "JAN", "FEB", "MAR", "APR", "MEI", "JUN",
  "JUL", "AGU", "SEP", "OKT", "NOV", "DES"
];

export const MONTH_FULL_INDO = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return "";
  const dt = parseBookingDate(dateStr);
  if (!dt) return dateStr;
  return `${dt.getDate()} ${MONTH_NAMES_INDO[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DateRangeFilter({
  value,
  onChange,
  align = "right",
  dateType = "stuffing",
  onDateTypeChange,
  label
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Temporary local state inside the popover until user clicks "Terapkan"
  const [tempStart, setTempStart] = useState<string>(value.startDate || "");
  const [tempEnd, setTempEnd] = useState<string>(value.endDate || "");
  const [tempPreset, setTempPreset] = useState<string>(value.preset || "auto");

  // Calendar month navigation state for Left & Right calendar
  const today = new Date();
  const defaultYear = today.getFullYear();
  const defaultMonth = today.getMonth(); // 0..11

  const [leftYear, setLeftYear] = useState<number>(defaultYear);
  const [leftMonth, setLeftMonth] = useState<number>(defaultMonth);

  const [rightYear, setRightYear] = useState<number>(defaultYear);
  const [rightMonth, setRightMonth] = useState<number>(defaultMonth);

  const [hoverYmd, setHoverYmd] = useState<string>("");

  // Sync temp state when popover opens or prop changes
  useEffect(() => {
    if (isOpen) {
      setTempStart(value.startDate || "");
      setTempEnd(value.endDate || "");
      setTempPreset(value.preset || "auto");
      setHoverYmd("");

      // Set left calendar to start date or current date
      if (value.startDate) {
        const dt = parseBookingDate(value.startDate);
        if (dt) {
          setLeftYear(dt.getFullYear());
          setLeftMonth(dt.getMonth());
        }
      } else {
        setLeftYear(defaultYear);
        setLeftMonth(defaultMonth);
      }

      // Set right calendar to end date or same/next month
      if (value.endDate) {
        const dt = parseBookingDate(value.endDate);
        if (dt) {
          setRightYear(dt.getFullYear());
          setRightMonth(dt.getMonth());
        }
      } else {
        setRightYear(defaultYear);
        setRightMonth(defaultMonth);
      }
    }
  }, [isOpen, value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        modalRef.current &&
        !modalRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const isActive = Boolean(value.startDate || value.endDate) && value.preset !== "auto";

  // Preset Handler
  const handlePresetChange = (presetKey: string) => {
    setTempPreset(presetKey);
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    if (presetKey === "auto") {
      setTempStart("");
      setTempEnd("");
      return;
    }

    if (presetKey === "today") {
      const todayStr = formatYmd(now);
      setTempStart(todayStr);
      setTempEnd(todayStr);
      setLeftYear(curYear);
      setLeftMonth(curMonth);
      setRightYear(curYear);
      setRightMonth(curMonth);
    } else if (presetKey === "yesterday") {
      const yest = new Date(now);
      yest.setDate(now.getDate() - 1);
      const yestStr = formatYmd(yest);
      setTempStart(yestStr);
      setTempEnd(yestStr);
      setLeftYear(yest.getFullYear());
      setLeftMonth(yest.getMonth());
      setRightYear(yest.getFullYear());
      setRightMonth(yest.getMonth());
    } else if (presetKey === "last7") {
      const past7 = new Date(now);
      past7.setDate(now.getDate() - 6);
      setTempStart(formatYmd(past7));
      setTempEnd(formatYmd(now));
      setLeftYear(past7.getFullYear());
      setLeftMonth(past7.getMonth());
      setRightYear(curYear);
      setRightMonth(curMonth);
    } else if (presetKey === "last30") {
      const past30 = new Date(now);
      past30.setDate(now.getDate() - 29);
      setTempStart(formatYmd(past30));
      setTempEnd(formatYmd(now));
      setLeftYear(past30.getFullYear());
      setLeftMonth(past30.getMonth());
      setRightYear(curYear);
      setRightMonth(curMonth);
    } else if (presetKey === "thisMonth") {
      const first = new Date(curYear, curMonth, 1);
      const last = new Date(curYear, curMonth + 1, 0);
      setTempStart(formatYmd(first));
      setTempEnd(formatYmd(last));
      setLeftYear(curYear);
      setLeftMonth(curMonth);
      setRightYear(curYear);
      setRightMonth(curMonth);
    } else if (presetKey === "lastMonth") {
      const prevM = curMonth === 0 ? 11 : curMonth - 1;
      const prevY = curMonth === 0 ? curYear - 1 : curYear;
      const first = new Date(prevY, prevM, 1);
      const last = new Date(prevY, prevM + 1, 0);
      setTempStart(formatYmd(first));
      setTempEnd(formatYmd(last));
      setLeftYear(prevY);
      setLeftMonth(prevM);
      setRightYear(prevY);
      setRightMonth(prevM);
    } else if (presetKey === "thisYear") {
      const first = new Date(curYear, 0, 1);
      const last = new Date(curYear, 11, 31);
      setTempStart(formatYmd(first));
      setTempEnd(formatYmd(last));
      setLeftYear(curYear);
      setLeftMonth(0);
      setRightYear(curYear);
      setRightMonth(11);
    }
  };

  // Day Selection Logic
  const handleSelectDay = (ymdStr: string) => {
    setTempPreset("custom");
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(ymdStr);
      setTempEnd("");
    } else {
      if (ymdStr < tempStart) {
        setTempEnd(tempStart);
        setTempStart(ymdStr);
      } else {
        setTempEnd(ymdStr);
      }
    }
  };

  // Apply Changes
  const handleApply = () => {
    let finalStart = tempStart;
    let finalEnd = tempEnd || tempStart;
    if (finalStart && finalEnd && finalStart > finalEnd) {
      const swap = finalStart;
      finalStart = finalEnd;
      finalEnd = swap;
    }
    onChange({
      startDate: finalStart,
      endDate: finalEnd,
      preset: tempPreset === "auto" && (finalStart || finalEnd) ? "custom" : tempPreset
    });
    setIsOpen(false);
  };

  // Reset/Clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      startDate: "",
      endDate: "",
      preset: "auto"
    });
    setTempStart("");
    setTempEnd("");
    setTempPreset("auto");
  };

  // Helper to render calendar grid for a given year & month
  const renderCalendarGrid = (
    year: number,
    month: number,
    onPrevMonth: () => void,
    onNextMonth: () => void,
    calendarLabel: string
  ) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }

    return (
      <div className="flex-1 min-w-[210px] space-y-2">
        <div className="text-center">
          <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide block mb-1">
            {calendarLabel}
          </span>
          <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-gray-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onPrevMonth}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-black text-gray-900 dark:text-slate-100 tracking-wider">
              {MONTH_NAMES_INDO[month]} {year}
            </span>
            <button
              type="button"
              onClick={onNextMonth}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-slate-300 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days Header M S S R K J S */}
        <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-[10px] text-gray-400 dark:text-slate-500 py-0.5 border-b border-gray-100 dark:border-slate-800">
          <span>M</span>
          <span>S</span>
          <span>S</span>
          <span>R</span>
          <span>K</span>
          <span>J</span>
          <span>S</span>
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
          {days.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} className="h-7" />;
            }

            const currentYmd = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            
            const isStart = tempStart === currentYmd;
            const isEnd = tempEnd === currentYmd;
            const isHoverEnd = Boolean(!tempEnd && tempStart && hoverYmd === currentYmd && currentYmd !== tempStart);

            const rangeEnd = tempEnd || (tempStart && hoverYmd ? hoverYmd : "");
            const rangeMin = tempStart && rangeEnd ? (tempStart < rangeEnd ? tempStart : rangeEnd) : "";
            const rangeMax = tempStart && rangeEnd ? (tempStart < rangeEnd ? rangeEnd : tempStart) : "";

            const isInRange = Boolean(
              rangeMin && rangeMax && currentYmd > rangeMin && currentYmd < rangeMax
            );

            return (
              <div key={currentYmd} className="relative flex items-center justify-center h-7">
                {/* Background strip for range fill */}
                {isInRange && (
                  <div className="absolute inset-x-0 inset-y-1 bg-amber-100 dark:bg-amber-950/70" />
                )}
                {isStart && rangeMax && rangeMax !== currentYmd && (
                  <div className="absolute right-0 inset-y-1 w-1/2 bg-amber-100 dark:bg-amber-950/70" />
                )}
                {(isEnd || isHoverEnd) && rangeMin && rangeMin !== currentYmd && (
                  <div className="absolute left-0 inset-y-1 w-1/2 bg-amber-100 dark:bg-amber-950/70" />
                )}

                {/* Day Circle / Button */}
                <button
                  type="button"
                  onClick={() => handleSelectDay(currentYmd)}
                  onMouseEnter={() => {
                    if (tempStart && !tempEnd) setHoverYmd(currentYmd);
                  }}
                  className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer ${
                    isStart || isEnd
                      ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black shadow-md border-2 border-slate-900 dark:border-amber-400 ring-2 ring-amber-400/50"
                      : isHoverEnd
                      ? "bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 font-black border-2 border-dashed border-amber-500"
                      : isInRange
                      ? "text-amber-950 dark:text-amber-200 font-bold"
                      : "text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 hover:font-bold"
                  }`}
                >
                  {dayNum}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getTriggerLabel = () => {
    const fieldPrefix = label || (dateType === "stuffing" ? "Req. Stuffing" : "Tanggal Booking");
    if (value.startDate && value.endDate) {
      if (value.startDate === value.endDate) {
        return `${fieldPrefix}: ${formatDateIndo(value.startDate)}`;
      }
      return `${fieldPrefix}: ${formatDateIndo(value.startDate)} - ${formatDateIndo(value.endDate)}`;
    }
    if (value.startDate) {
      return `${fieldPrefix}: Dari ${formatDateIndo(value.startDate)}`;
    }
    if (value.endDate) {
      return `${fieldPrefix}: s/d ${formatDateIndo(value.endDate)}`;
    }
    return `Filter ${fieldPrefix}`;
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button - Matching image_2.png style */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
          isActive
            ? "bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-300 ring-2 ring-amber-500/20"
            : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
        }`}
      >
        <CalendarIcon className={`w-4 h-4 ${isActive ? "text-amber-600 dark:text-amber-400" : "text-gray-400"}`} />
        <span className="truncate max-w-[200px]">{getTriggerLabel()}</span>
        {isActive ? (
          <span
            onClick={handleClear}
            className="p-0.5 hover:bg-amber-500/20 rounded-md text-amber-700 dark:text-amber-300"
            title="Reset Filter Tanggal"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        )}
      </button>

      {/* Modal Dialog Overlay - Rendered in React Portal to escape any parent stacking context */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          >
            <div
              ref={modalRef}
              className="relative w-full max-w-[540px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-5 space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar: Title + Dropdown for preset range + Close 'X' */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3 gap-2.5">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-800">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-slate-100 tracking-tight">
                      Pilih Periode Tanggal
                    </span>
                  </div>

                  {onDateTypeChange && (
                    <div className="inline-flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 ml-2">
                      <button
                        type="button"
                        onClick={() => onDateTypeChange("booking")}
                        className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                          dateType === "booking"
                            ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs"
                            : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                        }`}
                      >
                        Booking Date
                      </button>
                      <button
                        type="button"
                        onClick={() => onDateTypeChange("stuffing")}
                        className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                          dateType === "stuffing"
                            ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white shadow-xs"
                            : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                        }`}
                      >
                        Req. Stuffing
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                  {/* Preset Selector Dropdown */}
                  <div className="relative">
                    <select
                      value={tempPreset}
                      onChange={(e) => handlePresetChange(e.target.value)}
                      className="bg-slate-900 text-white dark:bg-slate-800 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer pr-7 appearance-none"
                    >
                      <option value="auto">Rentang tanggal otomatis</option>
                      <option value="today">Hari ini</option>
                      <option value="yesterday">Kemarin</option>
                      <option value="last7">7 Hari Terakhir</option>
                      <option value="last30">30 Hari Terakhir</option>
                      <option value="thisMonth">Bulan ini</option>
                      <option value="lastMonth">Bulan Lalu</option>
                      <option value="thisYear">Tahun ini</option>
                      <option value="custom">Kustom</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-300 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Tutup"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Direct Date Input Boxes for "Dari" and "Sampai" */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-gray-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-gray-200/80 dark:border-slate-700/80">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-400 mb-1">
                    Dari (Tanggal Mulai):
                  </label>
                  <input
                    type="date"
                    value={tempStart}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTempStart(val);
                      setTempPreset("custom");
                      if (val) {
                        const dt = parseBookingDate(val);
                        if (dt) {
                          setLeftYear(dt.getFullYear());
                          setLeftMonth(dt.getMonth());
                        }
                      }
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 text-xs font-bold px-3 py-1.5 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-400 mb-1">
                    Sampai (Tanggal Akhir):
                  </label>
                  <input
                    type="date"
                    value={tempEnd}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTempEnd(val);
                      setTempPreset("custom");
                      if (val) {
                        const dt = parseBookingDate(val);
                        if (dt) {
                          setRightYear(dt.getFullYear());
                          setRightMonth(dt.getMonth());
                        }
                      }
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 text-xs font-bold px-3 py-1.5 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handlePresetChange("today")}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    tempPreset === "today"
                      ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-2xs"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-transparent hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange("yesterday")}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    tempPreset === "yesterday"
                      ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-2xs"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-transparent hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  Kemarin
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange("last7")}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    tempPreset === "last7"
                      ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-2xs"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-transparent hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  7 Hari
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange("last30")}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    tempPreset === "last30"
                      ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-2xs"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-transparent hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  30 Hari
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange("thisMonth")}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    tempPreset === "thisMonth"
                      ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-2xs"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-transparent hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  Bulan Ini
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempStart("");
                    setTempEnd("");
                    setTempPreset("auto");
                  }}
                  className="px-2.5 py-1 rounded-lg font-bold border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all cursor-pointer whitespace-nowrap ml-auto"
                >
                  Reset
                </button>
              </div>

              {/* Calendar Views Container (Left: Start Date, Right: End Date) */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-4 py-1">
                {/* Tanggal Mulai */}
                {renderCalendarGrid(
                  leftYear,
                  leftMonth,
                  () => {
                    if (leftMonth === 0) {
                      setLeftMonth(11);
                      setLeftYear(leftYear - 1);
                    } else {
                      setLeftMonth(leftMonth - 1);
                    }
                  },
                  () => {
                    if (leftMonth === 11) {
                      setLeftMonth(0);
                      setLeftYear(leftYear + 1);
                    } else {
                      setLeftMonth(leftMonth + 1);
                    }
                  },
                  "Tanggal Mulai"
                )}

                <div className="hidden sm:block w-px bg-gray-100 dark:bg-slate-800 self-stretch my-1" />

                {/* Tanggal Akhir */}
                {renderCalendarGrid(
                  rightYear,
                  rightMonth,
                  () => {
                    if (rightMonth === 0) {
                      setRightMonth(11);
                      setRightYear(rightYear - 1);
                    } else {
                      setRightMonth(rightMonth - 1);
                    }
                  },
                  () => {
                    if (rightMonth === 11) {
                      setRightMonth(0);
                      setRightYear(rightYear + 1);
                    } else {
                      setRightMonth(rightMonth + 1);
                    }
                  },
                  "Tanggal Akhir"
                )}
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] font-bold text-gray-600 dark:text-slate-400 text-center sm:text-left">
                  {tempStart && tempEnd ? (
                    <span>
                      Pilihan: <strong className="text-gray-900 dark:text-slate-100">{formatDateIndo(tempStart)}</strong> s/d <strong className="text-gray-900 dark:text-slate-100">{formatDateIndo(tempEnd)}</strong>
                    </span>
                  ) : tempStart ? (
                    <span>
                      Klik tanggal kedua untuk memilih rentang akhir (selesai)
                    </span>
                  ) : (
                    <span>Klik tanggal untuk memilih rentang mulai dan selesai</span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-extrabold text-xs rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
