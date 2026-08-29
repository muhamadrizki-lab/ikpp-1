import { OrderStatus, TripStatus } from "../types";

export interface MappedStatus {
  orderStatus: OrderStatus;
  shipmentStatus: TripStatus;
}

/**
 * Maps LAST UPDATE CS value to TYPE ORDER and TYPE SHIPMENT according to lookup rules:
 * - Empty / CANCEL CS / CANCEL OPR / CANCEL -> Order: CANCEL | Shipment: CANCEL
 * - ON JOB -> Order: IN TRANSIT (in_progress) | Shipment: ON TRIP (on_trip)
 * - OPR PLANNING -> Order: OPEN (open) | Shipment: PRE TRIP (pre_trip)
 * - SHIPMENT FINISH -> Order: COMPLETED (done) | Shipment: END TRIP (end_trip)
 * - WAITING BON MUAT -> Order: OPEN (open) | Shipment: PRE TRIP (pre_trip)
 * - WAITING CONFIRM -> Order: OPEN (open) | Shipment: PRE TRIP (pre_trip)
 */
export function mapCSStatus(lastUpdateCS?: string): MappedStatus {
  const raw = (lastUpdateCS || "").trim();
  const cs = raw.toUpperCase();

  if (!cs || cs === "CANCEL CS" || cs === "CANCEL OPR" || cs === "CANCEL" || cs.includes("CANCEL") || cs.includes("BATAL") || cs.includes("REJECT")) {
    return { orderStatus: "cancel", shipmentStatus: "cancel" };
  }

  if (
    cs === "ON JOB" ||
    cs.includes("ON JOB") ||
    cs.includes("ON TRIP") ||
    cs.includes("IN TRANSIT") ||
    cs.includes("WAITING TILA") ||
    cs.includes("TILA")
  ) {
    return { orderStatus: "in_progress", shipmentStatus: "on_trip" };
  }

  if (
    cs === "OPR PLANNING" ||
    cs === "WAITING BON MUAT" ||
    cs === "WAITING CONFIRM" ||
    cs.includes("PLANNING") ||
    cs.includes("BON MUAT") ||
    cs.includes("WAITING") ||
    cs.includes("CONFIRM") ||
    cs.includes("OPEN") ||
    cs.includes("UNALLOCATED")
  ) {
    return { orderStatus: "open", shipmentStatus: "pre_trip" };
  }

  if (
    cs === "SHIPMENT FINISH" ||
    cs.includes("FINISH") ||
    cs.includes("DONE") ||
    cs.includes("COMPLETED") ||
    cs.includes("COMPLETE")
  ) {
    return { orderStatus: "done", shipmentStatus: "end_trip" };
  }

  // Fallback for empty or unknown
  return { orderStatus: "cancel", shipmentStatus: "cancel" };
}

/**
 * Extracts strictly the job order alphanumeric code (e.g., F1O0000467)
 * from strings like "SI DO DN F1O0000467 - 272724662" or "SI DO F1O0000162 - 080600290866".
 */
export function formatJobOrderCode(rawString?: string): string {
  if (!rawString) return "";
  const trimmed = rawString.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();

  // Return empty string for garbage / instruction text / placeholders / SM- IDs
  if (
    lower.includes("jangan") ||
    lower.includes("hapus") ||
    lower.includes("kosong") ||
    lower.includes("tidak ada") ||
    lower.startsWith("sm-") ||
    lower === "-" ||
    lower === "#n/a" ||
    lower === "n/a" ||
    lower === "null" ||
    lower === "undefined"
  ) {
    return "";
  }

  // Look for F1O or job order alphanumeric pattern (e.g. F1O0000467, F1O0000162)
  const match = trimmed.match(/(?:SI\s*DO\s*DN\s*|SI\s*DO\s*)?([A-Z0-9]{5,15})/i) || trimmed.match(/([A-Z][0-9][A-Z0-9]{4,14})/i);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }

  // Fallback: search for first chunk containing letters and digits
  const parts = trimmed.split(/[\s-]+/).filter((p) => p.length >= 4);
  if (parts.length > 0) {
    const jobPart = parts.find((p) => /^[A-Z0-9]+$/i.test(p));
    if (jobPart) return jobPart.toUpperCase();
  }

  // If it's a clean alphanumeric string
  if (/^[A-Za-z0-9._/-]+$/.test(trimmed) && trimmed.length <= 25) {
    return trimmed.toUpperCase();
  }

  return "";
}

