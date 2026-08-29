import React from "react";
import { OrderStatus, TripStatus, UnitStatus, OrderType } from "../types";

type BadgeType = OrderStatus | TripStatus | UnitStatus | OrderType | string;

interface StatusBadgeProps {
  status: BadgeType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/_/g, " ");

  // Styling maps based on Design System & RGB Status Colors
  let classes = "bg-gray-100 text-gray-700 border-gray-200";

  switch (normalized) {
    // Open / Standby / Pre-Trip / Ekspor / Export -> CYAN / SKY BLUE
    case "open":
    case "standby":
    case "pre trip":
    case "pre_trip":
    case "ekspor":
    case "export":
      classes = "bg-sky-50 text-sky-700 border border-sky-200/60 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800";
      break;

    // In Progress / On Trip / Utilized / Impor / Import -> BLUE / CYAN
    case "in progress":
    case "in_progress":
    case "on trip":
    case "on_trip":
    case "utilized":
    case "impor":
    case "import":
      classes = "bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
      break;

    // Done / End Trip / Available / Repo Full -> GREEN / EMERALD
    case "done":
    case "end trip":
    case "end_trip":
    case "available":
    case "repo":
    case "repo service":
    case "repo_service":
    case "repo full":
    case "repo_full":
      classes = "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
      break;

    // Repo Empty / Repo PDT -> PURPLE
    case "repo empty":
    case "repo_empty":
    case "repo pdt":
    case "repo_pdt":
      classes = "bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800";
      break;

    // Downtime / Maintenance / Cancel -> ROSE / RED
    case "downtime":
    case "maintenance":
    case "cancel":
    case "canceled":
    case "cancelled":
      classes = "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
      break;
  }

  // Capitalize for display
  let displayLabel = normalized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  if (normalized === "ekspor" || normalized === "export") {
    displayLabel = "Export";
  } else if (normalized === "impor" || normalized === "import") {
    displayLabel = "Import";
  } else if (normalized === "repo full" || normalized === "repo_full" || normalized === "repo" || normalized === "repo service" || normalized === "repo_service") {
    displayLabel = "Repo Full";
  } else if (normalized === "repo empty" || normalized === "repo_empty" || normalized === "repo pdt" || normalized === "repo_pdt") {
    displayLabel = "Repo Empty";
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-bold tracking-wide ${classes}`}>
      {/* Decorative dot for status badges */}
      <span className={`w-2 h-2 rounded-full mr-1.5 ${
        normalized === "open" || normalized === "standby" || normalized === "pre trip" || normalized === "pre_trip" || normalized === "ekspor" || normalized === "export" ? "bg-sky-500" :
        normalized === "in progress" || normalized === "in_progress" || normalized === "on trip" || normalized === "on_trip" || normalized === "utilized" || normalized === "impor" || normalized === "import" ? "bg-blue-500" :
        normalized === "repo empty" || normalized === "repo_empty" || normalized === "repo pdt" || normalized === "repo_pdt" ? "bg-purple-500" :
        normalized === "downtime" || normalized === "maintenance" ? "bg-rose-500" :
        "bg-emerald-500"
      }`}></span>
      {displayLabel}
    </span>
  );
}
