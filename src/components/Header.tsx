import React, { useState, useRef, useEffect } from "react";
import { Bell, Shield, ArrowLeft, UserCheck, Check, Info, AlertTriangle, CheckCircle2, X, Menu, ChevronRight, ChevronLeft } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { UserAccount } from "../types";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  isSidebarOpen?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
  currentUser?: UserAccount | null;
}

export default function Header({ title, subtitle, onMenuClick, isSidebarOpen, showBackButton, onBackClick, currentUser }: HeaderProps) {
  const isSuperAdmin = currentUser?.role === "Super Admin" || currentUser?.email?.toLowerCase() === "digital.solution@pancaran-logistic.id";

  const [language, setLanguage] = useState<"EN" | "ID">(() => {
    return (localStorage.getItem("app_lang") as "EN" | "ID") || "EN";
  });

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(46);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleSetLanguage = (lang: "EN" | "ID") => {
    setLanguage(lang);
    localStorage.setItem("app_lang", lang);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dummyNotifications = [
    {
      id: "1",
      title: "Pending Shipment Action Required",
      message: "54 shipment pending rute Indah Kiat IKPP memerlukan penetapan armada unit.",
      time: "5m ago",
      type: "alert",
      unread: true,
    },
    {
      id: "2",
      title: "Google Sheet Live Synced",
      message: "126 order terbaru berhasil disinkronkan dari Google Sheets.",
      time: "12m ago",
      type: "success",
      unread: true,
    },
    {
      id: "3",
      title: "SLA Target Exceeded (+3.8%)",
      message: "On-Time Delivery Rate mencapai 94.8% melampaui target SLA 91.0%.",
      time: "1h ago",
      type: "info",
      unread: true,
    },
    {
      id: "4",
      title: "Downtime Unit Maintenance",
      message: "Unit B 9012 U status Downtime memerlukan persetujuan jadwal servis.",
      time: "2h ago",
      type: "alert",
      unread: false,
    },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 h-16 md:h-20 px-3 md:px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors duration-200">
      {/* Title & Subtitle */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button
          id="header-menu-toggle"
          onClick={onMenuClick}
          className="flex items-center justify-center p-2 bg-[#0B2C6B] hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl transition-all duration-200 shadow-sm cursor-pointer shrink-0 border border-slate-900 dark:border-slate-700 mr-1"
          title={isSidebarOpen ? "Hide Navigation Menu" : "Show Navigation Menu"}
        >
          <Menu className="w-4 h-4 md:w-5 md:h-5 text-white" />
          {isSidebarOpen ? (
            <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4 text-sky-300 ml-0.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-sky-300 ml-0.5" />
          )}
        </button>

        {showBackButton && onBackClick && (
          <button
            id="header-back-button"
            onClick={onBackClick}
            className="flex items-center gap-1 px-2.5 py-1.5 md:px-3.5 md:py-2 bg-[#0B2C6B] dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-900 dark:border-slate-700 rounded-xl transition-all duration-200 shadow-sm font-bold text-[10px] md:text-xs cursor-pointer uppercase tracking-wider shrink-0"
            title="Back to Dashboard Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-extrabold text-[#031B4E] dark:text-slate-100 tracking-tight flex items-center gap-1.5 truncate">
            <span className="truncate">{title}</span>
            <span className="text-[9px] md:text-xs bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 hidden sm:inline-block shrink-0">
              IKPP Partner Portal
            </span>
          </h1>
          <p className="text-[10px] md:text-xs text-[#4F6C95] dark:text-slate-400 font-medium tracking-wide mt-0.5 truncate hidden xs:block">
            {subtitle || "Pancaran Inland Group Management System"}
          </p>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4 shrink-0">
        {/* Language Switcher Pill Toggle EN | ID */}
        <div className="bg-slate-100/90 dark:bg-slate-800 p-1 rounded-full flex items-center gap-1 border border-slate-200/80 dark:border-slate-700 shadow-inner shrink-0 pointer-events-none select-none opacity-80 cursor-not-allowed">
          <button
            type="button"
            disabled
            onClick={() => handleSetLanguage("EN")}
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all pointer-events-none cursor-not-allowed ${
              language === "EN"
                ? "bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs ring-1 ring-slate-200/60 dark:ring-slate-600"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            disabled
            onClick={() => handleSetLanguage("ID")}
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all pointer-events-none cursor-not-allowed ${
              language === "ID"
                ? "bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs ring-1 ring-slate-200/60 dark:ring-slate-600"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            ID
          </button>
        </div>

        {/* PT Indah Kiat Pulp & Paper (IKPP) Branding - Exact Logo */}
        <div className="hidden lg:flex items-center gap-3.5 border-r border-gray-200 dark:border-slate-800 pr-4">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-xs">
            {/* Left red icon with accurate white split circular waves */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-10 h-10 shrink-0 shadow-sm rounded-xl"
              shapeRendering="geometricPrecision"
              textRendering="geometricPrecision"
            >
              <rect width="100" height="100" rx="22" fill="#E1251B" />
              
              <g fill="white">
                <path d="M 14,50 A 36,36 0 0,1 86,50 A 33,33 0 0,0 20,50 Z" />
                <path d="M 26,50 A 30,30 0 0,1 86,50 A 27,27 0 0,0 32,50 Z" />
                <path d="M 38,50 A 24,24 0 0,1 86,50 A 21,21 0 0,0 44,50 Z" />
                <path d="M 50,50 A 18,18 0 0,1 86,50 A 15,15 0 0,0 56,50 Z" />
              </g>

              <g fill="white" transform="rotate(180, 50, 50)">
                <path d="M 14,50 A 36,36 0 0,1 86,50 A 33,33 0 0,0 20,50 Z" />
                <path d="M 26,50 A 30,30 0 0,1 86,50 A 27,27 0 0,0 32,50 Z" />
                <path d="M 38,50 A 24,24 0 0,1 86,50 A 21,21 0 0,0 44,50 Z" />
                <path d="M 50,50 A 18,18 0 0,1 86,50 A 15,15 0 0,0 56,50 Z" />
              </g>

              <line x1="14" y1="50" x2="86" y2="50" stroke="#E1251B" strokeWidth="2.5" />
            </svg>

            <div className="flex flex-col text-left shrink-0 justify-center">
              <span className="text-[#031B4E] dark:text-slate-100 font-extrabold text-xs tracking-wider leading-none uppercase">
                indah kiat
              </span>
              <span className="text-gray-500 dark:text-slate-400 font-extrabold text-[8px] leading-none tracking-widest mt-1 uppercase">
                pulp & paper
              </span>
            </div>
          </div>
        </div>

        {/* Vertical divider line */}
        <div className="h-7 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Notification Bell Icon Button with Badge */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 rounded-xl transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0"
            title="Notifications"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full shadow-sm animate-pulse min-w-[18px] text-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Menu */}
          {showNotifDropdown && (
            <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">Notifikasi Logistics</h3>
                  <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    {unreadCount} baru
                  </span>
                </div>
                <button
                  onClick={() => setUnreadCount(0)}
                  className="text-[10px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 transition-colors cursor-pointer"
                >
                  Tandai Dibaca
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {dummyNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      n.unread
                        ? "bg-sky-50/60 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/50"
                        : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {n.type === "alert" ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        ) : n.type === "success" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400">Pancaran Realtime Logistics System</span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2">
          <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-white text-xs md:text-sm font-black border-2 shadow shrink-0 ${
            isSuperAdmin 
              ? "bg-purple-600 border-purple-400"
              : currentUser?.role === "Internal CS"
              ? "bg-sky-600 border-sky-400"
              : "bg-[#0B2C6B] border-[#00AEEF]"
          }`}>
            {(currentUser?.fullName || "Digital Solution").replace(/^Super Admin\s*/i, "").charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-black text-gray-900 dark:text-slate-100 whitespace-nowrap">
              {(currentUser?.fullName || "Digital Solution").replace(/^Super Admin\s*/i, "")}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>{currentUser?.role || "Authorized"}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

