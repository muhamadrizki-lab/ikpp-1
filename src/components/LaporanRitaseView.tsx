import React, { useState, useRef } from "react";
import { RitaseDoc, MasterJenisProdukDoc } from "../lib/firebase";
import DateRangeFilter, { DateFilterState } from "./DateRangeFilter";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import {
  FileText,
  Download,
  Image,
  Filter,
  Search,
  Calendar,
  Truck,
  CheckCircle2
} from "lucide-react";

interface LaporanRitaseViewProps {
  ritase: RitaseDoc[];
  masterJenisProduk: MasterJenisProdukDoc[];
  vendorName: string;
}

export default function LaporanRitaseView({
  ritase,
  masterJenisProduk,
  vendorName
}: LaporanRitaseViewProps) {
  const [dateFilter, setDateFilter] = useState<DateFilterState>({
    startDate: "",
    endDate: "",
    preset: "auto"
  });
  const [vendorFilter, setVendorFilter] = useState<string>("ALL");
  const [productFilter, setProductFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tableRef = useRef<HTMLDivElement>(null);

  // Filter Ritase
  const filteredRitase = ritase.filter((r) => {
    // Date filter
    if (dateFilter.startDate) {
      const s = new Date(dateFilter.startDate).getTime();
      if (r.tgl_selesai < s) return false;
    }
    if (dateFilter.endDate) {
      const e = new Date(dateFilter.endDate).getTime() + 86400000;
      if (r.tgl_selesai > e) return false;
    }

    // Vendor filter
    if (vendorFilter !== "ALL" && (r.vendor || "").toLowerCase() !== vendorFilter.toLowerCase()) {
      return false;
    }

    // Product filter
    if (productFilter !== "ALL" && (r.jenis_produk || "").toLowerCase() !== productFilter.toLowerCase()) {
      return false;
    }

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matches =
        (r.plat_nomor || "").toLowerCase().includes(q) ||
        (r.nama_driver || "").toLowerCase().includes(q) ||
        (r.fo || "").toLowerCase().includes(q) ||
        (r.dn || "").toLowerCase().includes(q) ||
        (r.no_container || "").toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  // Unique vendors in ritase
  const uniqueVendors = Array.from(new Set(ritase.map((r) => r.vendor).filter(Boolean)));

  // Export Excel Function
  const handleExportExcel = () => {
    const dataToExport = filteredRitase.map((r, idx) => ({
      "No": idx + 1,
      "Tgl Selesai": r.tgl_selesai ? new Date(r.tgl_selesai).toLocaleString("id-ID") : "-",
      "Vendor": r.vendor || "-",
      "Plat Nomor": r.plat_nomor || "-",
      "Driver": r.nama_driver || "-",
      "No HP": r.no_hp || "-",
      "Jenis Mobil": r.jenis_mobil || "-",
      "FO": r.fo || "-",
      "DN": r.dn || "-",
      "No Container": r.no_container || "-",
      "Jenis Produk": r.jenis_produk || "-",
      "Tiba di IKK": r.daftar_dco || "-",
      "Timbang 1": r.tgl_timbang_1 || "-",
      "Timbang 2": r.tgl_timbang_2 || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Ritase");
    XLSX.writeFile(workbook, `Laporan_Ritase_Export_IKK_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export Image Function
  const handleExportImage = async () => {
    if (!tableRef.current) return;
    try {
      const canvas = await html2canvas(tableRef.current, { scale: 2 });
      const link = document.createElement("a");
      link.download = `Laporan_Ritase_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export image error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <span>Laporan Historical Ritase Export</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
              {filteredRitase.length} Ritase
            </span>
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-400">
            Arsip lengkap pengiriman kontainer yang telah selesai diantar ke pelabuhan / pelabuhan tujuan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportImage}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Image className="w-4 h-4" />
            <span>Export Gambar (.png)</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-end gap-3 text-xs">
        <div>
          <label className="block font-bold text-gray-500 dark:text-slate-400 mb-1">Filter Tanggal Booking / Ritase:</label>
          <DateRangeFilter
            value={dateFilter}
            onChange={setDateFilter}
            align="left"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-500 dark:text-slate-400 mb-1">Filter Vendor:</label>
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="w-full p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-medium"
          >
            <option value="ALL">SEMUA VENDOR</option>
            {uniqueVendors.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-gray-500 dark:text-slate-400 mb-1">Jenis Produk:</label>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="w-full p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-medium"
          >
            <option value="ALL">SEMUA PRODUK</option>
            {masterJenisProduk.map((jp) => (
              <option key={jp.id} value={jp.name}>
                {jp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 md:col-span-1">
          <label className="block font-bold text-gray-500 dark:text-slate-400 mb-1">Pencarian Teks:</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Plat, Driver, FO..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Ritase Data Table */}
      <div ref={tableRef} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 font-bold border-b border-gray-200 dark:border-slate-700">
                <th className="p-3 w-10 text-center">No.</th>
                <th className="p-3">Tanggal Selesai</th>
                <th className="p-3">Plat Nomor</th>
                <th className="p-3">Vendor</th>
                <th className="p-3">Driver & Kontak</th>
                <th className="p-3">Nomor FO</th>
                <th className="p-3">DN</th>
                <th className="p-3">No. Container</th>
                <th className="p-3">Jenis Produk</th>
                <th className="p-3">Timbang 1</th>
                <th className="p-3">Timbang 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-800 dark:text-slate-200">
              {filteredRitase.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-gray-400 dark:text-slate-500 font-semibold">
                    Belum ada data laporan ritase yang cocok.
                  </td>
                </tr>
              ) : (
                filteredRitase.map((r, idx) => (
                  <tr key={r.id ? `${r.id}_${idx}` : `ritase-${idx}`} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 text-center font-bold text-gray-400 dark:text-slate-500">{idx + 1}</td>
                    <td className="p-3 text-[11px] font-medium text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      {r.tgl_selesai ? new Date(r.tgl_selesai).toLocaleString("id-ID") : "-"}
                    </td>
                    <td className="p-3 font-black text-blue-600 dark:text-blue-400 text-sm whitespace-nowrap">
                      {r.plat_nomor}
                    </td>
                    <td className="p-3 font-bold text-gray-700 dark:text-slate-300">{r.vendor || "-"}</td>
                    <td className="p-3 font-medium">
                      <div className="font-bold text-gray-900 dark:text-slate-100">{r.nama_driver || "-"}</div>
                      {r.no_hp && <div className="text-[10px] text-gray-500">{r.no_hp}</div>}
                    </td>
                    <td className="p-3 font-bold text-gray-800 dark:text-slate-200">{r.fo || "-"}</td>
                    <td className="p-3 font-medium text-gray-600 dark:text-slate-400">{r.dn || "-"}</td>
                    <td className="p-3 font-bold text-gray-800 dark:text-slate-200">{r.no_container || "-"}</td>
                    <td className="p-3 font-medium text-gray-700 dark:text-slate-300">{r.jenis_produk || "-"}</td>
                    <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400 whitespace-nowrap">{r.tgl_timbang_1 || "-"}</td>
                    <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400 whitespace-nowrap">{r.tgl_timbang_2 || "-"}</td>
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
