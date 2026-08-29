import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, AlertCircle, ShoppingCart, RefreshCw, X, ArrowRight, Eye, Calendar, Clock, Plus, CheckCircle2, Truck, UserCheck, ShieldCheck, FileSpreadsheet, ExternalLink, Database, Sliders, Layers } from "lucide-react";
import StatCard from "../components/StatCard";
import DataTable, { Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import SheetManagerModal, { DEFAULT_SHEET_SOURCES } from "../components/SheetManagerModal";
import DateRangeFilter, { DateFilterState, filterByDate, parseBookingDate, formatDateIndo } from "../components/DateRangeFilter";
import { dummyOrders } from "../lib/dummy-data";
import { Order, OrderType, OrderStatus, SheetSource, UserAccount } from "../types";
import { fetchLiveOrdersClient, fetchExecutedShipmentsClient } from "../lib/fetchOrdersClient";
import { SINARMAS_POOLING_ORDERS } from "../data/sinarmasOrdersData";
import { SINARMAS_EXECUTED_SHIPMENTS } from "../data/sinarmasShipmentsData";
import { formatJobOrderCode, mapCSStatus } from "../lib/statusMapper";
import DetailListModal from "../components/DetailListModal";
import { getFreightServiceType } from "../lib/freightLookup";

interface OrderProps {
  initialTypeFilter?: string;
  onClearInitialFilter?: () => void;
  currentUser?: UserAccount | null;
}

function CSStatusBadge({ status }: { status?: string }) {
  const val = (status || "WAITING CONFIRM").toUpperCase().trim();

  let badgeStyle = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  let dotStyle = "bg-emerald-500";

  if (val.includes("CANCEL") || val.includes("BATAL") || val.includes("REJECT")) {
    badgeStyle = "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800";
    dotStyle = "bg-rose-500";
  } else if (val.includes("JOB") || val.includes("TRIP") || val.includes("TRANSIT") || val.includes("JALAN") || val.includes("TILA")) {
    badgeStyle = "bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800";
    dotStyle = "bg-sky-500";
  } else if (val.includes("WAITING") || val.includes("CONFIRM")) {
    badgeStyle = "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    dotStyle = "bg-amber-500";
  } else if (val.includes("FINISH") || val.includes("FIN") || val.includes("DONE") || val.includes("COMPLETE")) {
    badgeStyle = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    dotStyle = "bg-emerald-500";
  } else if (val.includes("PLANNING") || val.includes("OPR")) {
    badgeStyle = "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    dotStyle = "bg-indigo-500";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-lg border shrink-0 shadow-2xs ${badgeStyle}`}>
      <span className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${dotStyle}`} />
      <span>{val}</span>
    </span>
  );
}

function PoolingStatusBadge({ status }: { status?: string }) {
  const raw = (status || "CONFIRM").toUpperCase().trim();
  let displayVal = "CONFIRM";
  let badgeStyle = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
  let dotStyle = "bg-emerald-500";

  if (raw.includes("CANCEL") || raw.includes("BATAL") || raw.includes("REJECT") || raw.includes("MISSED")) {
    displayVal = "CANCEL";
    badgeStyle = "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800";
    dotStyle = "bg-rose-500";
  } else if (raw.includes("NEED") || raw.includes("ACTION") || raw.includes("PENDING") || raw.includes("WAIT") || raw.includes("PROCESS") || raw.includes("HOLD")) {
    displayVal = "NEED ACTION";
    badgeStyle = "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";
    dotStyle = "bg-amber-500";
  } else {
    displayVal = "CONFIRM";
    badgeStyle = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
    dotStyle = "bg-emerald-500";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-lg border shrink-0 shadow-2xs ${badgeStyle}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotStyle}`} />
      <span>{displayVal}</span>
    </span>
  );
}

export const isRepoPdtOrder = (o: Order) => {
  const cr = (o.commercialRoute || "").toLowerCase();
  const text = `${cr} ${o.origin || ""} ${o.destination || ""} ${o.notes || ""} ${o.noJobOrder || ""} ${o.id || ""}`.toLowerCase();
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
};

export default function OrderPage({ initialTypeFilter, onClearInitialFilter, currentUser }: OrderProps) {
  const isSuperAdmin = currentUser?.role === "Super Admin" || currentUser?.email?.toLowerCase() === "digital.solution@pancaran-logistic.id";

  // Live orders state initialized with 313 orders and 1947 shipments
  const [orders, setOrders] = useState<Order[]>(() => (SINARMAS_POOLING_ORDERS as unknown as Order[]));
  const [executedShipments, setExecutedShipments] = useState<Order[]>(() => (SINARMAS_EXECUTED_SHIPMENTS as unknown as Order[]));

  useEffect(() => {
    let isMounted = true;
    const fetchExecuted = async () => {
      try {
        const executed = await fetchExecutedShipmentsClient();
        if (isMounted && Array.isArray(executed)) {
          setExecutedShipments(executed);
        }
      } catch (e) {}
    };
    fetchExecuted();
    const interval = setInterval(fetchExecuted, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Multi-Spreadsheet Sources State
  const [sheetSources, setSheetSources] = useState<SheetSource[]>(() => {
    try {
      const saved = localStorage.getItem("logistics_sheet_sources_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load sheet sources from localStorage:", e);
    }
    return DEFAULT_SHEET_SOURCES;
  });

  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);

  // Persist sheet sources changes to localStorage
  const handleUpdateSheetSources = (newSources: SheetSource[]) => {
    setSheetSources(newSources);
    try {
      localStorage.setItem("logistics_sheet_sources_v3", JSON.stringify(newSources));
    } catch (e) {
      console.error("Failed to save sheet sources:", e);
    }
  };

  // Google Sheets integration state
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [showSheetBanner, setShowSheetBanner] = useState(false);
  const [sheetSyncMeta, setSheetSyncMeta] = useState<{
    connected: boolean;
    totalRows: number;
    fetchedAt: string | null;
    error: string | null;
  }>({
    connected: false,
    totalRows: 0,
    fetchedAt: null,
    error: null
  });
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilterState>({
    startDate: "",
    endDate: "",
    preset: "auto"
  });
  const [dateType] = useState<"booking">("booking");
  
  // Success Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  // Selected Order Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Modal State for viewing detail list of clicked KPI
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    data: any[];
    dataType: "order" | "shipment";
  }>({
    isOpen: false,
    title: "",
    data: [],
    dataType: "order"
  });

  // Fetch Google Sheets orders from backend proxy API (Supports Multi-Sheet sync with client fallback)
  const syncGoogleSheets = async (showNotification = true, sourcesToSync = sheetSources) => {
    setIsSyncingSheets(true);
    let sheetOrders: Order[] = [];

    try {
      const activeSources = sourcesToSync.filter((s) => s.enabled && s.url);
      
      const res = await fetch("/api/sheets/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sheets: activeSources })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.orders)) {
          sheetOrders = json.orders;
          
          if (Array.isArray(json.sheetResults)) {
            setSheetSources((prevSources) => {
              const updated = prevSources.map((source) => {
                const resMeta = json.sheetResults.find((r: any) => r.id === source.id || r.name === source.name);
                if (resMeta) {
                  return {
                    ...source,
                    rowCount: resMeta.rowCount,
                    status: (resMeta.status === "success" ? "success" : "error") as "success" | "error",
                    errorMessage: resMeta.errorMessage,
                    lastSyncedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                  };
                }
                return source;
              });
              try {
                localStorage.setItem("logistics_sheet_sources", JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
          }
        }
      }
    } catch (e) {
      // Backend proxy API offline / static host
    }

    if (sheetOrders.length === 0) {
      sheetOrders = await fetchLiveOrdersClient();
    }

    if (sheetOrders.length > 0) {
      setOrders((prev) => {
        const userCreated = prev.filter((o) => (o as any).isUserCreated);
        return [...userCreated, ...sheetOrders];
      });

      setSheetSyncMeta({
        connected: true,
        totalRows: sheetOrders.length,
        fetchedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        error: null
      });

      if (showNotification) {
        setNotification(`Berhasil menyinkronkan ${sheetOrders.length} Order dari Google Sheets!`);
        setTimeout(() => setNotification(null), 5000);
      }
    } else {
      setSheetSyncMeta({
        connected: false,
        totalRows: 0,
        fetchedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        error: "Gagal menghubungkan Google Sheets"
      });
    }

    setIsSyncingSheets(false);
  };

  const sheetSourcesRef = useRef(sheetSources);
  sheetSourcesRef.current = sheetSources;

  // Auto-sync Google Sheets on mount and poll continuously in real-time
  useEffect(() => {
    syncGoogleSheets(false, sheetSourcesRef.current);

    const interval = setInterval(() => {
      syncGoogleSheets(false, sheetSourcesRef.current);
    }, 12000); // Live real-time sync every 12 seconds

    return () => clearInterval(interval);
  }, []);

  // Set initial filter from Overview deep-link
  useEffect(() => {
    if (initialTypeFilter) {
      setTypeFilter(initialTypeFilter.toLowerCase());
    }
  }, [initialTypeFilter]);

  // Unique Customer options list derived from live orders
  const customerOptions = useMemo(() => {
    const customersSet = new Set<string>();
    orders.forEach((o) => {
      if (o.customer) customersSet.add(o.customer);
    });
    return Array.from(customersSet).sort();
  }, [orders]);

  // Extract available months for month filter selector
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    orders.forEach((o) => {
      const targetStr = dateType === "stuffing" ? o.requestStuffing : o.bookingDate;
      const dt = parseBookingDate(targetStr);
      if (dt) {
        const monthKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
        monthsSet.add(monthKey);
      }
    });
    return Array.from(monthsSet).sort();
  }, [orders, dateType]);

  // Reset Filters handler
  const handleResetFilters = () => {
    setSearchQuery("");
    setOrderIdFilter("");
    setCustomerFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateFilter({ startDate: "", endDate: "", preset: "auto" });
    if (onClearInitialFilter) onClearInitialFilter();
  };

  const hasActiveFilters = Boolean(
    searchQuery || orderIdFilter || customerFilter !== "all" || typeFilter !== "all" || statusFilter !== "all" || dateFilter.startDate || dateFilter.endDate
  );

  // Date filtered orders for stats and breakdowns
  const dateFilteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const targetStr = dateType === "stuffing" ? order.requestStuffing : order.bookingDate;
      return filterByDate(targetStr, dateFilter);
    });
  }, [orders, dateFilter, dateType]);

  // Date filtered executed shipments matching Shipment Tracking menu
  const dateFilteredExecutedShipments = useMemo(() => {
    return executedShipments.filter((shp) => {
      const targetStr = dateType === "stuffing" ? shp.requestStuffing : shp.bookingDate;
      return filterByDate(targetStr, dateFilter);
    });
  }, [executedShipments, dateFilter, dateType]);

  // Dynamic KPI Stats calculated from live orders (filtered by dateFilter)
  const stats = useMemo(() => {
    const total = dateFilteredOrders.length;
    // CONFIRM: statusPooling order is confirm
    const confirm = dateFilteredOrders.filter((o) => (o.statusPooling || "").toUpperCase().includes("CONFIRM")).length;
    // CANCEL: statusPooling cancel
    const cancel = dateFilteredOrders.filter((o) => (o.statusPooling || "").toUpperCase().includes("CANCEL")).length;
    // NEED ACTION: statusPooling is empty or NEED ACTION
    const needAction = dateFilteredOrders.filter((o) => {
      const s = (o.statusPooling || "").toUpperCase();
      return !s.includes("CONFIRM") && !s.includes("CANCEL");
    }).length;

    const totalShipment = dateFilteredExecutedShipments.length;
    const activeTotal = needAction + confirm;

    return {
      total,
      totalShipment,
      needAction,
      confirm,
      cancel,
      needActionPct: activeTotal > 0 ? Math.round((needAction / activeTotal) * 100) : 0,
      confirmPct: activeTotal > 0 ? Math.round((confirm / activeTotal) * 100) : 0,
    };
  }, [dateFilteredOrders, dateFilteredExecutedShipments]);

  // Dynamic Service Type Breakdown calculated from live orders (filtered by dateFilter)
  const typeBreakdowns = useMemo(() => {
    const exportOrders = dateFilteredOrders.filter((o) => getFreightServiceType(o) === "EXPORT");
    const repoFullOrders = dateFilteredOrders.filter((o) => getFreightServiceType(o) === "REPO FULL");
    const repoEmptyOrders = dateFilteredOrders.filter((o) => getFreightServiceType(o) === "REPO EMPTY");
    const importOrders = dateFilteredOrders.filter((o) => getFreightServiceType(o) === "IMPORT");

    const buildItem = (id: string, label: string, list: Order[], styles: { tag: string; totalText: string }) => {
      const total = list.length;
      const needAction = list.filter((o) => {
        const s = (o.statusPooling || "").toUpperCase();
        return !s.includes("CONFIRM") && !s.includes("CANCEL");
      }).length;
      const confirm = list.filter((o) => (o.statusPooling || "").toUpperCase().includes("CONFIRM")).length;
      const cancel = list.filter((o) => (o.statusPooling || "").toUpperCase().includes("CANCEL")).length;

      return {
        id,
        label,
        total,
        needAction,
        confirm,
        cancel,
        needActionPct: total > 0 ? (needAction / total) * 100 : 0,
        confirmPct: total > 0 ? (confirm / total) * 100 : 0,
        cancelPct: total > 0 ? (cancel / total) * 100 : 0,
        styles
      };
    };

    return [
      buildItem("export", "EXPORT", exportOrders, { tag: "text-sky-700 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300", totalText: "text-sky-800 dark:text-sky-300" }),
      buildItem("repo_full", "REPO FULL", repoFullOrders, { tag: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300", totalText: "text-emerald-800 dark:text-emerald-300" }),
      buildItem("repo_empty", "REPO EMPTY", repoEmptyOrders, { tag: "text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300", totalText: "text-purple-800 dark:text-purple-300" }),
      buildItem("import", "IMPORT", importOrders, { tag: "text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300", totalText: "text-blue-800 dark:text-blue-300" }),
    ];
  }, [dateFilteredOrders]);

  // Client-side filtering logic
  const filteredOrders = useMemo(() => {
    return dateFilteredOrders.filter((order) => {
      const matchesSource =
        sourceFilter === "all" ||
        (sourceFilter === "sheets" && order.source === "Google Sheet") ||
        (sourceFilter === "local" && order.source !== "Google Sheet") ||
        order.sourceSheetName === sourceFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        (order.noJobOrder && order.noJobOrder.toLowerCase().includes(q)) ||
        order.customer.toLowerCase().includes(q) ||
        order.origin.toLowerCase().includes(q) ||
        order.destination.toLowerCase().includes(q) ||
        order.unitType.toLowerCase().includes(q) ||
        (order.lastUpdateCS && order.lastUpdateCS.toLowerCase().includes(q)) ||
        (order.commercialRoute && order.commercialRoute.toLowerCase().includes(q)) ||
        (order.freightType && order.freightType.toLowerCase().includes(q)) ||
        (order.freightType2 && order.freightType2.toLowerCase().includes(q)) ||
        (order.sourceSheetName && order.sourceSheetName.toLowerCase().includes(q)) ||
        (order.source && order.source.toLowerCase().includes(q));

      const idQ = orderIdFilter.toLowerCase().trim();
      const matchesOrderId =
        !idQ ||
        order.id.toLowerCase().includes(idQ) ||
        (order.noJobOrder && order.noJobOrder.toLowerCase().includes(idQ));

      const matchesCustomer =
        customerFilter === "all" ||
        order.customer.toLowerCase() === customerFilter.toLowerCase();

      const serviceType = getFreightServiceType(order);
      const matchesType =
        typeFilter === "all" ||
        ((typeFilter === "ekspor" || typeFilter === "export") && serviceType === "EXPORT") ||
        ((typeFilter === "repo_full" || typeFilter === "repo" || typeFilter === "repo_service") && serviceType === "REPO FULL") ||
        ((typeFilter === "repo_empty" || typeFilter === "repo_pdt") && serviceType === "REPO EMPTY") ||
        ((typeFilter === "impor" || typeFilter === "import") && serviceType === "IMPORT");
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      return matchesSource && matchesSearch && matchesOrderId && matchesCustomer && matchesType && matchesStatus;
    });
  }, [dateFilteredOrders, searchQuery, orderIdFilter, customerFilter, typeFilter, statusFilter, sourceFilter]);

  // Handle Quick Advance Order Status
  const handleAdvanceStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: nextStatus });
    }
    setNotification(`Status order ${orderId} berhasil diupdate ke ${nextStatus.toUpperCase().replace("_", " ")}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Column Definitions for DataTable
  const columns: Column<Order>[] = [
    {
      key: "noJobOrder" as keyof Order,
      header: "NO JOB ORDER",
      sortable: true,
      render: (item) => {
        const code = formatJobOrderCode(item.noJobOrder);
        return (
          <div className="flex flex-col gap-0.5">
            {code ? (
              <span className="font-mono font-extrabold text-xs sm:text-sm text-[#0B2C6B] dark:text-sky-400 bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800 w-fit">
                {code}
              </span>
            ) : (
              <span className="font-mono text-xs text-slate-500">
                {item.noJobOrder || "-"}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (item) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={getFreightServiceType(item)} />
          {item.commercialRoute && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[180px]" title={item.commercialRoute}>
              {item.commercialRoute}
            </span>
          )}
        </div>
      )
    },
    {
      key: "statusPooling" as keyof Order,
      header: "STATUS POOLING",
      sortable: true,
      render: (item) => <PoolingStatusBadge status={item.statusPooling} />
    },
    {
      key: "origin",
      header: "Origin",
      sortable: true
    },
    {
      key: "destination",
      header: "Destination",
      sortable: true
    },
    {
      key: "unitType",
      header: "Unit Type",
      sortable: true,
      render: (item) => <span className="text-xs sm:text-sm bg-gray-100 text-gray-700 px-2.5 py-1 rounded font-semibold border border-gray-200/60">{item.unitType}</span>
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      render: (item) => (
        <span className="text-xs sm:text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200/80 inline-block text-center min-w-[36px]">
          {item.quantity || 1}
        </span>
      )
    },
    {
      key: "bookingDate" as keyof Order,
      header: "Booking Date",
      sortable: true,
      render: (item) => (
        <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {item.bookingDate || "-"}
        </span>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-lg flex items-center justify-between font-bold text-xs sm:text-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[#0B2C6B] dark:text-sky-400" />
            Order Management Console
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mt-1">
            Real-time container logistics orders, allocation queue, and status tracking
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(dateFilter.startDate || dateFilter.endDate) && (
            <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 hidden lg:inline-block">
              Booking: {formatDateIndo(dateFilter.startDate)} s/d {formatDateIndo(dateFilter.endDate)}
            </span>
          )}
          <DateRangeFilter
            value={dateFilter}
            onChange={setDateFilter}
            dateType="booking"
            align="right"
          />
          {(dateFilter.startDate || dateFilter.endDate || (dateFilter.preset && dateFilter.preset !== "auto")) && (
            <button
              onClick={() => setDateFilter({ startDate: "", endDate: "", preset: "auto" })}
              className="text-[11px] font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/80 px-2.5 py-2 rounded-xl border border-red-200 dark:border-red-800 transition-all cursor-pointer flex items-center gap-1 shrink-0"
              title="Reset Filter Tanggal"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {isSuperAdmin && (
            <button
              onClick={() => setShowSheetBanner(!showSheetBanner)}
              className={`p-2.5 rounded-full border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                showSheetBanner
                  ? "bg-emerald-100 dark:bg-emerald-900/80 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-400/30 scale-105"
                  : "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:scale-110"
              }`}
              title="Info Sync & Kelola Sheets - Klik untuk melihat / mengelola link Google Sheets"
            >
              <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Google Sheets Integration Card (Multi-Sheet Banner) */}
      {isSuperAdmin && showSheetBanner && (
        <div className="relative bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-md border border-emerald-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <button
            onClick={() => setShowSheetBanner(false)}
            className="absolute right-3 top-3 text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800/60 transition-colors cursor-pointer"
            title="Sembunyikan Banner"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6 md:pr-0 min-w-0">
            <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-400/30 shrink-0 mt-0.5">
              <Layers className="w-6 h-6 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  Terhubung Multi-Spreadsheet Google
                </h3>
                {sheetSyncMeta.connected ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Realtime Live Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                    Syncing
                  </span>
                )}
              </div>

              {/* Active Sheet Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {sheetSources.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSourceFilter(sourceFilter === s.name ? "all" : s.name);
                    }}
                    className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                      s.enabled
                        ? sourceFilter === s.name
                          ? "bg-white text-emerald-950 border-white shadow-xs"
                          : "bg-emerald-950/70 text-emerald-100 border-emerald-600/60 hover:bg-emerald-800"
                        : "bg-emerald-950/30 text-emerald-400/50 border-emerald-900 line-through opacity-60"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.enabled ? "bg-emerald-400" : "bg-slate-500"}`} />
                    <span>{s.name}</span>
                    {s.rowCount !== undefined && s.enabled && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-200 font-mono">
                        {s.rowCount}
                      </span>
                    )}
                  </button>
                ))}
                <button
                  onClick={() => setIsSheetModalOpen(true)}
                  className="text-[11px] font-bold px-2 py-1 rounded-lg border border-dashed border-emerald-400/50 hover:border-emerald-300 text-emerald-200 hover:text-white transition-colors"
                >
                  + Tambah Link
                </button>
              </div>

              {sheetSyncMeta.fetchedAt && (
                <p className="text-[11px] text-emerald-200/80 font-medium mt-2">
                  Total <strong>{sheetSyncMeta.totalRows}</strong> order disinkronkan dari {sheetSources.filter((s) => s.enabled).length} sheet aktif. Terakhir diperbarui jam {sheetSyncMeta.fetchedAt}.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            {/* Source Filter Switcher */}
            <div className="bg-emerald-950/60 p-1 rounded-xl border border-emerald-700/50 flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setSourceFilter("all")}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  sourceFilter === "all" ? "bg-white text-emerald-950 font-extrabold" : "text-emerald-200 hover:text-white"
                }`}
              >
                Semua ({orders.length})
              </button>
              <button
                onClick={() => setSourceFilter("sheets")}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  sourceFilter === "sheets" ? "bg-white text-emerald-950 font-extrabold" : "text-emerald-200 hover:text-white"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Sheet ({orders.filter((o) => o.source === "Google Sheet").length})
              </button>
              <button
                onClick={() => setSourceFilter("local")}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  sourceFilter === "local" ? "bg-white text-emerald-950 font-extrabold" : "text-emerald-200 hover:text-white"
                }`}
              >
                <Database className="w-3.5 h-3.5" /> System ({orders.filter((o) => o.source !== "Google Sheet").length})
              </button>
            </div>

            <button
              onClick={() => setIsSheetModalOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              Kelola Links
            </button>

            <button
              onClick={() => syncGoogleSheets(true)}
              disabled={isSyncingSheets}
              className="bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow hover:shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-75"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? "animate-spin text-emerald-600" : ""}`} />
              {isSyncingSheets ? "Syncing..." : "Sync Semua Sheet"}
            </button>
          </div>
        </div>
      )}

      {/* 5 Interactive Kolom KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div
          onClick={() => {
            setStatusFilter("all");
            setDetailModal({
              isOpen: true,
              title: "Detail Data: Total Order",
              subtitle: "Seluruh order yang terdaftar dalam sistem / sheet",
              data: dateFilteredOrders,
              dataType: "order"
            });
          }}
          className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <StatCard
            title="Total Order"
            value={String(stats.total)}
            icon={ShoppingCart}
            statusType="neutral"
            description={`Total Cancel: ${stats.cancel}`}
          />
        </div>
        <div
          onClick={() => {
            setDetailModal({
              isOpen: true,
              title: "Detail Data: Total Shipment",
              subtitle: "Seluruh eksekusi trip shipment dalam sistem / sheet",
              data: dateFilteredExecutedShipments,
              dataType: "shipment"
            });
          }}
          className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <StatCard
            title="Total Shipment"
            value={String(stats.totalShipment)}
            icon={Truck}
            statusType="info"
            description="Total Executed Shipments"
          />
        </div>
        <div
          onClick={() => {
            setStatusFilter("open");
            const needActionList = dateFilteredOrders.filter((o) => {
              const s = (o.statusPooling || "").toUpperCase();
              return !s.includes("CONFIRM") && !s.includes("CANCEL");
            });
            setDetailModal({
              isOpen: true,
              title: "Detail Data: Need Action",
              subtitle: "Order dengan Status Pooling belum dikonfirmasi (Kosong / Need Action)",
              data: needActionList,
              dataType: "order"
            });
          }}
          className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <StatCard
            title="Need Action"
            value={String(stats.needAction)}
            statusType="warning"
            description="Status Pooling Empty"
          />
        </div>
        <div
          onClick={() => {
            setStatusFilter("in_progress");
            const confirmList = dateFilteredOrders.filter((o) => (o.statusPooling || "").toUpperCase().includes("CONFIRM"));
            setDetailModal({
              isOpen: true,
              title: "Detail Data: Confirm",
              subtitle: "Order dengan Status Pooling telah dikonfirmasi (Confirm)",
              data: confirmList,
              dataType: "order"
            });
          }}
          className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <StatCard
            title="Confirm"
            value={String(stats.confirm)}
            statusType="info"
            description="Status Pooling Order"
          />
        </div>
        <div
          onClick={() => {
            setStatusFilter("cancel");
            const cancelList = dateFilteredOrders.filter((o) => (o.statusPooling || "").toUpperCase().includes("CANCEL"));
            setDetailModal({
              isOpen: true,
              title: "Detail Data: Cancel",
              subtitle: "Order dengan Status Pooling Cancel",
              data: cancelList,
              dataType: "order"
            });
          }}
          className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <StatCard
            title="Cancel"
            value={String(stats.cancel)}
            statusType="danger"
            description="Status Pooling Cancel"
          />
        </div>
      </div>

      {/* Breakdown Tipe Order (Clickable Cards with Live Segmented Bars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {typeBreakdowns.map((b) => {
          const typeOrders = dateFilteredOrders.filter((o) => {
            return getFreightServiceType(o) === b.label;
          });

          return (
            <div
              key={b.id}
              onClick={() => {
                setTypeFilter(b.id);
                setDetailModal({
                  isOpen: true,
                  title: `Detail Data: ${b.label}`,
                  subtitle: `Rincian order untuk kategori service ${b.label}`,
                  data: typeOrders,
                  dataType: "order"
                });
              }}
              className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all cursor-pointer p-4 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${
                typeFilter === b.id ? "ring-2 ring-[#0B2C6B] dark:ring-sky-500 border-[#0B2C6B] dark:border-sky-500" : "border-gray-200 dark:border-slate-800"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${b.styles.tag}`}>
                  {b.label}
                </span>
                <span className={`text-xs font-extrabold ${b.styles.totalText}`}>{b.total} total</span>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-[11px] font-semibold text-gray-500 dark:text-slate-400">
                  <span>Need Action: {b.needAction}</span>
                  <span>Confirm: {b.confirm}</span>
                  <span>Cancel: {b.cancel}</span>
                </div>
                {/* Custom Multi-Segment Segmented Progress Bar */}
                <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full flex overflow-hidden border border-gray-200/80 dark:border-slate-700 shadow-inner">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${b.needActionPct}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="bg-amber-500 h-full" title={`Need Action: ${b.needAction}`} />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${b.confirmPct}%` }} transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="bg-blue-500 h-full" title={`Confirm: ${b.confirm}`} />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${b.cancelPct}%` }} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="bg-rose-500 h-full" title={`Cancel: ${b.cancel}`} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 font-bold pt-0.5 uppercase tracking-wider">
                  <span>{b.needAction} Need Action</span>
                  <span>{b.confirm} Confirm</span>
                  <span>{b.cancel} Cancel</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Global Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keyword (ID, Customer, Origin, Dest...)"
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2.5 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2C6B] dark:focus:ring-sky-500 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Key Field Specific Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Order ID */}
            <div className="relative min-w-[140px] flex-1 sm:flex-initial">
              <input
                type="text"
                value={orderIdFilter}
                onChange={(e) => setOrderIdFilter(e.target.value)}
                placeholder="Order ID..."
                className="w-full bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2C6B] text-gray-800 placeholder-gray-400 font-mono"
              />
              {orderIdFilter && (
                <button
                  onClick={() => setOrderIdFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Customer Dropdown */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 sm:flex-initial">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="text-xs font-bold text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer w-full max-w-[160px] truncate"
              >
                <option value="all">Customer: All</option>
                {customerOptions.map((cust) => (
                  <option key={cust} value={cust}>
                    {cust}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown Tipe */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 sm:flex-initial">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs font-bold text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">Type: All</option>
                <option value="export">EXPORT Only</option>
                <option value="repo_full">REPO FULL Only</option>
                <option value="repo_empty">REPO EMPTY Only</option>
                <option value="import">IMPORT Only</option>
              </select>
            </div>

            {/* Dropdown Status */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 sm:flex-initial">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-bold text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="open">Open (Queue)</option>
                <option value="in_progress">In Progress (Transit)</option>
                <option value="done">Done (Completed)</option>
                <option value="cancel">Cancel / Anomali</option>
              </select>
            </div>

            {/* Date Range & Month Filter Component */}
            <DateRangeFilter
              value={dateFilter}
              onChange={setDateFilter}
              dateType="booking"
              availableMonths={availableMonths}
            />

            {/* Clear Filter button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50/80 hover:bg-sky-100 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Badges / Chips */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Active Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200">
                  Search: "{searchQuery}"
                  <X className="w-3 h-3 hover:text-red-500 cursor-pointer" onClick={() => setSearchQuery("")} />
                </span>
              )}
              {orderIdFilter && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 font-mono font-bold px-2.5 py-1 rounded-lg border border-blue-200">
                  ID: {orderIdFilter}
                  <X className="w-3 h-3 hover:text-red-500 cursor-pointer" onClick={() => setOrderIdFilter("")} />
                </span>
              )}
              {customerFilter !== "all" && (
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 font-bold px-2.5 py-1 rounded-lg border border-indigo-200">
                  Customer: {customerFilter}
                  <X className="w-3 h-3 hover:text-red-500 cursor-pointer" onClick={() => setCustomerFilter("all")} />
                </span>
              )}
              {typeFilter !== "all" && (
                <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 font-bold px-2.5 py-1 rounded-lg border border-sky-200 uppercase">
                  Type: {typeFilter}
                  <X className="w-3 h-3 hover:text-red-500 cursor-pointer" onClick={() => setTypeFilter("all")} />
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 uppercase">
                  Status: {statusFilter.replace("_", " ")}
                  <X className="w-3 h-3 hover:text-red-500 cursor-pointer" onClick={() => setStatusFilter("all")} />
                </span>
              )}
              {(dateFilter.startDate || dateFilter.endDate) && (
                <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                  Tgl Booking: {dateFilter.startDate ? formatDateIndo(dateFilter.startDate) : "Awal"} s/d {dateFilter.endDate ? formatDateIndo(dateFilter.endDate) : "Akhir"}
                  <X className="w-3 h-3 hover:text-red-500 cursor-pointer" onClick={() => setDateFilter({ startDate: "", endDate: "", preset: "auto" })} />
                </span>
              )}
            </div>

            <span className="text-xs font-bold text-gray-500">
              Showing <strong className="text-gray-900 font-extrabold">{filteredOrders.length}</strong> of {orders.length} orders
            </span>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <div className="relative">
        <DataTable
          columns={columns}
          data={filteredOrders}
          onRowClick={(order) => setSelectedOrder(order)}
          itemsPerPage={10}
        />
      </div>

      {/* Order Expand Details Modal (Responsive Slide-over) */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-gray-900"
            />

            {/* Slide over sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-lg h-full relative z-10 shadow-2xl flex flex-col justify-between"
            >
              {/* Sheet Header */}
              <div className="bg-[#0B2C6B] text-white p-6 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                    Order Details & Operations
                  </span>
                  <h3 className="text-xl font-extrabold tracking-tight mt-1 font-mono">
                    {selectedOrder.id}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sheet Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Visual Badges Row */}
                <div className="flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-slate-800/80 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Service Type</span>
                    <StatusBadge status={getFreightServiceType(selectedOrder)} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Operational Status</span>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Last Update CS</span>
                    <CSStatusBadge status={selectedOrder.lastUpdateCS} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Status Pooling (AE)</span>
                    <PoolingStatusBadge status={selectedOrder.statusPooling} />
                  </div>
                </div>

                {/* Status Advancement Quick Control */}
                <div className="bg-blue-50/60 border border-blue-200/80 p-4 rounded-xl space-y-2">
                  <span className="text-xs font-black text-[#0B2C6B] block">Update Status Order Live:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdvanceStatus(selectedOrder.id, "open")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border cursor-pointer ${
                        selectedOrder.status === "open" ? "bg-amber-500 text-white border-amber-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      Open Queue
                    </button>
                    <button
                      onClick={() => handleAdvanceStatus(selectedOrder.id, "in_progress")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border cursor-pointer ${
                        selectedOrder.status === "in_progress" ? "bg-blue-600 text-white border-blue-700" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleAdvanceStatus(selectedOrder.id, "done")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border cursor-pointer ${
                        selectedOrder.status === "done" ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      Done
                    </button>
                  </div>
                </div>

                {/* Commercial Route and Freight Type lookup display */}
                {selectedOrder.commercialRoute && (
                  <div className="bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/60 p-4 rounded-xl space-y-1.5">
                    <span className="text-[10px] text-sky-800 dark:text-sky-300 font-extrabold uppercase tracking-wider block">
                      Commercial Route & Lookup Matrix
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {selectedOrder.commercialRoute}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                      <span>Freight Type: <strong className="text-sky-700 dark:text-sky-300">{selectedOrder.freightType || "EXPORT"}</strong></span>
                      <span>•</span>
                      <span>Freight Type 2: <strong className="text-emerald-700 dark:text-emerald-300">{getFreightServiceType(selectedOrder)}</strong></span>
                    </div>
                  </div>
                )}

                {/* Routing info card */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b pb-1.5">
                    Routing Information
                  </h4>
                  <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Origin Loading Point</span>
                      <span className="text-sm font-bold text-[#0B2C6B] block mt-1">{selectedOrder.origin}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-400 shrink-0" />
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Destination Arrive</span>
                      <span className="text-sm font-bold text-gray-800 block mt-1">{selectedOrder.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Logistics Specifications */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b pb-1.5">
                    Client & Equipment
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-50/80 dark:bg-slate-800/80 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                      <span className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase block">Assigned Customer</span>
                      <span className="text-xs font-black text-gray-700 dark:text-slate-200 block mt-1 truncate">{selectedOrder.customer}</span>
                    </div>
                    <div className="bg-gray-50/80 dark:bg-slate-800/80 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                      <span className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase block">Required Container</span>
                      <span className="text-xs font-black text-gray-700 dark:text-slate-200 block mt-1">{selectedOrder.unitType}</span>
                    </div>
                    <div className="bg-blue-50/80 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50">
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase block">Quantity</span>
                      <span className="text-xs font-black text-blue-800 dark:text-blue-200 block mt-1">{selectedOrder.quantity || 1} Container</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block mb-1">Status Pooling (Kolom AE)</span>
                      <PoolingStatusBadge status={selectedOrder.statusPooling} />
                    </div>
                  </div>
                </div>

                {/* Schedules, Booking & SLA */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b pb-1.5">
                    Schedule, Booking & SLA
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          Tanggal Booking
                        </span>
                        <span className="text-sm font-black text-amber-950 dark:text-amber-200 mt-1 block font-mono">
                          {selectedOrder.bookingDate || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-sky-50/50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-sky-800 dark:text-sky-300 block">SLA Due Date / ETA</span>
                        <span className="text-sm font-black text-sky-900 dark:text-sky-100 mt-1 block">{selectedOrder.eta}</span>
                      </div>
                      <AlertCircle className="w-5 h-5 text-sky-500" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Sheet Actions */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 text-center py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Tutup Details
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 text-center py-2.5 rounded-lg bg-[#0B2C6B] hover:bg-blue-800 text-white text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Eye className="w-4 h-4" /> Track Active
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Multi-Spreadsheet Link Manager Modal */}
      {isSuperAdmin && (
        <SheetManagerModal
          isOpen={isSheetModalOpen}
          onClose={() => setIsSheetModalOpen(false)}
          sources={sheetSources}
          onUpdateSources={(updated) => {
            handleUpdateSheetSources(updated);
            syncGoogleSheets(false, updated);
          }}
          onSyncAll={() => syncGoogleSheets(true, sheetSources)}
          isSyncing={isSyncingSheets}
        />
      )}

      {/* Detail List Modal for KPI Clicks */}
      <DetailListModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal((prev) => ({ ...prev, isOpen: false }))}
        title={detailModal.title}
        subtitle={detailModal.subtitle}
        data={detailModal.data}
        dataType={detailModal.dataType}
      />
    </motion.div>
  );
}

