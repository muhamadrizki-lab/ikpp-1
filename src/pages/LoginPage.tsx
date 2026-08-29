import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Lock, Mail, Shield, User, Eye, EyeOff, AlertCircle, CheckCircle2, Briefcase, ChevronDown, Headset, Users } from "lucide-react";
import PANCARAN_LOGO_DATA_URL from "../assets/logo";
import { authenticateUser, registerUser } from "../lib/userStore";
import { UserAccount, UserRole } from "../types";

interface LoginPageProps {
  initialPortal?: "customer" | "internal" | "partner";
  onBackToHome: () => void;
  onLoginSuccess: (user: UserAccount | null) => void;
}

const DEPARTMENT_OPTIONS = [
  "Commercial",
  "Customer Service",
  "Vendor Management",
  "Operation",
  "Digital Solution",
  "Admin",
];

const POSITION_OPTIONS = [
  "Staff",
  "Koordinator",
  "Specialist",
  "Team Leader",
  "Section Head",
  "Deputy Head",
  "Department Head",
  "Deputy Head Division",
  "Division Head",
  "Director",
];

export default function LoginPage({ initialPortal = "customer", onBackToHome, onLoginSuccess }: LoginPageProps) {
  const [activePortal, setActivePortal] = useState<"customer" | "internal" | "partner">(initialPortal);
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  // Custom dropdown states
  const [selectedDepartment, setSelectedDepartment] = useState("Commercial");
  const [isDeptOpen, setIsDeptOpen] = useState(false);

  const [selectedPosition, setSelectedPosition] = useState("Staff");
  const [isPosOpen, setIsPosOpen] = useState(false);

  const deptRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<HTMLDivElement>(null);

  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState<string | null>(null);

  // Reset inputs & feedback on portal switch so placeholders act as templates
  useEffect(() => {
    setErrorMessage(null);
    setRegisterSuccessMsg(null);
    setEmail("");
    setPassword("");
  }, [activePortal]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (deptRef.current && !deptRef.current.contains(event.target as Node)) {
        setIsDeptOpen(false);
      }
      if (posRef.current && !posRef.current.contains(event.target as Node)) {
        setIsPosOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRegisterSuccessMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (activePortal === "internal" && isRegisterView) {
        // Handle User Registration
        if (!fullName.trim()) {
          setErrorMessage("Full Name is required for account registration.");
          return;
        }

        const mappedRole: UserRole = 
          selectedDepartment === "Customer Service" ? "Internal CS" :
          selectedDepartment === "Admin" ? "Super Admin" :
          selectedDepartment === "Digital Solution" ? "Management Executive" :
          "Operations Staff";

        const res = registerUser({
          email,
          passwordHash: password,
          fullName,
          role: mappedRole,
          department: `${selectedDepartment} (${selectedPosition})`
        });

        if (res.success) {
          setRegisterSuccessMsg(res.message || "Account registration successful!");
          setIsRegisterView(false);
        } else {
          setErrorMessage(res.message || "Failed to register account.");
        }
      } else {
        // Handle User Login
        const res = authenticateUser(email, password);

        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setErrorMessage(res.message || "Sign In Failed: Invalid email & password combination or account not yet active.");
        }
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans relative selection:bg-sky-500 selection:text-white">
      {/* Top Header / Back Link */}
      <header className="relative z-10 px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-sky-600 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main Login / Register Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[390px] bg-white border border-slate-200/80 rounded-[28px] p-7 sm:p-8 shadow-2xl shadow-slate-200/60 relative overflow-visible">
          
          {/* CUSTOMER PORTAL VIEW */}
          {activePortal === "customer" && (
            <>
              {/* Logo & Header */}
              <div className="text-center space-y-2 mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <img
                    src={PANCARAN_LOGO_DATA_URL}
                    alt="Pancaran Logo"
                    className="w-8 h-8 object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex items-center gap-1 text-lg font-black tracking-wider">
                    <span className="text-[#0B2C6B]">PANCARAN</span>
                    <span className="text-[#00AEEF]">ONE</span>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight text-center">
                  Customer Portal
                </h2>
                <p className="text-slate-500 text-xs font-semibold italic text-center mt-1">
                  "Welcome to Your Exclusive Logistics Command Center"
                </p>
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2 text-rose-800 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Customer Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#008CA8] focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#008CA8] focus:bg-white rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#008CA8] hover:bg-[#007790] text-white font-extrabold text-xs tracking-wider py-3.5 px-4 rounded-full transition-all shadow-md shadow-[#008CA8]/25 cursor-pointer uppercase flex items-center justify-center gap-2 mt-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>SIGN IN TO PORTAL</span>
                  )}
                </button>
              </form>

              {/* Bottom Section */}
              <div className="mt-7 pt-4 text-center space-y-3 border-t border-slate-100/80">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  DON'T HAVE AN ACCOUNT?
                </p>
                <button
                  type="button"
                  onClick={() => alert("To register for a new Customer Portal account, please contact Admin at customer.service@pancaran-logistic.id.")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 text-[#008CA8] text-xs font-black transition-all border border-slate-100 shadow-2xs cursor-pointer"
                >
                  <Headset className="w-4 h-4 text-[#008CA8]" />
                  <span>Contact Admin</span>
                </button>
              </div>
            </>
          )}

          {/* INTERNAL PORTAL VIEW */}
          {activePortal === "internal" && (
            <>
              {/* Logo & Header */}
              <div className="text-center space-y-2 mb-6">
                <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white border border-slate-100 shadow-sm mb-1">
                  <img
                    src={PANCARAN_LOGO_DATA_URL}
                    alt="Pancaran Logo"
                    className="w-9 h-9 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {isRegisterView ? "Create Account" : "Internal Portal"}
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                    {isRegisterView
                      ? "Register as internal staff member"
                      : "Access ecosystem management systems"}
                  </p>
                </div>
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2.5 text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs font-bold leading-relaxed">
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Success Registration Notice */}
              {registerSuccessMsg && (
                <div className="mb-4 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-amber-900 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs font-bold leading-relaxed">
                    {registerSuccessMsg}
                  </div>
                </div>
              )}

              {/* Internal Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegisterView && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isRegisterView ? "staff@pancaran.com" : "email@pancaran-logistic.id"}
                      className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {isRegisterView && (
                  <>
                    {/* Custom Department / Role Select Dropdown */}
                    <div className="relative" ref={deptRef}>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Role (Department)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDeptOpen(!isDeptOpen);
                          setIsPosOpen(false);
                        }}
                        className={`w-full bg-[#F8FAFC] border rounded-xl pl-3.5 pr-3 py-2.5 text-xs sm:text-sm flex items-center justify-between text-slate-900 transition-all cursor-pointer ${
                          isDeptOpen
                            ? "border-blue-500 ring-2 ring-blue-500/30 bg-white"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{selectedDepartment}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDeptOpen ? "rotate-180" : ""}`} />
                      </button>

                      {/* Dropdown Options List */}
                      {isDeptOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-300 rounded-xl shadow-2xl z-50 overflow-hidden py-1 divide-y divide-slate-100">
                          {DEPARTMENT_OPTIONS.map((dept) => {
                            const isSelected = dept === selectedDepartment;
                            return (
                              <button
                                key={dept}
                                type="button"
                                onClick={() => {
                                  setSelectedDepartment(dept);
                                  setIsDeptOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-between font-semibold ${
                                  isSelected
                                    ? "bg-[#1D61E0] text-white"
                                    : "text-slate-800 hover:bg-slate-50"
                                }`}
                              >
                                <span>{dept}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Custom Position / Level Select Dropdown */}
                    <div className="relative" ref={posRef}>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Level (Position)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPosOpen(!isPosOpen);
                          setIsDeptOpen(false);
                        }}
                        className={`w-full bg-[#F8FAFC] border rounded-xl pl-3.5 pr-3 py-2.5 text-xs sm:text-sm flex items-center justify-between text-slate-900 transition-all cursor-pointer ${
                          isPosOpen
                            ? "border-blue-500 ring-2 ring-blue-500/30 bg-white"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{selectedPosition}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isPosOpen ? "rotate-180" : ""}`} />
                      </button>

                      {/* Dropdown Options List */}
                      {isPosOpen && (
                        <div className="absolute left-0 right-0 bottom-full mb-1.5 max-h-56 overflow-y-auto bg-white border border-slate-300 rounded-xl shadow-2xl z-50 py-1 divide-y divide-slate-100 scrollbar-thin">
                          {POSITION_OPTIONS.map((pos) => {
                            const isSelected = pos === selectedPosition;
                            return (
                              <button
                                key={pos}
                                type="button"
                                onClick={() => {
                                  setSelectedPosition(pos);
                                  setIsPosOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-between font-semibold ${
                                  isSelected
                                    ? "bg-[#1D61E0] text-white"
                                    : "text-slate-800 hover:bg-slate-50"
                                }`}
                              >
                                <span>{pos}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Password
                    </label>
                    {!isRegisterView && (
                      <button
                        type="button"
                        onClick={() => alert("To reset your password, please contact Super Admin at digital.solution@pancaran-logistic.id.")}
                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Main Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#5438FF] hover:bg-[#4326f0] text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer transform active:scale-[0.99] mt-3 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{isRegisterView ? "Complete Registration" : "Sign In to Portal"}</span>
                  )}
                </button>
              </form>

              {/* Toggle Register / Sign In */}
              <div className="mt-6 text-center text-xs font-semibold text-slate-500">
                {isRegisterView ? (
                  <p>
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setIsRegisterView(false);
                        setErrorMessage(null);
                      }}
                      className="text-[#5438FF] font-bold hover:underline cursor-pointer ml-1"
                    >
                      Login here
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{" "}
                    <button
                      onClick={() => {
                        setIsRegisterView(true);
                        setErrorMessage(null);
                      }}
                      className="text-[#5438FF] font-bold hover:underline cursor-pointer ml-1"
                    >
                      Create Account
                    </button>
                  </p>
                )}
              </div>
            </>
          )}

          {/* PARTNER PORTAL VIEW (OFF / INACTIVE) */}
          {activePortal === "partner" && (
            <>
              {/* Logo & Header */}
              <div className="text-center space-y-2 mb-6">
                <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 mb-1">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-block bg-slate-200 text-slate-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase mb-1">
                    OFF / INACTIVE
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                    Partner Portal
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                    Partner Portal access is currently turned off.
                  </p>
                </div>
              </div>

              {/* Inactive Notice Banner */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 space-y-2 text-center">
                <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                <div className="text-xs font-bold leading-relaxed">
                  Partner Portal is currently OFF / Inactive. Login access is disabled.
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setActivePortal("internal")}
                  className="text-xs font-extrabold text-[#0B2C6B] hover:underline cursor-pointer"
                >
                  Switch to Internal Portal ›
                </button>
              </div>
            </>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-[11px] font-medium text-slate-400 border-t border-slate-200/60 bg-white/60">
        © 2026 PT Pancaran Darat Transport. All rights reserved.
      </footer>
    </div>
  );
}

