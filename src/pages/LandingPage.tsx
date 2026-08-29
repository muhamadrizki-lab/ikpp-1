import React, { useState, useRef, useEffect } from "react";
import { 
  ChevronRight, 
  ChevronLeft,
  Info,
  Shield, 
  User,
  UserCheck, 
  Users, 
  Radio, 
  MonitorCheck, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  ChevronDown,
  ExternalLink,
  Calendar,
  Gavel,
  Globe,
  Layers,
  Sparkles
} from "lucide-react";
import PANCARAN_LOGO_DATA_URL from "../assets/logo";

function IkppLogo({ className = "h-8 sm:h-9" }: { className?: string }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const driveImgUrl = "https://lh3.googleusercontent.com/d/17KbyZDiuRMZnzr9ikou_5y0xOKKaKKJP=w800";

  return (
    <div className={`flex items-center shrink-0 ${className}`}>
      <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-sm shrink-0 h-full relative">
        {/* Instant high-res IKPP Brand Vector Badge - visible immediately */}
        <div className="flex items-center gap-2">
          <svg 
            viewBox="0 0 100 100" 
            className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-md"
            shapeRendering="geometricPrecision"
          >
            <rect width="100" height="100" rx="18" fill="#E1251B" />
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
          <div className="flex flex-col text-left justify-center pr-1">
            <span className="text-[#031B4E] font-black text-[11px] sm:text-[12px] tracking-wider leading-none uppercase">
              INDAH KIAT
            </span>
            <span className="text-gray-500 font-bold text-[7.5px] sm:text-[8px] leading-none tracking-widest mt-0.5 uppercase">
              PULP & PAPER (IKPP)
            </span>
          </div>
        </div>

        {/* Overlay Image when loaded seamlessly without blocking initial render */}
        <img
          src={driveImgUrl}
          onLoad={() => setImgLoaded(true)}
          alt="IKPP Logo"
          className={`absolute inset-0 w-full h-full object-contain rounded-lg bg-white p-0.5 border border-slate-200 transition-opacity duration-300 ${
            imgLoaded ? "opacity-100 z-10" : "opacity-0 -z-10"
          }`}
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

interface LandingPageProps {
  onLogin: (portal?: "customer" | "internal" | "partner") => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showAboutUsView, setShowAboutUsView] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [language, setLanguage] = useState<"EN" | "ID">(() => {
    return (localStorage.getItem("app_lang") as "EN" | "ID") || "EN";
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSetLanguage = (lang: "EN" | "ID") => {
    setLanguage(lang);
    localStorage.setItem("app_lang", lang);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLoginDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (showAboutUsView) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
        {/* Header Navigation */}
        <header className="border-b border-slate-100 px-6 py-4 bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Back to Home Button */}
            <button
              onClick={() => setShowAboutUsView(false)}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 px-4 py-2 rounded-full transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            {/* Logo Center */}
            <div className="flex items-center gap-2 sm:gap-2.5 cursor-pointer" onClick={() => setShowAboutUsView(false)}>
              <img 
                src={PANCARAN_LOGO_DATA_URL} 
                alt="Pancaran Logo" 
                className="w-8 h-8 object-contain rounded-lg bg-white p-0.5 border border-slate-200 shadow-sm shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center gap-1 text-base font-black tracking-wider">
                <span className="text-[#0B2C6B]">PANCARAN</span>
                <span className="text-[#00AEEF]">ONE</span>
              </div>
              <span className="text-slate-400 font-black text-sm px-0.5 shrink-0 select-none">X</span>
              <IkppLogo className="h-7 sm:h-8" />
            </div>

            {/* Spacer to balance layout */}
            <div className="w-[120px] hidden sm:block" />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-5xl mx-auto w-full">
          {/* Category Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-50 text-[#00AEEF] border border-sky-200 text-[11px] font-extrabold uppercase tracking-wider mb-4 shadow-sm">
            <Info className="w-3.5 h-3.5 text-[#00AEEF]" />
            <span>CORPORATE VIDEO</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            About Us: <span className="text-[#00AEEF]">Pancaran Group</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed mt-4">
            Experience the journey of Pancaran Group through our corporate showcase. Discover how we orchestrate logistics excellence across the archipelago.
          </p>

          {/* YouTube Video Container */}
          <div className="mt-8 w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-200/80 bg-black aspect-video relative">
            <iframe 
              className="w-full h-full rounded-2xl"
              src="https://www.youtube.com/embed/Gn2oi6YyQnY?autoplay=1&rel=0" 
              title="Pancaran Group Corporate Video" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-100 text-center">
          <p className="text-[11px] font-bold text-slate-400 tracking-wider">
            © 2026 PANCARAN GROUP. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* 1. Header Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-6 py-3.5 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img 
              src={PANCARAN_LOGO_DATA_URL} 
              alt="Pancaran Logo" 
              className="w-9 h-9 object-contain rounded-lg bg-white p-1 border border-slate-200 shadow-sm shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-900 font-black tracking-wider text-lg">PANCARAN</span>
              <span className="bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent font-black tracking-widest text-lg">ONE</span>
            </div>
            <span className="text-slate-400 font-black text-sm sm:text-base px-0.5 shrink-0 select-none">X</span>
            <IkppLogo className="h-8 sm:h-9" />
          </div>

          {/* Navigation Links & Action Button */}
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest text-slate-600">
              <button 
                onClick={() => setShowAboutUsView(true)} 
                className="hover:text-sky-600 transition-colors uppercase cursor-pointer"
              >
                ABOUT US
              </button>
              <button 
                onClick={() => scrollToSection("why-choose")} 
                className="hover:text-sky-600 transition-colors uppercase cursor-pointer"
              >
                SOLUTION
              </button>
              <button 
                onClick={() => scrollToSection("portals")} 
                className="hover:text-sky-600 transition-colors uppercase cursor-pointer"
              >
                PORTALS
              </button>
            </nav>

            {/* Language Switcher Pill Toggle EN | ID */}
            <div className="bg-slate-100/90 p-1 rounded-full flex items-center gap-1 border border-slate-200/80 shadow-inner shrink-0">
              <button
                onClick={() => handleSetLanguage("EN")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                  language === "EN"
                    ? "bg-white text-sky-700 shadow-xs ring-1 ring-slate-200/60"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => handleSetLanguage("ID")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                  language === "ID"
                    ? "bg-white text-sky-700 shadow-xs ring-1 ring-slate-200/60"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                ID
              </button>
            </div>

            {/* Login Portal Button with Dropdown Options */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="landing-login-portal-btn"
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md shadow-sky-600/20 hover:shadow-sky-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Login Portal</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${isLoginDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Portal Selection Dropdown Popup */}
              {isLoginDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100/90 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setIsLoginDropdownOpen(false);
                      onLogin("customer");
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-cyan-50/80 text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-100/80 text-cyan-600 flex items-center justify-center shrink-0 group-hover:bg-cyan-200/80 transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-900">Customer Portal</div>
                      <div className="text-[10px] text-slate-400 font-medium">Logistics Tracking & Orders</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsLoginDropdownOpen(false);
                      onLogin("internal");
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-indigo-50/80 text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-200/80 transition-colors">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">Internal Portal</div>
                      <div className="text-[10px] text-slate-400 font-medium">Management & Operations</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative min-h-[65vh] sm:min-h-[70vh] flex items-center justify-center pt-20 pb-10 overflow-hidden bg-slate-900">
        {/* Looping Background Video - High Clarity */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center filter brightness-100 contrast-[1.1]"
          >
            <source
              src="https://res.cloudinary.com/x6bejifd/video/upload/v1785654553/PixVerse_V6_Image_Text_540P_buat__video_logist_pivi8z.mp4"
              type="video/mp4"
            />
          </video>
          {/* Clear video on top with smooth white gradient transition at the bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50" />
        </div>

        {/* Ambient Radial Blurs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-200/30 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6 py-6 sm:py-8 my-4">
          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 leading-none">
              Orchestrating <br />
              <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Logistics
              </span>
            </h1>
          </div>

          {/* Subtitle Description */}
          <p className="text-slate-700 text-base sm:text-lg max-w-2xl mx-auto font-bold leading-relaxed">
            A unified platform connecting Customers, Internal Operations, and Partners for seamless end-to-end logistics execution.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              id="hero-get-started-btn"
              onClick={() => onLogin("customer")}
              className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-extrabold text-sm px-7 py-3.5 rounded-full flex items-center gap-2 shadow-xl shadow-sky-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={() => setShowAboutUsView(true)}
              className="bg-white/90 hover:bg-white text-slate-800 border border-slate-200 font-extrabold text-sm px-7 py-3.5 rounded-full transition-all cursor-pointer shadow-sm hover:shadow transform hover:-translate-y-0.5"
            >
              About Us
            </button>

            <button
              disabled
              className="border-2 border-sky-600/40 bg-white/80 text-sky-800 font-extrabold text-sm px-7 py-3.5 rounded-full shadow-sm pointer-events-none select-none"
            >
              Request Demo
            </button>
          </div>
        </div>
      </section>

      {/* 3. "One Platform, Three Portals" Section */}
      <section id="portals" className="py-24 bg-slate-50 relative z-10 px-6 border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              One Platform, Three Portals
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium max-w-xl mx-auto">
              Tailored experiences for every stakeholder in the logistics lifecycle.
            </p>
          </div>

          {/* 3 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Customer Portal */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between space-y-6 hover:border-sky-500 transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-sky-500/10">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Customer Portal</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Full visibility into orders, tracking, and billing. Create shipments in seconds.
                </p>
              </div>
              <div>
                <button
                  onClick={() => onLogin("customer")}
                  className="text-sky-600 hover:text-sky-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer group-hover:translate-x-1 transition-all"
                >
                  <span>Enter Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 2: Internal Portal */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between space-y-6 hover:border-sky-500 transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-sky-500/10">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Internal Portal</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  The Control Tower for Pancaran Group operations.
                </p>
              </div>
              <div>
                <button
                  onClick={() => onLogin("internal")}
                  className="text-sky-600 hover:text-sky-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer group-hover:translate-x-1 transition-all"
                >
                  <span>Enter Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 3: Partner Portal (OFF / Disabled) */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-8 flex flex-col justify-between space-y-6 opacity-75 shadow-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-slate-200 text-slate-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                OFF / INACTIVE
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-200/80 border border-slate-300 flex items-center justify-center text-slate-500">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Partner Portal</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Vendor and fleet ecosystem portal is currently turned off.
                </p>
              </div>
              <div>
                <button
                  disabled
                  onClick={(e) => e.preventDefault()}
                  className="text-slate-400 font-bold text-xs flex items-center gap-1.5 cursor-not-allowed"
                >
                  <span>Portal Disabled (OFF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "Why Choose Pancaran One?" Section */}
      <section id="why-choose" className="py-24 bg-white border-t border-slate-200/80 px-6 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Feature Highlights */}
          <div className="lg:col-span-6 space-y-8">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Why Choose Pancaran <br />
              <span className="text-sky-600">One?</span>
            </h2>

            <div className="space-y-6">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                    FEATURE: <span className="text-sky-700">REAL-TIME VISIBILITY</span>
                  </h4>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    Track your cargo with GPS-enabled monitoring and automated status updates.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                  <MonitorCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                    FEATURE: <span className="text-sky-700">CONTROL TOWER</span>
                  </h4>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    Centralized management for both Own Fleet and Vendor Fleet operations.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                    FEATURE: <span className="text-sky-700">COST EFFICIENCY</span>
                  </h4>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    Optimize routes and fleet utilization to reduce logistics overhead.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                    FEATURE: <span className="text-sky-700">TRANSPARENCY</span>
                  </h4>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    Clear pricing, automated invoicing, and digital POD/BAST documents.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Command Center Control Room Image & Metric Overlay */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[36px] overflow-hidden border border-slate-100 shadow-2xl group">
              <img 
                src="https://lh3.googleusercontent.com/d/13s1nRki93N4BzDCJjPcaXOdiksOTBq5X" 
                alt="Pancaran Team Operations" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to Google Drive thumbnail endpoint if direct CDN link needs alternative URL
                  const target = e.currentTarget;
                  if (target.src.includes("lh3.googleusercontent")) {
                    target.src = "https://drive.google.com/thumbnail?id=13s1nRki93N4BzDCJjPcaXOdiksOTBq5X&sz=w1200";
                  } else if (target.src.includes("thumbnail")) {
                    target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80";
                  }
                }}
                className="w-full h-[380px] sm:h-[420px] object-cover object-center filter contrast-[1.05] rounded-[36px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Metric Badge */}
            <div className="absolute -bottom-6 -left-3 sm:-left-6 bg-white text-slate-900 rounded-[28px] p-6 shadow-2xl border border-slate-100 max-w-[260px] space-y-3.5 z-20">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-cyan-100/80 flex items-center justify-center text-cyan-600 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none tracking-tight">99.8%</span>
                  <span className="text-[11px] font-bold text-sky-700/80 mt-1">On-time</span>
                </div>
              </div>
              <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                Industry leading performance<br />
                across our hybrid fleet<br />
                network.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-8 bg-slate-50 border-t border-slate-200 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <img 
                src={PANCARAN_LOGO_DATA_URL} 
                alt="Pancaran Logo" 
                className="w-8 h-8 object-contain rounded-lg bg-white p-0.5 border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center gap-1.5 text-sm font-black tracking-wider">
                <span className="text-[#0B2C6B]">PANCARAN</span>
                <span className="text-[#00AEEF]">ONE</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium max-w-md leading-relaxed">
              Connecting ecosystems for efficient logistics<br />
              operations across Indonesia.
            </p>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-bold tracking-wider text-slate-500">
            <button className="hover:text-slate-800 transition-colors uppercase">PRIVACY</button>
            <button className="hover:text-slate-800 transition-colors uppercase">TERMS</button>
            <button className="hover:text-slate-800 transition-colors uppercase">SUPPORT</button>
          </div>
        </div>
      </footer>

      {/* Request Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Request a Demo</h3>
              <p className="text-slate-500 text-xs">Experience the power of Pancaran ONE Control Tower.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. PT Indah Kiat Pulp & Paper Tbk" 
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Work Email</label>
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowDemoModal(false)} 
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowDemoModal(false);
                  onLogin();
                }} 
                className="bg-sky-600 hover:bg-sky-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-sky-600/20"
              >
                Submit & Enter Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
