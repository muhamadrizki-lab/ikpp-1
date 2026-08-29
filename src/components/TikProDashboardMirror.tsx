import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Truck, 
  Clock, 
  Building, 
  RotateCw, 
  CheckCircle2, 
  Ship, 
  FileEdit, 
  Hourglass, 
  Wrench, 
  UserX, 
  MapPin, 
  CreditCard, 
  Search, 
  Filter, 
  ExternalLink,
  ShieldCheck,
  Phone,
  Package
} from "lucide-react";
import { TikProMirrorData, TikProTruck } from "../types";

interface TikProDashboardMirrorProps {
  data: TikProMirrorData | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function TikProDashboardMirror({ data, loading, error, onRefresh }: TikProDashboardMirrorProps) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (error && !data) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-6 text-center text-rose-800 dark:text-rose-200">
        <p className="font-bold text-sm">Gagal Mengisi Data Mirroring TikPro</p>
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Coba Lagi
        </button>
      </div>
    );
  }

  const mirror = data || {
    lastSyncedAt: new Date().toISOString(),
    vendorName: "Pancaran Darat",
    userEmail: "pdt@ikk.com",
    accessRole: "VENDOR EMKL",
    totalArmadaTerdaftar: 46,
    dalamTugasAlokasi: 10,
    standbyTersedia: 36,
    totalVendorMitra: 1,
    statusBreakdown: {
      "TERSEDIA": 36,
      "MUAT DEPO": 0,
      "OTW IKK": 0,
      "DAFTAR DCO - ESTIMASI": 0,
      "GUDANG ANTRI MUAT": 1,
      "OTW PELABUHAN": 4,
      "BONGKAR PORT / DONE": 0,
      "STORING / LAKA": 2,
      "NO DRIVER": 0,
      "TUNGGU LOKASI": 0,
      "GROUNDING": 0,
      "REPO FULL": 0,
      "REPO EMPTY": 0,
      "TUNGGU KARTU EKSPOR": 3,
    },
    statusItems: [],
    trucks: [],
  };

  const statusCards = [
    { key: "TERSEDIA", label: "TERSEDIA", count: mirror.statusBreakdown["TERSEDIA"] ?? 0, icon: CheckCircle2, borderCol: "border-l-emerald-500", textCol: "text-emerald-600 dark:text-emerald-400", bgCol: "bg-emerald-500/10" },
    { key: "MUAT DEPO", label: "MUAT DEPO", count: mirror.statusBreakdown["MUAT DEPO"] ?? 0, icon: Ship, borderCol: "border-l-blue-500", textCol: "text-blue-600 dark:text-blue-400", bgCol: "bg-blue-500/10" },
    { key: "OTW IKK", label: "OTW IKK", count: mirror.statusBreakdown["OTW IKK"] ?? 0, icon: Truck, borderCol: "border-l-indigo-500", textCol: "text-indigo-600 dark:text-indigo-400", bgCol: "bg-indigo-500/10" },
    { key: "DAFTAR DCO - ESTIMASI", label: "DAFTAR DCO - ESTIMASI", count: mirror.statusBreakdown["DAFTAR DCO - ESTIMASI"] ?? 0, icon: FileEdit, borderCol: "border-l-purple-500", textCol: "text-purple-600 dark:text-purple-400", bgCol: "bg-purple-500/10" },
    { key: "GUDANG ANTRI MUAT", label: "GUDANG ANTRI MUAT", count: mirror.statusBreakdown["GUDANG ANTRI MUAT"] ?? 0, icon: Hourglass, borderCol: "border-l-sky-500", textCol: "text-sky-600 dark:text-sky-400", bgCol: "bg-sky-500/10" },
    { key: "OTW PELABUHAN", label: "OTW PELABUHAN", count: mirror.statusBreakdown["OTW PELABUHAN"] ?? 0, icon: Ship, borderCol: "border-l-cyan-600", textCol: "text-cyan-600 dark:text-cyan-400", bgCol: "bg-cyan-500/10" },
    { key: "BONGKAR PORT / DONE", label: "BONGKAR PORT / DONE", count: mirror.statusBreakdown["BONGKAR PORT / DONE"] ?? 0, icon: Truck, borderCol: "border-l-teal-500", textCol: "text-teal-600 dark:text-teal-400", bgCol: "bg-teal-500/10" },
    { key: "STORING / LAKA", label: "STORING / LAKA", count: mirror.statusBreakdown["STORING / LAKA"] ?? 0, icon: Wrench, borderCol: "border-l-rose-500", textCol: "text-rose-600 dark:text-rose-400", bgCol: "bg-rose-500/10" },
    { key: "NO DRIVER", label: "NO DRIVER", count: mirror.statusBreakdown["NO DRIVER"] ?? 0, icon: UserX, borderCol: "border-l-pink-500", textCol: "text-pink-600 dark:text-pink-400", bgCol: "bg-pink-500/10" },
    { key: "TUNGGU LOKASI", label: "TUNGGU LOKASI", count: mirror.statusBreakdown["TUNGGU LOKASI"] ?? 0, icon: MapPin, borderCol: "border-l-slate-500", textCol: "text-slate-600 dark:text-slate-400", bgCol: "bg-slate-500/10" },
    { key: "GROUNDING", label: "GROUNDING", count: mirror.statusBreakdown["GROUNDING"] ?? 0, icon: Truck, borderCol: "border-l-gray-600", textCol: "text-gray-600 dark:text-gray-400", bgCol: "bg-gray-500/10" },
    { key: "REPO FULL", label: "REPO FULL", count: mirror.statusBreakdown["REPO FULL"] ?? 0, icon: Package, borderCol: "border-l-stone-600", textCol: "text-stone-600 dark:text-stone-400", bgCol: "bg-stone-500/10" },
    { key: "REPO EMPTY", label: "REPO EMPTY", count: mirror.statusBreakdown["REPO EMPTY"] ?? 0, icon: Package, borderCol: "border-l-zinc-600", textCol: "text-zinc-600 dark:text-zinc-400", bgCol: "bg-zinc-500/10" },
    { key: "TUNGGU KARTU EKSPOR", label: "TUNGGU KARTU EKSPOR", count: mirror.statusBreakdown["TUNGGU KARTU EKSPOR"] ?? 0, icon: CreditCard, borderCol: "border-l-indigo-600", textCol: "text-indigo-600 dark:text-indigo-400", bgCol: "bg-indigo-500/10" },
  ];

  const [viewMode, setViewMode] = useState<"SUMMARY" | "DAFTAR">("SUMMARY");

  const rawTrucks = mirror.trucks || [];

  const filteredTrucks = rawTrucks.filter((truck) => {
    const matchesStatus =
      selectedStatusFilter === "ALL" ||
      truck.status.toUpperCase().includes(selectedStatusFilter) ||
      (selectedStatusFilter === "TERSEDIA" && truck.status.toUpperCase() === "TERSEDIA");

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      truck.platNomor.toLowerCase().includes(query) ||
      truck.driverName.toLowerCase().includes(query) ||
      truck.fo.toLowerCase().includes(query) ||
      truck.dn.toLowerCase().includes(query) ||
      truck.noContainer.toLowerCase().includes(query) ||
      truck.status.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Mirror Status Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-blue-900/50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                MIRRORING LIVE DATA ACTIVE
              </span>
              <a
                href="https://monitoring-kontrak-export.web.app/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-blue-300 hover:text-white underline font-medium transition-colors"
              >
                monitoring-kontrak-export.web.app
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-white">
              Halo, <span className="text-blue-400">{mirror.vendorName}!</span> 🚚
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Syncing..." : "Sinkronkan Sekarang"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Main Stat Cards matching TikPro Screenshot 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL ARMADA TERDAFTAR */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 rounded-2xl shadow-md border border-blue-500/30 flex items-center justify-between relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01]">
          <div>
            <span className="text-3xl sm:text-4xl font-black tracking-tight leading-none block">{mirror.totalArmadaTerdaftar ?? 46}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100 mt-2 block">TOTAL ARMADA TERDAFTAR</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: DALAM TUGAS (ALOKASI) */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-5 rounded-2xl shadow-md border border-emerald-500/30 flex items-center justify-between relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01]">
          <div>
            <span className="text-3xl sm:text-4xl font-black tracking-tight leading-none block">{mirror.dalamTugasAlokasi ?? 10}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 mt-2 block">DALAM TUGAS (ALOKASI)</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: STANDBY (TERSEDIA) */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-5 rounded-2xl shadow-md border border-amber-500/30 flex items-center justify-between relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01]">
          <div>
            <span className="text-3xl sm:text-4xl font-black tracking-tight leading-none block">{mirror.standbyTersedia ?? 36}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100 mt-2 block">STANDBY (TERSEDIA)</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: TOTAL VENDOR MITRA */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-5 rounded-2xl shadow-md border border-purple-500/30 flex items-center justify-between relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01]">
          <div>
            <span className="text-3xl sm:text-4xl font-black tracking-tight leading-none block">{mirror.totalVendorMitra}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-100 mt-2 block">TOTAL VENDOR MITRA</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
            <Building className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Rincian Status Armada (14 Detailed Grid Cards matching TikPro Screenshot 1) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-gray-900 dark:text-slate-100">Rincian Status Armada</h4>
              <p className="text-xs text-gray-400 dark:text-slate-400 font-medium">Klik pada status untuk memfilter data armada</p>
            </div>
          </div>

          {selectedStatusFilter !== "ALL" && (
            <button
              onClick={() => setSelectedStatusFilter("ALL")}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-slate-700 hover:bg-blue-100 transition-colors self-start sm:self-auto cursor-pointer"
            >
              Reset Filter Status ({selectedStatusFilter})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {statusCards.map((card) => {
            const Icon = card.icon;
            const isSelected = selectedStatusFilter === card.key;

            return (
              <button
                key={card.key}
                onClick={() => setSelectedStatusFilter(isSelected ? "ALL" : card.key)}
                className={`flex items-center justify-between p-3.5 rounded-xl border-l-4 ${card.borderCol} border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 transition-all text-left shadow-xs hover:shadow-md hover:scale-[1.02] cursor-pointer ${
                  isSelected ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/40 dark:bg-blue-950/30" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 pr-2">
                  <div className={`p-1.5 rounded-lg ${card.bgCol} ${card.textCol}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase text-gray-700 dark:text-slate-200 tracking-tight leading-tight">
                    {card.label}
                  </span>
                </div>
                <span className={`text-xl font-black ${card.textCol} tracking-tight shrink-0`}>
                  {card.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fleet Live Details Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-black text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span>{viewMode === "SUMMARY" ? "Summary Report Armada TikPro" : "Daftar Live Armada"} ({filteredTrucks.length})</span>
              {selectedStatusFilter !== "ALL" && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-0.5 rounded-full">
                  Status: {selectedStatusFilter}
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 dark:text-slate-400 font-medium">
              <span>Mirroring dari monitoring-kontrak-export.web.app</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Real-time Sync Active
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode("SUMMARY")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  viewMode === "SUMMARY"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-slate-200"
                }`}
              >
                Summary Report
              </button>
              <button
                onClick={() => setViewMode("DAFTAR")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  viewMode === "DAFTAR"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-slate-200"
                }`}
              >
                Daftar Armada
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari plat, driver, FO, DN..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {viewMode === "SUMMARY" ? (
                <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 font-bold border-b border-gray-200 dark:border-slate-700">
                  <th className="p-3 w-10 text-center">No.</th>
                  <th className="p-3">Plat Nomor</th>
                  <th className="p-3">Status Terkini</th>
                  <th className="p-3">Nomor FO</th>
                  <th className="p-3">DN</th>
                  <th className="p-3">No Cont</th>
                  <th className="p-3">Lokasi Muat</th>
                  <th className="p-3">Timbang 1</th>
                  <th className="p-3">Timbang 2</th>
                  <th className="p-3">Last Update</th>
                </tr>
              ) : (
                <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 font-bold border-b border-gray-200 dark:border-slate-700">
                  <th className="p-3 w-10 text-center">No.</th>
                  <th className="p-3">Plat Nomor</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Status Armada</th>
                  <th className="p-3">Driver & No. HP</th>
                  <th className="p-3">Jenis Truck</th>
                  <th className="p-3">FO / DN</th>
                  <th className="p-3">No. Container</th>
                  <th className="p-3">Terakhir Update</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-800 dark:text-slate-200">
              {filteredTrucks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-400 dark:text-slate-500 font-semibold">
                    Tidak ada data armada yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTrucks.map((truck, idx) => (
                  <tr key={truck.id ? `${truck.id}_${idx}` : `tikpro-${idx}`} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 text-center font-bold text-gray-400 dark:text-slate-500 text-xs">
                      {idx + 1}
                    </td>
                    <td className="p-3 font-black text-blue-600 dark:text-blue-400 text-sm whitespace-nowrap">
                      {truck.platNomor}
                    </td>

                    {viewMode === "SUMMARY" ? (
                      <>
                        <td className="p-3">
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-black bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 whitespace-nowrap">
                            {truck.status}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-gray-800 dark:text-slate-200">{truck.fo}</td>
                        <td className="p-3 font-medium text-gray-600 dark:text-slate-400">{truck.dn}</td>
                        <td className="p-3 font-bold text-gray-800 dark:text-slate-200">{truck.noContainer}</td>
                        <td className="p-3 font-medium text-gray-600 dark:text-slate-400">{truck.lokasiMuat || "-"}</td>
                        <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400 whitespace-nowrap">{truck.timbang1 || "-"}</td>
                        <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400 whitespace-nowrap">{truck.timbang2 || "-"}</td>
                        <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400 whitespace-nowrap">{truck.terakhirUpdate}</td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 font-bold text-gray-700 dark:text-slate-300">
                          {truck.vendor}
                        </td>
                        <td className="p-3">
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-black bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 whitespace-nowrap">
                            {truck.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-gray-900 dark:text-slate-100">{truck.driverName}</div>
                          {truck.phone !== "-" && (
                            <div className="text-[10px] text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{truck.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-gray-600 dark:text-slate-400 font-medium">
                          {truck.jenisMobil}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-xs text-gray-800 dark:text-slate-200">FO: {truck.fo}</div>
                          <div className="text-[10px] text-gray-500 dark:text-slate-400">DN: {truck.dn}</div>
                        </td>
                        <td className="p-3 font-bold text-gray-700 dark:text-slate-300">
                          {truck.noContainer}
                        </td>
                        <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400 whitespace-nowrap">
                          {truck.terakhirUpdate}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
