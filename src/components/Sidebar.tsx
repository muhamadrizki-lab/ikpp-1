import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, ClipboardList, Truck, Package, ChevronLeft, ShieldCheck, LogOut, UserCheck, Shield, User } from "lucide-react";
import PANCARAN_LOGO_DATA_URL from "../assets/logo";
import { UserAccount } from "../types";
import { getUsers } from "../lib/userStore";

export type TabType = "overview" | "logistik_pro" | "order" | "availability" | "shipment" | "user_approval";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpen: boolean;
  onClose: () => void;
  onGoToLanding?: () => void;
  currentUser?: UserAccount | null;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose, onGoToLanding, currentUser }: SidebarProps) {
  const isSuperAdmin = currentUser?.role === "Super Admin" || currentUser?.email.toLowerCase() === "digital.solution@pancaran-logistic.id";
  const pendingCount = getUsers().filter(u => u.status === "pending").length;

  const baseMenuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "order", label: "Order Management", icon: ClipboardList },
    { id: "availability", label: "Resources & Availability", icon: Truck },
    { id: "shipment", label: "Shipment Tracking", icon: Package },
    { id: "logistik_pro", label: "Dashboard Logistik Pro IKK", icon: ShieldCheck },
  ] as const;

  // Add Super Admin Exclusive Menu Item if Super Admin
  const menuItems = [
    ...baseMenuItems,
    ...(isSuperAdmin ? [{
      id: "user_approval" as const,
      label: "Aktivasi & Approval User",
      icon: UserCheck,
      badge: pendingCount > 0 ? `${pendingCount} Pending` : undefined
    }] : [])
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Backdrop - click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900 z-40 cursor-pointer md:hidden"
          />

          {/* Drawer Container */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 35 }}
            className="w-72 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 flex flex-col h-screen fixed left-0 top-0 z-50 border-r border-gray-200 dark:border-slate-800 shadow-2xl transition-colors duration-200"
          >
            {/* Brand Logo Box with Close Button */}
            <div className="bg-white dark:bg-slate-900 p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between h-20 shrink-0">
              <div className="flex items-center gap-3">
                {/* Official Pancaran Logo */}
                <img 
                  src={PANCARAN_LOGO_DATA_URL} 
                  alt="Pancaran Logo" 
                  className="w-10 h-10 object-contain rounded-xl shadow-md shrink-0 border border-slate-100 dark:border-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col text-left">
                  <span className="text-[#0B2C6B] dark:text-sky-400 font-black tracking-wider text-base leading-none">PANCARAN</span>
                  <span className="text-gray-400 dark:text-slate-500 font-extrabold text-[10px] tracking-widest leading-none mt-1">ONE SYSTEM</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Hide Menu"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 py-5 flex flex-col justify-between overflow-y-auto">
              <nav className="space-y-1.5 px-4">
                <div className="px-3 mb-2 text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-slate-500 opacity-90">
                  Navigation Menu
                </div>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isApprovalTab = item.id === "user_approval";

                  return (
                    <button
                      key={item.id}
                      id={`sidebar-tab-${item.id}`}
                      onClick={() => {
                        setActiveTab(item.id as TabType);
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                          onClose();
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? isApprovalTab
                            ? "bg-sky-600 text-white shadow-md translate-x-1 font-extrabold"
                            : "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border-l-4 border-sky-500 shadow-sm translate-x-1"
                          : isApprovalTab
                          ? "bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 hover:bg-sky-100 border border-sky-300/60 dark:border-sky-800/60"
                          : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? isApprovalTab ? "text-white" : "text-sky-500 dark:text-sky-400"
                            : isApprovalTab ? "text-sky-600 dark:text-sky-400" : "text-gray-400 dark:text-slate-400"
                        }`} />
                        <span>{item.label}</span>
                      </div>

                      {/* Optional Badge (e.g. Pending count) */}
                      {"badge" in item && item.badge && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse ${
                          isActive ? "bg-white text-sky-800" : "bg-sky-600 text-white"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Bottom Sign Out Section */}
              <div className="px-4 pt-4 border-t border-gray-100 dark:border-slate-800 mt-auto space-y-2.5">
                {/* Sign Out / Exit Portal Button */}
                <button
                  id="sidebar-sign-out"
                  onClick={() => {
                    if (onGoToLanding) {
                      onGoToLanding();
                    } else {
                      window.location.reload();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit Portal / Logout</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
