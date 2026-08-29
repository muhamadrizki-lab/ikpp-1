import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, FileSpreadsheet, Calendar, User, MapPin, Truck, Hash, Tag, Info, Download } from "lucide-react";
import { Order, Shipment } from "../types";
import { formatJobOrderCode } from "../lib/statusMapper";
import StatusBadge from "./StatusBadge";
import { getFreightServiceType } from "../lib/freightLookup";

export function isRepoPdtItem(item: any): boolean {
  if (!item) return false;
  const cr = (item.commercialRoute || "").toLowerCase();
  const text = `${cr} ${item.origin || ""} ${item.destination || ""} ${item.notes || ""} ${item.noJobOrder || ""} ${item.orderRef || ""} ${item.id || ""} ${item.unit || ""}`.toLowerCase();
  return (
    cr.includes("pancaran") ||
    cr.includes("0 - 36") ||
    cr.includes("0-36") ||
    cr.includes("pdt") ||
    cr.includes("depo pdt") ||
    text.includes("depo around priok") ||
    text.includes("depo arround priok") ||
    text.includes("pancaran depo") ||
    text.includes("0 - 36") ||
    text.includes("0-36") ||
    text.includes("repo pdt")
  );
}

function PoolingBadge({ status }: { status?: string }) {
  const val = (status || "NEED ACTION").toUpperCase().trim();
  if (val.includes("CONFIRM")) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        CONFIRM
      </span>
    );
  }
  if (val.includes("CANCEL")) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        CANCEL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
      NEED ACTION
    </span>
  );
}

function CSStatusBadge({ status }: { status?: string }) {
  const val = (status || "WAITING CONFIRM").toUpperCase().trim();
  let badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
  let dotStyle = "bg-emerald-500";

  if (val.includes("CANCEL") || val.includes("BATAL") || val.includes("REJECT")) {
    badgeStyle = "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
    dotStyle = "bg-rose-500";
  } else if (val.includes("JOB") || val.includes("TRIP") || val.includes("TRANSIT") || val.includes("JALAN") || val.includes("TILA")) {
    badgeStyle = "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800";
    dotStyle = "bg-sky-500";
  } else if (val.includes("WAITING") || val.includes("CONFIRM")) {
    badgeStyle = "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    dotStyle = "bg-amber-500";
  } else if (val.includes("FINISH") || val.includes("FIN") || val.includes("DONE") || val.includes("COMPLETE")) {
    badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
    dotStyle = "bg-emerald-500";
  } else if (val.includes("PLANNING") || val.includes("OPR")) {
    badgeStyle = "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800";
    dotStyle = "bg-indigo-500";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badgeStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyle}`} />
      <span>{val}</span>
    </span>
  );
}

interface DetailListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  data: (Order | Shipment)[];
  dataType?: "order" | "shipment";
}

export default function DetailListModal({
  isOpen,
  onClose,
  title,
  subtitle,
  data,
  dataType = "order",
}: DetailListModalProps) {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase().trim();
    return data.filter((item: any) => {
      const id = String(item.id || "").toLowerCase();
      const job = String(item.noJobOrder || item.orderRef || "").toLowerCase();
      const customer = String(item.customer || "").toLowerCase();
      const origin = String(item.origin || "").toLowerCase();
      const dest = String(item.destination || "").toLowerCase();
      const driver = String(item.driver || "").toLowerCase();
      const unit = String(item.unitType || item.unit || "").toLowerCase();
      const cs = String(item.lastUpdateCS || "").toLowerCase();
      const pooling = String(item.statusPooling || "").toLowerCase();
      const cr = String(item.commercialRoute || "").toLowerCase();

      return (
        id.includes(q) ||
        job.includes(q) ||
        customer.includes(q) ||
        origin.includes(q) ||
        dest.includes(q) ||
        driver.includes(q) ||
        unit.includes(q) ||
        cs.includes(q) ||
        pooling.includes(q) ||
        cr.includes(q)
      );
    });
  }, [data, search]);

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers =
      dataType === "order"
        ? ["ID Shipment", "No Job Order", "Type", "Commercial Route", "Status Pooling", "Last Update CS", "Req. Stuffing / Ondock", "Booking Date"]
        : ["Shipment ID", "No Job Order", "Type", "Commercial Route", "Status Trip", "Last Update CS", "Req. Stuffing / Ondock", "Booking Date"];

    const rows = filteredData.map((item: any) => {
      const effType = getFreightServiceType(item);
      const commRoute = item.commercialRoute || (effType === "REPO EMPTY" ? "Depo Arround Priok - Pancaran Depo - 0 - 36" : `${item.origin || ""} - ${item.destination || ""}`);

      if (dataType === "order") {
        return [
          item.id || "",
          item.noJobOrder || "",
          effType,
          commRoute,
          item.statusPooling || "",
          item.lastUpdateCS || "",
          item.requestStuffing || "",
          item.bookingDate || "",
        ];
      } else {
        return [
          item.id || "",
          item.orderRef || item.noJobOrder || "",
          effType,
          commRoute,
          item.tripStatus || "",
          item.lastUpdateCS || "",
          item.requestStuffing || "",
          item.bookingDate || "",
        ];
      }
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Detail_${title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-bold">
                  <Hash className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {title}
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-sky-600 text-white">
                      {filteredData.length} Item
                    </span>
                  </h3>
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-xl transition-colors cursor-pointer"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Job Order, Customer, CS Update, Status, Commercial Route..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Table content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredData.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-semibold text-sm">
                No data matched the criteria.
              </div>
            ) : dataType === "order" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5 rounded-l-xl">ID Shipment</th>
                      <th className="px-3 py-2.5">No Job Order</th>
                      <th className="px-3 py-2.5">Type</th>
                      <th className="px-3 py-2.5">Commercial Route</th>
                      <th className="px-3 py-2.5">Status Pooling</th>
                      <th className="px-3 py-2.5">Req. Stuffing / Ondock</th>
                      <th className="px-3 py-2.5 rounded-r-xl">Booking Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredData.map((item: any, idx) => {
                      const effType = getFreightServiceType(item);
                      const commRoute = item.commercialRoute || (effType === "REPO EMPTY" ? "Depo Arround Priok - Pancaran Depo - 0 - 36" : "");

                      return (
                        <tr key={item.uniqueKey || `modal-pool-${item.id || "item"}-${idx}`} className="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-3 py-2.5 font-mono font-bold text-sky-900 dark:text-sky-300 whitespace-nowrap">
                            {item.id || ""}
                          </td>
                          <td className="px-3 py-2.5 font-mono font-extrabold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {item.noJobOrder || ""}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <StatusBadge status={effType} />
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {effType === "REPO EMPTY" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-purple-50 text-purple-900 dark:bg-purple-950/70 dark:text-purple-200 border border-purple-200/80 dark:border-purple-800/80 shadow-2xs">
                                <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                {commRoute}
                              </span>
                            ) : commRoute ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                {commRoute}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">
                                {item.origin && item.destination ? `${item.origin} ➔ ${item.destination}` : "-"}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <PoolingBadge status={item.statusPooling} />
                          </td>
                          <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                            {item.requestStuffing || "-"}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">
                            {item.bookingDate || ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5 rounded-l-xl">Shipment ID</th>
                      <th className="px-3 py-2.5">No Job Order</th>
                      <th className="px-3 py-2.5">Type</th>
                      <th className="px-3 py-2.5">Commercial Route</th>
                      <th className="px-3 py-2.5">Last Update CS</th>
                      <th className="px-3 py-2.5">Trip Status</th>
                      <th className="px-3 py-2.5">Req. Stuffing / Ondock</th>
                      <th className="px-3 py-2.5 rounded-r-xl">Booking Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredData.map((item: any, idx) => {
                      const effType = getFreightServiceType(item);
                      const commRoute = item.commercialRoute || (effType === "REPO EMPTY" ? "Depo Arround Priok - Pancaran Depo - 0 - 36" : "");

                      return (
                        <tr key={item.uniqueKey || `modal-ship-${item.id || "ship"}-${idx}`} className="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-3 py-2.5 font-mono font-bold text-sky-900 dark:text-sky-300 whitespace-nowrap">
                            {item.id}
                          </td>
                          <td className="px-3 py-2.5 font-mono font-extrabold text-blue-900 dark:text-sky-300 whitespace-nowrap">
                            {formatJobOrderCode(item.orderRef || item.noJobOrder) || ""}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <StatusBadge status={effType} />
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {effType === "REPO EMPTY" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-purple-50 text-purple-900 dark:bg-purple-950/70 dark:text-purple-200 border border-purple-200/80 dark:border-purple-800/80 shadow-2xs">
                                <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                {commRoute}
                              </span>
                            ) : commRoute ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                {commRoute}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">
                                {item.origin && item.destination ? `${item.origin} ➔ ${item.destination}` : "-"}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">
                            <CSStatusBadge status={item.lastUpdateCS || item.csStatus || "WAITING CONFIRM"} />
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <StatusBadge status={item.tripStatus || "pre_trip"} />
                          </td>
                          <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                            {item.requestStuffing || "-"}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">
                            {item.bookingDate || ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              Showing {filteredData.length} of {data.length} total rows
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

