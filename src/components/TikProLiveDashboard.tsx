import React, { useState } from "react";
import { useFirebaseRealtime } from "../hooks/useFirebaseRealtime";
import SummaryReportView from "./SummaryReportView";
import DaftarArmadaView from "./DaftarArmadaView";
import LaporanRitaseView from "./LaporanRitaseView";
import StockRepoView from "./StockRepoView";
import {
  BarChart3,
  Truck,
  FileText,
  Package,
  RotateCw,
  Clock,
  CheckCircle2,
  CalendarDays
} from "lucide-react";

export default function TikProLiveDashboard() {
  const {
    currentUser,
    userRole,
    vendorName,
    authLoading,
    authError,
    trucks,
    ritase,
    masterStatuses,
    masterJenisTruck,
    masterJenisProduk,
    repo,
    lastSyncTime,
    nextSchedule,
    scheduledNotice,
    scheduledHours,
    triggerManualRefresh,
    login,
    updateTruckStatus,
    finishTruckDelivery,
    addTruck,
    deleteTruck,
    addRepo,
    finishRepo,
    updateRepoDetail,
    deleteRepo
  } = useFirebaseRealtime();

  const [activeSubTab, setActiveSubTab] = useState<"SUMMARY" | "DAFTAR" | "RITASE" | "REPO">("SUMMARY");
  const [syncing, setSyncing] = useState<boolean>(false);

  // Manual trigger simulation refresh
  const handleManualRefresh = () => {
    setSyncing(true);
    triggerManualRefresh();
    setTimeout(() => {
      setSyncing(false);
    }, 600);
  };

  if (authLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="font-bold text-gray-800 dark:text-slate-200">Menghubungkan ke Firebase Firestore Realtime...</h3>
        <p className="text-xs text-gray-400">Project ID: export-ikk | User: pdt@ikk.com</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Schedule Auto Refresh Indicator Bar */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-3.5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
            <Clock className="w-4 h-4 animate-pulse text-blue-400" />
          </div>
          <div>
            <div className="font-black flex items-center gap-2">
              <span>Jadwal Refresh Otomatis Rutin</span>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30 font-bold">
                6x Sehari
              </span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
              <CalendarDays className="w-3 h-3 text-indigo-300" />
              <span>Jam: <b>09:00</b> • <b>13:00</b> • <b>15:00</b> • <b>17:00</b> • <b>19:00</b> • <b>23:00</b> WIB</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
          <div className="text-right">
            <div className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">Refresh Berikutnya</div>
            <div className="font-black text-amber-300 text-xs flex items-center gap-1">
              <span>{nextSchedule.label}</span>
              <span className="text-[10px] font-medium text-slate-300">({nextSchedule.countdownText})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Refresh Event Toast Notice */}
      {scheduledNotice && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-md animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{scheduledNotice}</span>
          </div>
        </div>
      )}

      {/* Navigation Pills Header matching user screenshot */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab("SUMMARY")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeSubTab === "SUMMARY"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 dark:text-slate-300 hover:text-gray-900 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Summary Report</span>
          </button>

          <button
            onClick={() => setActiveSubTab("DAFTAR")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeSubTab === "DAFTAR"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 dark:text-slate-300 hover:text-gray-900 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Daftar Armada</span>
            <span className="bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {trucks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("RITASE")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeSubTab === "RITASE"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 dark:text-slate-300 hover:text-gray-900 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Laporan Ritase</span>
            <span className="bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {ritase.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("REPO")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeSubTab === "REPO"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 dark:text-slate-300 hover:text-gray-900 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Stock Container (Repo)</span>
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Firestore</span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={syncing}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Sinkronkan Ulang"
          >
            <RotateCw className={`w-4 h-4 ${syncing ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeSubTab === "SUMMARY" && (
        <SummaryReportView
          trucks={trucks}
          masterStatuses={masterStatuses}
          vendorName={vendorName}
          userRole={userRole}
          lastSyncTime={lastSyncTime}
        />
      )}

      {activeSubTab === "DAFTAR" && (
        <DaftarArmadaView
          trucks={trucks}
          masterStatuses={masterStatuses}
          masterJenisTruck={masterJenisTruck}
          masterJenisProduk={masterJenisProduk}
          onUpdateStatus={updateTruckStatus}
          onFinishDelivery={finishTruckDelivery}
          onAddTruck={addTruck}
          onDeleteTruck={deleteTruck}
        />
      )}

      {activeSubTab === "RITASE" && (
        <LaporanRitaseView
          ritase={ritase}
          masterJenisProduk={masterJenisProduk}
          vendorName={vendorName}
        />
      )}

      {activeSubTab === "REPO" && (
        <StockRepoView
          repo={repo}
          ritase={ritase}
          onAddRepo={addRepo}
          onUpdateRepoDetail={updateRepoDetail}
          onFinishRepo={finishRepo}
          onDeleteRepo={deleteRepo}
        />
      )}
    </div>
  );
}
