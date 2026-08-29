import { Order, Shipment, FleetUnit, OrderType, OrderStatus, TripStatus, UnitStatus } from "../types";

// Seed orders set to empty array so only live Google Spreadsheet data is used
const seedOrders: Partial<Order>[] = [];

// Hand-crafted seed shipments with plate units
const seedShipments: Partial<Shipment>[] = [
  { id: "SHP-2607001", orderRef: "ORD-2607001", type: "ekspor", tripStatus: "on_trip", unit: "B 9124 UQA", driver: "Slamet Riyadi", currentLocation: "Tol Cikampek KM 45", eta: "10 Jul 2026, 14:00" },
  { id: "SHP-2607002", orderRef: "ORD-2607002", type: "impor", tripStatus: "end_trip", unit: "B 9042 PAI", driver: "Budi Santoso", currentLocation: "Warehouse IKK Serang (arrived)", eta: "Completed" },
  { id: "SHP-2607003", orderRef: "ORD-2607005", type: "impor", tripStatus: "on_trip", unit: "B 9385 SFD", driver: "Agus Prasetyo", currentLocation: "Tol Jagorawi KM 12", eta: "09 Jul 2026, 18:00" },
  { id: "SHP-2607004", orderRef: "ORD-2607004", type: "ekspor", tripStatus: "end_trip", unit: "L 8092 KPA", driver: "Iwan Setiawan", currentLocation: "Tj. Perak Port (unloaded)", eta: "Completed" },
  { id: "SHP-2607005", orderRef: "ORD-2607009", type: "ekspor", tripStatus: "on_trip", unit: "B 9110 JKL", driver: "Hendra Wijaya", currentLocation: "Arteri Tangerang", eta: "10 Jul 2026, 11:30" },
  { id: "SHP-2607006", orderRef: "ORD-2607011", type: "repo", tripStatus: "on_trip", unit: "L 8872 JK", driver: "Eko Prasetyo", currentLocation: "Margomulyo Surabaya", eta: "10 Jul 2026, 15:00" },
  { id: "SHP-2607007", orderRef: "ORD-2607007", type: "repo", tripStatus: "end_trip", unit: "B 9763 MNO", driver: "Rian Hidayat", currentLocation: "Depo Cikarang (arrived)", eta: "Completed" },
  { id: "SHP-2607008", orderRef: "ORD-2607012", type: "ekspor", tripStatus: "pre_trip", unit: "BM 8901 AA", driver: "Zulkilfli", currentLocation: "IKK Perawang Depo", eta: "11 Jul 2026, 09:00" },
  { id: "SHP-2607009", orderRef: "ORD-2607013", type: "impor", tripStatus: "on_trip", unit: "B 9235 PQR", driver: "Ahmad Fauzi", currentLocation: "Kebon Jeruk Jakarta", eta: "10 Jul 2026, 16:30" },
  { id: "SHP-2607010", orderRef: "ORD-2607014", type: "ekspor", tripStatus: "end_trip", unit: "B 9481 STU", driver: "Dedi Kurniawan", currentLocation: "Tj. Priok Port (unloaded)", eta: "Completed" },
  { id: "SHP-2607011", orderRef: "ORD-2607003", type: "repo", tripStatus: "pre_trip", unit: "B 9043 VWX", driver: "Suherman", currentLocation: "Depo Cikarang Yard", eta: "11 Jul 2026, 08:00" },
  { id: "SHP-2607012", orderRef: "ORD-2607006", type: "ekspor", tripStatus: "pre_trip", unit: "B 9552 YZA", driver: "Rahmat Hidayat", currentLocation: "IKK Tangerang Yard", eta: "12 Jul 2026, 10:00" },
  { id: "SHP-2607013", orderRef: "ORD-2607008", type: "impor", tripStatus: "pre_trip", unit: "B 9321 BCD", driver: "Sugeng", currentLocation: "Tj. Mas Port Buffer Area", eta: "11 Jul 2026, 13:00" },
  { id: "SHP-2607014", orderRef: "ORD-2607015", type: "repo", tripStatus: "pre_trip", unit: "B 9771 EFG", driver: "Mulyono", currentLocation: "Depo Cikarang Yard", eta: "12 Jul 2026, 07:30" },
  { id: "SHP-2607015", orderRef: "ORD-2607010", type: "impor", tripStatus: "end_trip", unit: "L 8421 OP", driver: "Heri Susanto", currentLocation: "IKK Mojokerto (unloaded)", eta: "Completed" }
];

// Hand-crafted seed fleet units using Plate Numbers as unitId
const seedFleetUnits: FleetUnit[] = [
  { unitId: "B 9124 UQA", unitType: "Trailer 4x2 40ft", status: "utilized", lastLocation: "On road to Tj. Priok Port", lastUpdate: "08 Jul 2026, 10:00" },
  { unitId: "B 9042 PAI", unitType: "Trailer 4x2 40ft", status: "standby", lastLocation: "Depo Cikarang Yard", lastUpdate: "08 Jul 2026, 14:12" },
  { unitId: "B 9385 SFD", unitType: "Trailer 4x2 40ft", status: "utilized", lastLocation: "On road to IKK Karawang", lastUpdate: "08 Jul 2026, 15:30" },
  { unitId: "L 8092 KPA", unitType: "Trailer 4x2 40ft", status: "standby", lastLocation: "IKK Sidoarjo Depo", lastUpdate: "08 Jul 2026, 09:15" },
  { unitId: "B 9110 JKL", unitType: "Trailer 4x2 40ft", status: "utilized", lastLocation: "On road to Tj. Priok", lastUpdate: "08 Jul 2026, 16:20" },
  { unitId: "L 8872 JK", unitType: "Trailer 4x2 40ft", status: "downtime", lastLocation: "Depo Marunda", lastUpdate: "08 Jul 2026, 11:00", downtimeCategory: "Scheduled Maintenance" },
  { unitId: "B 9763 MNO", unitType: "Trailer 4x2 40ft", status: "standby", lastLocation: "Depo Cikarang", lastUpdate: "08 Jul 2026, 08:30" },
  { unitId: "BM 8901 AA", unitType: "Trailer 4x2 40ft", status: "standby", lastLocation: "IKK Perawang Yard", lastUpdate: "08 Jul 2026, 13:00" },
  { unitId: "B 9235 PQR", unitType: "Trailer 4x2 40ft", status: "utilized", lastLocation: "Kebon Jeruk Area", lastUpdate: "08 Jul 2026, 12:45" },
  { unitId: "B 9481 STU", unitType: "Trailer 4x2 40ft", status: "downtime", lastLocation: "Depo Jakarta Yard", lastUpdate: "08 Jul 2026, 14:00", downtimeCategory: "Repair / Breakdown" }
];

const indonesianCustomers = [
  "PT Indah Kiat Pulp & Paper",
  "PT Riau Andalan Pulp & Paper",
  "PT Tjiwi Kimia",
  "PT Lontar Papyrus",
  "PT Pindo Deli",
  "PT Pabrik Kertas Tjiwi Kimia",
  "Pancaran Internal"
];

const origins = [
  "IKK Karawang",
  "Tj. Perak Port",
  "Depo Cikarang",
  "IKK Sidoarjo",
  "Tj. Priok Port",
  "IKK Tangerang",
  "Depo Marunda",
  "Tj. Mas Port",
  "IKK Serang",
  "Depo Surabaya"
];

const destinations = [
  "Tj. Priok Port",
  "IKK Serang",
  "Depo Bekasi",
  "Tj. Perak Port",
  "IKK Karawang",
  "Depo Cikarang",
  "IKK Mojokerto",
  "Depo Gresik",
  "Tj. Buton Port",
  "Depo Marunda"
];

const unitTypes = [
  "Trailer 4x2 40ft",
  "Trailer 4x2 20ft"
];

const drivers = [
  "Slamet Riyadi", "Budi Santoso", "Agus Prasetyo", "Iwan Setiawan", "Hendra Wijaya",
  "Eko Prasetyo", "Rian Hidayat", "Zulkilfli", "Ahmad Fauzi", "Dedi Kurniawan",
  "Suherman", "Rahmat Hidayat", "Sugeng", "Mulyono", "Heri Susanto",
  "Andi Wijaya", "Yusuf H.", "Triyono", "Aris Subekti", "Supriyadi", "Kusnadi"
];

const locations = [
  "Tol Cikampek KM 45", "Warehouse IKK Serang", "Tol Jagorawi KM 12", "Tj. Perak Port Yard",
  "Arteri Tangerang", "Margomulyo Surabaya", "Depo Cikarang", "IKK Perawang Depo",
  "Kebon Jeruk Jakarta", "Tj. Priok Port Yard", "Depo Bekasi Yard", "Tol Tangerang KM 18",
  "Tj. Mas Port Buffer Area", "Depo Surabaya Yard", "Tol Cipularang KM 82"
];

const downtimeCategoriesList = [
  "Scheduled Maintenance",
  "Repair / Breakdown",
  "Document Renewal / KIR",
  "Tyre Replacement",
  "No Driver Available"
];

// Indonesian Plate Generator for unique authentic look
export const generateIndonesianPlate = (index: number, prefixSeed: number): string => {
  const prefixes = ["B", "L", "BM", "D", "H", "N", "W"];
  const prefix = prefixes[prefixSeed % prefixes.length];
  const num = 9000 + (index * 7) % 999;
  const suffixes = ["UQA", "PAI", "SFD", "KPA", "JKL", "AA", "PQR", "STU", "JK", "MNO", "VWX", "YZA", "BCD", "EFG", "OP"];
  const suffix = suffixes[(index * 3) % suffixes.length];
  return `${prefix} ${num} ${suffix}`;
};

export const generateOrders = (): Order[] => {
  return seedOrders.map((o) => ({
    id: o.id || "SM-D000001",
    type: o.type || "ekspor",
    status: o.status || "in_progress",
    customer: o.customer || "INDAH KIAT PULP & PAPER TBK.",
    origin: o.origin || "IKK Karawang",
    destination: o.destination || "INDAH KIAT PULP & PAPER TBK.",
    containerTier: "40ft",
    unitType: o.unitType || "Trailer 4x2 40ft",
    eta: o.eta || "29/06/2026 09:00",
    bookingDate: "28/06/2026",
    quantity: o.quantity || 1,
    lastUpdateCS: o.lastUpdateCS || "WAITING CONFIRM",
    driver: o.driver,
    vehiclePlate: o.vehiclePlate,
    source: "Google Sheet"
  }));
};

export const generateShipments = (): Shipment[] => {
  return [];
};

export const generateFleetUnits = (): FleetUnit[] => {
  return [];
};

export const driverStats = {
  total: 0,
  onDuty: 0,
  offDuty: 0
};

export const dummyOrders = generateOrders();
export const dummyShipments = generateShipments();
export const dummyFleetUnits = generateFleetUnits();
