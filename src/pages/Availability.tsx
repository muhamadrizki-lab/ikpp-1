import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Truck, Users, Clock, ShieldCheck, Search, MapPin, CheckCircle2, X, CalendarDays, Filter, RefreshCw, Shield, Wrench } from "lucide-react";
import StatCard from "../components/StatCard";
import DataTable, { Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { useFirebaseRealtime } from "../hooks/useFirebaseRealtime";
import { FleetUnit, UnitStatus } from "../types";

export default function AvailabilityPage() {
  const {
    trucks,
    nextSchedule,
    scheduledNotice,
    updateTruckStatus
  } = useFirebaseRealtime();

  // Map Firestore live trucks to FleetUnits dynamically
  const fleetUnits = useMemo<FleetUnit[]>(() => {
    if (!trucks || trucks.length === 0) {
      return [];
    }

    return trucks.map((t) => {
      const uStatus = (t.status || "").toUpperCase();
      let status: UnitStatus = "utilized";
      if (uStatus === "TERSEDIA" || uStatus.includes("STANDBY") || uStatus.includes("READY")) {
        status = "standby";
      } else if (uStatus.includes("STORING") || uStatus.includes("LAKA") || uStatus.includes("DOWNTIME") || uStatus.includes("BENGKEL")) {
        status = "downtime";
      }

      const unitType = t.jenis_mobil || "Trailer 4x2 40ft";

      return {
        unitId: t.plat_nomor || t.id,
        unitType,
        status,
        lastLocation: `${t.status} ${t.vendor ? `(${t.vendor})` : ""}`,
        lastUpdate: t.terakhirUpdate || new Date().toLocaleDateString("id-ID")
      };
    });
  }, [trucks]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  // Dynamic KPI Stats calculated from live fleetUnits
  const stats = useMemo(() => {
    const total = fleetUnits.length;
    const standby = fleetUnits.filter((u) => u.status === "standby").length;
    const downtime = fleetUnits.filter((u) => u.status === "downtime").length;
    const utilized = fleetUnits.filter((u) => u.status === "utilized").length;
    const available = utilized + standby;
    return {
      total,
      available,
      utilized,
      standby,
      downtime,
      availablePct: total > 0 ? Math.round((available / total) * 100) : 0,
      utilizedPct: total > 0 ? Math.round((utilized / total) * 100) : 0,
      standbyPct: total > 0 ? Math.round((standby / total) * 100) : 0,
      downtimePct: total > 0 ? Math.round((downtime / total) * 100) : 0
    };
  }, [fleetUnits]);

  // Dynamic Driver Stats matched to Fleet Availability
  const driverStats = useMemo(() => {
    const total = stats.total;
    const onDuty = stats.utilized;
    const offDuty = stats.standby + stats.downtime;
    return {
      total,
      onDuty,
      offDuty,
      onDutyPct: total > 0 ? Math.round((onDuty / total) * 100) : 0,
      offDutyPct: total > 0 ? Math.round((offDuty / total) * 100) : 0
    };
  }, [stats]);

  // Fleet Unit Type Breakdown dynamically calculated from live fleetUnits
  const fleetTypeBreakdowns = useMemo(() => {
    const types = ["Trailer 4x2 40ft", "Trailer 4x2 20ft"];
    return types.map((type) => {
      const units = fleetUnits.filter((u) => {
        if (type === "Trailer 4x2 40ft") {
          return u.unitType === "Trailer 4x2 40ft" || u.unitType.includes("40") || u.unitType.includes("HC");
        } else {
          return u.unitType === "Trailer 4x2 20ft" || u.unitType.includes("20");
        }
      });
      const total = units.length;
      const utilized = units.filter((u) => u.status === "utilized").length;
      const standby = units.filter((u) => u.status === "standby").length;
      const downtime = units.filter((u) => u.status === "downtime").length;
      const available = utilized + standby;
      return {
        type,
        total,
        available,
        utilized,
        standby,
        downtime,
        color: "bg-emerald-500",
        utilColor: "bg-blue-500",
        standbyColor: "bg-sky-500",
        downtimeColor: "bg-rose-500"
      };
    });
  }, [fleetUnits]);

  // Filtering logic for the list
  const filteredFleet = useMemo(() => {
    return fleetUnits.filter((unit) => {
      const matchesSearch =
        unit.unitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.lastLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.unitType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "available"
          ? (unit.status === "standby" || unit.status === "utilized")
          : unit.status === statusFilter);

      const matchesType = typeFilter === "all" || unit.unitType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [fleetUnits, searchQuery, statusFilter, typeFilter]);

  // Columns for Fleet Unit List (Unit ID replaced with Plat Nomor)
  const columns: Column<FleetUnit>[] = [
    {
      key: "unitId",
      header: "Plat Nomor",
      sortable: true,
      render: (item) => <span className="font-mono font-black text-xs sm:text-sm text-gray-950 bg-slate-100 border border-slate-200/80 rounded px-2.5 py-1">{item.unitId}</span>
    },
    {
      key: "unitType",
      header: "Trailer Type",
      sortable: true,
      render: (item) => <span className="text-xs sm:text-sm bg-slate-50 text-slate-700 px-2.5 py-1 rounded font-bold border border-slate-100">{item.unitType}</span>
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={item.status} />
          {item.status === "downtime" && item.downtimeCategory && (
            <span className="text-[10px] sm:text-xs font-black text-rose-600 bg-rose-50 border border-rose-200/50 px-1.5 py-0.5 rounded uppercase tracking-wider self-start mt-0.5">
              {item.downtimeCategory}
            </span>
          )}
        </div>
      )
    },
    {
      key: "lastLocation",
      header: "Lokasi Terakhir",
      sortable: true,
      render: (item) => (
        <span className="text-xs sm:text-sm text-gray-800 flex items-center gap-1.5 font-medium">
          <MapPin className="w-4 h-4 text-rose-500 shrink-0" /> {item.lastLocation}
        </span>
      )
    },
    {
      key: "lastUpdate",
      header: "Update Terakhir",
      sortable: true,
      render: (item) => <span className="text-xs sm:text-sm font-mono text-gray-600 font-bold">{item.lastUpdate}</span>
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
      {/* Schedule Auto Refresh Indicator Bar */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-3.5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
            <Clock className="w-4 h-4 animate-pulse text-blue-400" />
          </div>
          <div>
            <div className="font-black flex items-center gap-2">
              <span>Jadwal Refresh Otomatis Rutin Data Logistik Pro IKK</span>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30 font-bold">
                6x Sehari
              </span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
              <CalendarDays className="w-3 h-3 text-indigo-300" />
              <span>Jam Refresh: <b>09:00</b> • <b>13:00</b> • <b>15:00</b> • <b>17:00</b> • <b>19:00</b> • <b>23:00</b> WIB</span>
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

      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#0B2C6B]" />
            Fleet Resources & Availability Center
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Real-time fleet readiness, downtime service log, and driver allocation ratio
          </p>
        </div>
      </div>

      {/* 5 Kolom KPI Stats - clickable to filter unit list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div onClick={() => setStatusFilter("all")} className="cursor-pointer transition-transform hover:scale-[1.01]">
          <StatCard
            title="Total Fleet"
            value={String(stats.total)}
            icon={Truck}
            statusType="neutral"
            description="Registered Units"
          />
        </div>
        <div onClick={() => setStatusFilter("available")} className="cursor-pointer transition-transform hover:scale-[1.01]">
          <StatCard
            title="Available"
            value={String(stats.available)}
            statusType="success"
            description={`Util + Stdb (${stats.availablePct}%)`}
          />
        </div>
        <div onClick={() => setStatusFilter("utilized")} className="cursor-pointer transition-transform hover:scale-[1.01]">
          <StatCard
            title="Utilized"
            value={String(stats.utilized)}
            statusType="info"
            description={`Active On Trip (${stats.utilizedPct}%)`}
          />
        </div>
        <div onClick={() => setStatusFilter("standby")} className="cursor-pointer transition-transform hover:scale-[1.01]">
          <StatCard
            title="Standby"
            value={String(stats.standby)}
            statusType="warning"
            description={`Staging / Ready (${stats.standbyPct}%)`}
          />
        </div>
        <div onClick={() => setStatusFilter("downtime")} className="cursor-pointer transition-transform hover:scale-[1.01]">
          <StatCard
            title="Downtime"
            value={String(stats.downtime)}
            statusType="danger"
            description={`Outages & Service (${stats.downtimePct}%)`}
          />
        </div>
      </div>

      {/* Breakdown per Tipe Unit & Driver Status Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Unit Type Breakdown Table + Mini Charts (Left 2 cols) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm lg:col-span-2 flex flex-col justify-between transition-colors duration-200">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-slate-100 pb-3 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#0B2C6B] dark:text-sky-400" />
              Breakdown per Unit Type
            </h3>
            
            {/* Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse text-sm sm:text-base font-bold">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-200 font-extrabold uppercase tracking-wider text-xs sm:text-sm">
                    <th className="pb-3 text-left">UNIT TYPE</th>
                    <th className="pb-3 text-center">Total</th>
                    <th className="pb-3 text-center">Available</th>
                    <th className="pb-3 text-center">Utilized</th>
                    <th className="pb-3 text-center">Standby</th>
                    <th className="pb-3 text-center">Downtime</th>
                    <th className="pb-3 text-center w-32">Ratio Alloc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-900 dark:text-slate-100 font-semibold">
                  {fleetTypeBreakdowns.map((item, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setTypeFilter(item.type)}
                      className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                        typeFilter === item.type ? "bg-blue-50/80 dark:bg-slate-800 font-black" : ""
                      }`}
                    >
                      <td className="py-3.5 font-extrabold text-gray-950 dark:text-slate-100 text-sm sm:text-base">{item.type}</td>
                      <td className="py-3.5 text-center font-black tabular-nums text-gray-950 dark:text-slate-100 text-sm sm:text-base">{item.total}</td>
                      <td className="py-3.5 text-center font-black text-emerald-800 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/40 font-mono text-sm sm:text-base">{item.available}</td>
                      <td className="py-3.5 text-center font-black text-blue-800 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/40 font-mono text-sm sm:text-base">{item.utilized}</td>
                      <td className="py-3.5 text-center font-black text-sky-800 dark:text-sky-400 bg-sky-50/30 dark:bg-sky-950/40 font-mono text-sm sm:text-base">{item.standby}</td>
                      <td className="py-3.5 text-center font-black text-rose-800 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/40 font-mono text-sm sm:text-base">{item.downtime}</td>
                      <td className="py-3.5">
                        {/* Nested mini horizontal stacked progress bar */}
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full flex overflow-hidden border border-gray-200 dark:border-slate-700 shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.utilized / item.total) * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className={`${item.utilColor} h-full`}
                            title={`Utilized: ${item.utilized}`}
                          />
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.standby / item.total) * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 + 0.05, ease: [0.16, 1, 0.3, 1] }}
                            className={`${item.standbyColor} h-full`}
                            title={`Standby: ${item.standby}`}
                          />
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.downtime / item.total) * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 + 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className={`${item.downtimeColor} h-full`}
                            title={`Downtime: ${item.downtime}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span> Utilized (On Trip)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block"></span> Standby (Ready)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span> Downtime (Outages)</span>
          </div>
        </div>

        {/* Section: Driver Availability (Right 1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-slate-100 pb-3 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0B2C6B] dark:text-sky-400" />
              Driver Availability
            </h3>

            {/* Overall stats */}
            <div className="mt-5 text-center bg-gray-50 dark:bg-slate-800/80 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
              <span className="text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Total Registered Drivers</span>
              <span className="text-4xl font-black block text-gray-800 dark:text-slate-100 tracking-tight mt-1 tabular-nums">
                {driverStats.total}
              </span>
            </div>

            {/* Drivers on/off duty split */}
            <div className="space-y-4 mt-5">
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-blue-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> On Duty ({driverStats.onDutyPct}% - Matches Avail Fleet)
                  </span>
                  <span className="font-mono">{driverStats.onDuty} Drivers</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2.5 bg-gray-100 border border-gray-200 shadow-inner rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${driverStats.onDutyPct}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="h-full bg-blue-500" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-rose-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Off Duty ({driverStats.offDutyPct}% - Matches Downtime Fleet)
                  </span>
                  <span className="font-mono">{driverStats.offDuty} Drivers</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2.5 bg-gray-100 border border-gray-200 shadow-inner rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${driverStats.offDutyPct}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="h-full bg-rose-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>SLA Driver Compliance: 98.7%</span>
          </div>
        </div>

      </div>

      {/* Section: Monitoring List Unit */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Monitoring List Unit</h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Real-time status tracking updated based on scheduled auto refresh times</p>
          </div>

          {/* Inline filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Plat Nomor or lokasi..."
                className="w-full bg-white border border-gray-200 text-xs font-medium rounded-lg pl-8 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0B2C6B] text-gray-700"
              />
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
              <Filter className="w-3 h-3 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-[10px] font-bold text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="available">Available (Utilized + Standby)</option>
                <option value="utilized">Utilized (On Trip)</option>
                <option value="standby">Standby (Ready)</option>
                <option value="downtime">Downtime (Service)</option>
              </select>
            </div>

            {/* Type Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
              <Filter className="w-3 h-3 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-[10px] font-bold text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">Type: All</option>
                <option value="Trailer 4x2 40ft">Trailer 4x2 40ft</option>
                <option value="Trailer 4x2 20ft">Trailer 4x2 20ft</option>
              </select>
            </div>

            {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Fleet table */}
        <DataTable
          columns={columns}
          data={filteredFleet}
          itemsPerPage={10}
        />
      </div>
    </motion.div>
  );
}

