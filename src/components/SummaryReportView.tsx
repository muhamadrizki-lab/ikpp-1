import React, { useState } from "react";
import { TruckDoc, MasterStatusDoc } from "../lib/firebase";
import {
  Truck,
  Wrench,
  Clock,
  Building,
  CheckCircle2,
  Ship,
  FileEdit,
  Hourglass,
  UserX,
  MapPin,
  Package,
  CreditCard,
  Search,
  RotateCw,
  Info,
  X
} from "lucide-react";

interface SummaryReportViewProps {
  trucks: TruckDoc[];
  masterStatuses: MasterStatusDoc[];
  vendorName: string;
  userRole: string;
  lastSyncTime: string;
  onOpenStatusModal?: (statusName: string) => void;
}

export default function SummaryReportView({
  trucks,
  masterStatuses,
  vendorName,
  userRole,
  lastSyncTime,
  onOpenStatusModal
}: SummaryReportViewProps) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModal, setActiveModal] = useState<{ title: string; category: string } | null>(null);
  const [modalSearch, setModalSearch] = useState<string>("");

  // Total Metric Calculations
  const totalTruck = trucks.length;
  const alokasi = trucks.filter(
    (t) => (t.status || "").toLowerCase() !== "tersedia" && (t.status || "").toLowerCase() !== "standby"
  ).length;
  const belum = trucks.filter(
    (t) => (t.status || "").toLowerCase() === "tersedia" || (t.status || "").toLowerCase() === "standby"
  ).length;
  const totalVendor = new Set(trucks.map((t) => t.vendor).filter(Boolean)).size || 1;

  // Standard 14 Statuses fallback list if masterStatuses is empty
  const defaultStatusList = [
    "TERSEDIA",
    "MUAT DEPO",
    "OTW IKK",
    "DAFTAR DCO - ESTIMASI",
    "GUDANG ANTRI MUAT",
    "OTW PELABUHAN",
    "BONGKAR PORT / DONE",
    "STORING / LAKA",
    "NO DRIVER",
    "TUNGGU LOKASI",
    "GROUNDING",
    "REPO FULL",
    "REPO EMPTY",
    "TUNGGU KARTU EKSPOR"
  ];

  const statusNames = masterStatuses.length > 0 ? masterStatuses.map((s) => s.name) : defaultStatusList;

  // Helper filter logic for both page table and modal table
  const filterTrucksByCategory = (list: TruckDoc[], category: string, queryText: string) => {
    return list.filter((truck) => {
      const statusUpper = (truck.status || "").toUpperCase();
      const catUpper = category.toUpperCase();

      let matchesCategory = false;
      if (catUpper === "ALL" || catUpper === "TOTAL ARMADA TERDAFTAR" || catUpper === "VENDOR") {
        matchesCategory = true;
      } else if (catUpper === "ALOKASI" || catUpper === "DALAM TUGAS (ALOKASI)") {
        matchesCategory = statusUpper !== "TERSEDIA" && statusUpper !== "STANDBY";
      } else if (catUpper === "TERSEDIA" || catUpper === "STANDBY (TERSEDIA)") {
        matchesCategory = statusUpper === "TERSEDIA" || statusUpper === "STANDBY";
      } else {
        matchesCategory =
          statusUpper === catUpper ||
          (catUpper.includes("TERSEDIA") && (statusUpper === "TERSEDIA" || statusUpper === "STANDBY"));
      }

      const q = queryText.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (truck.plat_nomor || "").toLowerCase().includes(q) ||
        (truck.nama_driver || "").toLowerCase().includes(q) ||
        (truck.vendor || "").toLowerCase().includes(q) ||
        (truck.fo || "").toLowerCase().includes(q) ||
        (truck.dn || "").toLowerCase().includes(q) ||
        (truck.no_container || "").toLowerCase().includes(q) ||
        (truck.lokasi_muat || "").toLowerCase().includes(q) ||
        (truck.status || "").toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  };

  // Filter trucks list based on selected status & search query
  const filteredTrucks = filterTrucksByCategory(trucks, selectedStatusFilter, searchQuery);

  const handleCardClick = (title: string, category: string) => {
    setSelectedStatusFilter(category);
    setActiveModal({ title, category });
    setModalSearch("");
    if (onOpenStatusModal) {
      onOpenStatusModal(category);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("tersedia") || s.includes("standby"))
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300";
    if (s.includes("otw mill") || s.includes("otw ikk"))
      return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300";
    if (s.includes("antri muat") || s.includes("gudang"))
      return "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300";
    if (s.includes("otw pelabuhan") || s.includes("customer"))
      return "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300";
    if (s.includes("storing") || s.includes("laka"))
      return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300";
    if (s.includes("kartu") || s.includes("ekspor"))
      return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300";
    return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-slate-800 dark:text-slate-300";
  };

  const modalTrucks = activeModal
    ? filterTrucksByCategory(trucks, activeModal.category, modalSearch)
    : [];

  return (
    <div className="space-y-6">
      {/* Realtime Live Header Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 shadow-md border border-blue-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE FIRESTORE REALTIME SYNC (EXPORT-IKK)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Summary Report <span className="text-blue-400">IKPP Kontrak Export</span> 🚛
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Vendor: <strong className="text-white">{vendorName}</strong> | Role:{" "}
            <span className="uppercase text-blue-300 font-bold">{userRole}</span>
          </p>
        </div>
      </div>

      {/* 4 Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Armada */}
        <div
          onClick={() => handleCardClick("Total Armada Terdaftar", "ALL")}
          className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 rounded-2xl shadow-sm border border-blue-500/30 flex items-center justify-between cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
        >
          <div>
            <span className="text-3xl sm:text-4xl font-black tracking-tight block leading-none">{totalTruck}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100 mt-2 block">
              TOTAL ARMADA TERDAFTAR
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Dalam Tugas (Alokasi) */}
        <div
          onClick={() => handleCardClick("Dalam Tugas (Alokasi)", "ALOKASI")}
          className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-5 rounded-2xl shadow-sm border border-emerald-500/30 flex items-center justify-between cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
        >
          <div>
            <span className="text-3xl sm:text-4xl font-black tracking-tight block leading-none">{alokasi}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 mt-2 block">
              DALAM TUGAS (ALOKASI)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Standby (Tersedia) */}
        <div
          onClick={() => handleCardClick("Standby (Tersedia)", "TERSEDIA")}
          className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-5 rounded-2xl shadow-sm border border-amber-500/30 flex items-center justify-between cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
        >
          <div>
            <span className="text-3xl sm:text-4xl font-black tracking-tight block leading-none">{belum}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-100 mt-2 block">
              STANDBY (TERSEDIA)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total Vendor Mitra */}
        <div
          onClick={() => handleCardClick("Total Vendor Mitra", "VENDOR")}
          className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-5 rounded-2xl shadow-sm border border-purple-500/30 flex items-center justify-between cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
        >
          <div>
            <span className="text-3xl sm:text-4xl font-black tracking-tight block leading-none">{totalVendor}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-100 mt-2 block">
              TOTAL VENDOR MITRA
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
            <Building className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Rincian Status Armada (14 Status Split Cards) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-slate-100">Rincian Status Armada</h3>
              <p className="text-xs text-gray-400 dark:text-slate-400 font-medium">
                Klik kartu status mana saja untuk melihat detail data armada secara lengkap
              </p>
            </div>
          </div>

          {selectedStatusFilter !== "ALL" && (
            <button
              onClick={() => setSelectedStatusFilter("ALL")}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-blue-200 dark:border-slate-700 hover:bg-blue-100 transition-colors self-start sm:self-auto cursor-pointer"
            >
              Reset Filter ({selectedStatusFilter})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {statusNames.map((sName) => {
            const count = trucks.filter(
              (t) =>
                (t.status || "").toLowerCase() === sName.toLowerCase() ||
                (sName.toUpperCase() === "TERSEDIA" && (t.status || "").toLowerCase() === "standby")
            ).length;

            const isSelected = selectedStatusFilter.toUpperCase() === sName.toUpperCase();

            return (
              <button
                key={sName}
                onClick={() => handleCardClick(sName, sName)}
                className={`flex items-center justify-between p-3.5 rounded-xl border-l-4 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all text-left shadow-xs hover:shadow-md hover:scale-[1.02] cursor-pointer ${
                  sName.toUpperCase().includes("TERSEDIA")
                    ? "border-l-emerald-500"
                    : sName.toUpperCase().includes("OTW PELABUHAN")
                    ? "border-l-cyan-500"
                    : sName.toUpperCase().includes("STORING")
                    ? "border-l-rose-500"
                    : sName.toUpperCase().includes("KARTU")
                    ? "border-l-purple-500"
                    : "border-l-blue-500"
                } ${isSelected ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/40" : ""}`}
              >
                <span className="text-xs font-black uppercase text-gray-700 dark:text-slate-200 tracking-tight">
                  {sName}
                </span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 shrink-0 ml-2">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Report Live Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span>Table Summary Report Armada ({filteredTrucks.length})</span>
              {selectedStatusFilter !== "ALL" && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-0.5 rounded-full">
                  Status: {selectedStatusFilter}
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 font-medium">
              Data terhubung langsung dengan database Firestore export-ikk
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari plat, FO, DN, container..."
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 font-bold border-b border-gray-200 dark:border-slate-700">
                <th className="p-3 w-10 text-center">No.</th>
                <th className="p-3">Plat Nomor</th>
                <th className="p-3">Status Terkini</th>
                <th className="p-3">Nomor FO</th>
                <th className="p-3">DN</th>
                <th className="p-3">No. Container</th>
                <th className="p-3">Lokasi Muat</th>
                <th className="p-3">Timbang 1</th>
                <th className="p-3">Timbang 2</th>
                <th className="p-3">Terakhir Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-800 dark:text-slate-200">
              {filteredTrucks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-400 dark:text-slate-500 font-semibold">
                    Tidak ada data armada yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredTrucks.map((truck, idx) => (
                  <tr key={truck.id ? `${truck.id}_${idx}` : `truck-${idx}`} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 text-center font-bold text-gray-400 dark:text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-black text-blue-600 dark:text-blue-400 text-sm whitespace-nowrap">
                      {truck.plat_nomor}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-black border whitespace-nowrap ${getStatusBadgeStyle(
                          truck.status
                        )}`}
                      >
                        {truck.status || "TERSEDIA"}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-gray-800 dark:text-slate-200">{truck.fo || "-"}</td>
                    <td className="p-3 font-medium text-gray-600 dark:text-slate-400">{truck.dn || "-"}</td>
                    <td className="p-3 font-bold text-gray-800 dark:text-slate-200">{truck.no_container || "-"}</td>
                    <td className="p-3 font-medium text-gray-600 dark:text-slate-400">{truck.lokasi_muat || "-"}</td>
                    <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      {truck.tgl_timbang_1 ? new Date(truck.tgl_timbang_1).toLocaleString("id-ID") : "-"}
                    </td>
                    <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      {truck.tgl_timbang_2 ? new Date(truck.tgl_timbang_2).toLocaleString("id-ID") : "-"}
                    </td>
                    <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      {truck.terakhir_update
                        ? typeof truck.terakhir_update === "number"
                          ? new Date(truck.terakhir_update).toLocaleString("id-ID")
                          : truck.terakhir_update
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Data Modal Popup when a card is clicked */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-400/30 text-blue-300">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">Detail Data Armada</h3>
                    <span className="bg-blue-600 text-white text-xs font-black px-3 py-0.5 rounded-full shadow-xs uppercase">
                      {activeModal.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Total Ditemukan: <strong className="text-emerald-400 font-black">{modalTrucks.length} Armada</strong> | Realtime Firestore sync (export-ikk)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Quick Filter */}
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Cari plat nomor, driver, vendor, FO, DN, container..."
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
              <div className="text-xs font-bold text-gray-500 dark:text-slate-400 flex items-center gap-2 self-end sm:self-auto">
                <span>Filter Kategori: <b className="text-blue-600 dark:text-blue-400">{activeModal.category}</b></span>
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-bold border-b border-gray-200 dark:border-slate-700">
                      <th className="p-3 w-10 text-center">No.</th>
                      <th className="p-3">Plat Nomor</th>
                      <th className="p-3">Status Terkini</th>
                      <th className="p-3">Vendor</th>
                      <th className="p-3">Nama Driver</th>
                      <th className="p-3">Nomor FO</th>
                      <th className="p-3">DN</th>
                      <th className="p-3">No. Container</th>
                      <th className="p-3">Lokasi Muat</th>
                      <th className="p-3">Timbang 1</th>
                      <th className="p-3">Timbang 2</th>
                      <th className="p-3">Terakhir Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-800 dark:text-slate-200">
                    {modalTrucks.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="p-8 text-center text-gray-400 dark:text-slate-500 font-semibold">
                          Tidak ada data armada yang ditemukan untuk filter ini.
                        </td>
                      </tr>
                    ) : (
                      modalTrucks.map((truck, idx) => (
                        <tr key={truck.id || idx} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="p-3 text-center font-bold text-gray-400 dark:text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-black text-blue-600 dark:text-blue-400 text-sm whitespace-nowrap">
                            {truck.plat_nomor}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-black border whitespace-nowrap ${getStatusBadgeStyle(
                                truck.status
                              )}`}
                            >
                              {truck.status || "TERSEDIA"}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-gray-700 dark:text-slate-300">{truck.vendor || vendorName || "-"}</td>
                          <td className="p-3 font-medium text-gray-800 dark:text-slate-200">{truck.nama_driver || "-"}</td>
                          <td className="p-3 font-bold text-gray-800 dark:text-slate-200">{truck.fo || "-"}</td>
                          <td className="p-3 font-medium text-gray-600 dark:text-slate-400">{truck.dn || "-"}</td>
                          <td className="p-3 font-bold text-gray-800 dark:text-slate-200">{truck.no_container || "-"}</td>
                          <td className="p-3 font-medium text-gray-600 dark:text-slate-400">{truck.lokasi_muat || "-"}</td>
                          <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400 whitespace-nowrap">
                            {truck.tgl_timbang_1 ? new Date(truck.tgl_timbang_1).toLocaleString("id-ID") : "-"}
                          </td>
                          <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400 whitespace-nowrap">
                            {truck.tgl_timbang_2 ? new Date(truck.tgl_timbang_2).toLocaleString("id-ID") : "-"}
                          </td>
                          <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400 whitespace-nowrap">
                            {truck.terakhir_update
                              ? typeof truck.terakhir_update === "number"
                                ? new Date(truck.terakhir_update).toLocaleString("id-ID")
                                : truck.terakhir_update
                              : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-400 dark:text-slate-400 font-medium">
                Data internal real-time disinkronkan langsung dari Firestore (export-ikk).
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-colors cursor-pointer"
              >
                Tutup Detail Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
