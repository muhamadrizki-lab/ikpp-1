import React, { useState, useEffect } from "react";
import Sidebar, { TabType } from "./components/Sidebar";
import Header from "./components/Header";
import Overview from "./pages/Overview";
import OrderPage from "./pages/Order";
import AvailabilityPage from "./pages/Availability";
import ShipmentPage from "./pages/Shipment";
import UserApprovalPage from "./pages/UserApprovalPage";
import TikProLiveDashboard from "./components/TikProLiveDashboard";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import { UserAccount } from "./types";
import { getUsers } from "./lib/userStore";

const SESSION_USER_KEY = "pancaran_logged_in_user_v1";
const SESSION_TAB_KEY = "pancaran_active_tab_v1";

export default function App() {
  // Current Logged In User Account (persisted in localStorage)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const savedUser = localStorage.getItem(SESSION_USER_KEY);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error("Failed to load saved user session:", e);
    }
    return null;
  });

  // Navigation View State ('landing' | 'login' | 'dashboard')
  const [view, setView] = useState<"landing" | "login" | "dashboard">(() => {
    if (typeof window === "undefined") return "login";
    const savedUser = localStorage.getItem(SESSION_USER_KEY);
    return savedUser ? "dashboard" : "login";
  });

  const [initialPortal, setInitialPortal] = useState<"customer" | "internal" | "partner">("internal");

  // Dashboard Active Tab State
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window === "undefined") return "overview";
    const savedTab = localStorage.getItem(SESSION_TAB_KEY) as TabType;
    return savedTab || "overview";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Filter deep-linking state from Overview cards to Order page
  const [initialOrderFilter, setInitialOrderFilter] = useState<string | undefined>(undefined);

  // Persist current active tab when inside dashboard
  useEffect(() => {
    if (view === "dashboard" && activeTab) {
      localStorage.setItem(SESSION_TAB_KEY, activeTab);
    }
  }, [activeTab, view]);

  // Sync latest user details from userStore DB on session load
  useEffect(() => {
    if (currentUser?.email) {
      const allUsers = getUsers();
      const latest = allUsers.find((u) => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (latest && latest.status === "active") {
        if (JSON.stringify(latest) !== JSON.stringify(currentUser)) {
          setCurrentUser(latest);
          localStorage.setItem(SESSION_USER_KEY, JSON.stringify(latest));
        }
      } else if (latest && latest.status !== "active") {
        handleSignOut();
      }
    }
  }, []);

  // Deep-linking navigation handler
  const handleNavigate = (tab: TabType, filterType?: string) => {
    if (tab === "order" && filterType) {
      setInitialOrderFilter(filterType);
    } else {
      setInitialOrderFilter(undefined);
    }
    setActiveTab(tab);
  };

  const handleLoginSuccess = (user: UserAccount | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
      localStorage.setItem(SESSION_TAB_KEY, "overview");
    } else {
      localStorage.removeItem(SESSION_USER_KEY);
      localStorage.removeItem(SESSION_TAB_KEY);
    }
    setActiveTab("overview");
    setView("dashboard");
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem(SESSION_TAB_KEY);
    setView("landing");
  };

  const handleOpenLogin = (portal: "customer" | "internal" | "partner" = "customer") => {
    setInitialPortal(portal);
    setView("login");
  };

  // Views handling
  if (view === "landing") {
    return <LandingPage onLogin={handleOpenLogin} />;
  }

  if (view === "login") {
    return (
      <LoginPage
        initialPortal={initialPortal}
        onBackToHome={() => setView("landing")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Get dynamic titles and subtitles for each view
  const headerDetails = {
    overview: {
      title: "IKPP Monitoring Dashboard",
      subtitle: "PT Indah Kiat Pulp & Paper Tbk (IKPP) Partner Overview Cockpit"
    },
    logistik_pro: {
      title: "Dashboard Logistik Pro IKK",
      subtitle: "Live Firestore Realtime Sync - Summary Report, Daftar Armada & Laporan Ritase"
    },
    order: {
      title: "Order Management System",
      subtitle: "Search, filter, and track active container cargo orders"
    },
    availability: {
      title: "Resources & Fleet Availability",
      subtitle: "Track live vehicle statuses, container tier availability, and active drivers"
    },
    shipment: {
      title: "Dashboard - Shipment Tracking",
      subtitle: "Active pre-trip loading and on-trip container GPS transits"
    },
    user_approval: {
      title: "Aktivasi User Aktif & Approval Portal",
      subtitle: "Super Admin Governance - Persetujuan Registrasi & Kelola Hak Akses Login"
    }
  }[activeTab];

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-slate-950 text-gray-800 dark:text-slate-100 flex relative overflow-x-hidden transition-colors duration-200">
      {/* Slide-out Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => handleNavigate(tab)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onGoToLanding={handleSignOut}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full ${isSidebarOpen ? "md:pl-72" : "pl-0"}`}>
        {/* Shared top header */}
        <Header
          title={headerDetails.title}
          subtitle={headerDetails.subtitle}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          showBackButton={activeTab !== "logistik_pro" && activeTab !== "overview"}
          onBackClick={() => setActiveTab("overview")}
          currentUser={currentUser}
        />

        {/* Scrollable page body */}
        <main className="p-4 md:p-6 flex-1 overflow-y-auto max-w-none w-full mx-auto space-y-6">
          {activeTab === "logistik_pro" && (
            <TikProLiveDashboard />
          )}

          {activeTab === "overview" && (
            <Overview onNavigate={handleNavigate} currentUser={currentUser} />
          )}

          {activeTab === "order" && (
            <OrderPage
              initialTypeFilter={initialOrderFilter}
              onClearInitialFilter={() => setInitialOrderFilter(undefined)}
              currentUser={currentUser}
            />
          )}

          {activeTab === "availability" && (
            <AvailabilityPage />
          )}

          {activeTab === "shipment" && (
            <ShipmentPage />
          )}

          {activeTab === "user_approval" && (
            (currentUser?.role === "Super Admin" || currentUser?.email?.toLowerCase() === "digital.solution@pancaran-logistic.id") ? (
              <UserApprovalPage />
            ) : (
              <Overview onNavigate={handleNavigate} />
            )
          )}
        </main>
      </div>
    </div>
  );
}
