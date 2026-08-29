import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Navigation, 
  MapPin, 
  Truck, 
  Radio, 
  CheckCircle, 
  AlertTriangle, 
  Cpu, 
  Compass, 
  Info, 
  Zap, 
  Map as MapIcon, 
  Eye, 
  TrendingUp,
  Activity,
  User,
  ExternalLink,
  Gauge,
  Search,
  Key,
  Signal,
  Clock,
  Battery,
  Settings,
  RefreshCw
} from "lucide-react";

interface TelemetryData {
  id: string;
  driver: string;
  plate: string;
  speed: number;
  status: "on_trip" | "pre_trip" | "end_trip";
  origin: string;
  destination: string;
  cargo: string;
  temp: string;
  signal: string;
  coords: { x: number; y: number };
  lat: number;
  lng: number;
  latLong: string;
  progress: number;
  bearing: number;
  ignition: boolean;
  fuel: number;
  locationName: string;
  odometer: number;
}

interface RoutePoint {
  x: number;
  y: number;
  lat: number;
  lng: number;
}

// REALISTIC TRANSIT ROUTES WITH COORDINATES TRACING SUMATRA-JAVA GEOGRAPHY (HIGHWAYS & PORTS)
const ROUTE_PERAWANG_TO_PRIOK: RoutePoint[] = [
  { x: 80, y: 75, lat: 0.6754, lng: 101.6214 },   // Perawang Mill (Riau)
  { x: 90, y: 80, lat: 0.5384, lng: 101.4478 },   // Pekanbaru Toll Entrance
  { x: 101, y: 86, lat: 0.5073, lng: 101.4478 },  // Pekanbaru City
  { x: 112, y: 91, lat: 0.4120, lng: 101.8500 },  // Pangkalan Kerinci
  { x: 122, y: 97, lat: 0.2100, lng: 102.0500 },  // Sorek
  { x: 133, y: 102, lat: -0.0500, lng: 102.1500 }, // Ukui
  { x: 144, y: 108, lat: -0.3800, lng: 102.3200 }, // Lirik / Belilas
  { x: 154, y: 113, lat: -0.4850, lng: 102.4332 }, // Pematang Reba (Rengat)
  { x: 165, y: 119, lat: -1.0500, lng: 102.7200 }, // Selensen (Border)
  { x: 176, y: 124, lat: -1.2800, lng: 103.0200 }, // Merlung (Jambi)
  { x: 186, y: 130, lat: -1.4000, lng: 103.5200 }, // Sengeti
  { x: 197, y: 135, lat: -1.6111, lng: 103.6131 }, // Jambi City
  { x: 208, y: 141, lat: -1.8100, lng: 103.6300 }, // Tempino
  { x: 218, y: 146, lat: -2.0396, lng: 103.6828 }, // Bayung Lencir
  { x: 229, y: 152, lat: -2.4200, lng: 104.0500 }, // Sungai Lilin
  { x: 240, y: 157, lat: -2.7300, lng: 104.2000 }, // Betung
  { x: 250, y: 163, lat: -2.8500, lng: 104.3800 }, // Pangkalan Balai
  { x: 261, y: 168, lat: -2.9167, lng: 104.7500 }, // Palembang City
  { x: 272, y: 174, lat: -3.0450, lng: 104.7600 }, // Palembang Toll Gate
  { x: 282, y: 179, lat: -3.3934, lng: 104.8344 }, // Kayu Agung Toll
  { x: 293, y: 185, lat: -4.4500, lng: 105.1000 }, // Menggala Toll
  { x: 304, y: 190, lat: -4.8643, lng: 105.1950 }, // Terbanggi Besar
  { x: 314, y: 196, lat: -4.9800, lng: 105.2100 }, // Gunung Sugih
  { x: 325, y: 201, lat: -5.1800, lng: 105.2000 }, // Tegineneng
  { x: 336, y: 207, lat: -5.3800, lng: 105.2900 }, // Bandar Lampung Toll
  { x: 346, y: 212, lat: -5.7100, lng: 105.5800 }, // Kalianda
  { x: 357, y: 218, lat: -5.8710, lng: 105.7490 }, // Bakauheni Port
  { x: 368, y: 223, lat: -5.9322, lng: 105.9926 }, // Merak Port
  { x: 378, y: 229, lat: -6.0963, lng: 106.2167 }, // Serang Mill
  { x: 389, y: 234, lat: -6.2140, lng: 106.6300 }, // Tangerang Mill
  { x: 400, y: 240, lat: -6.1989, lng: 106.7112 }, // Karang Tengah
  { x: 410, y: 245, lat: -6.1798, lng: 106.7905 }, // Tomang Interchange
  { x: 421, y: 251, lat: -6.1250, lng: 106.7950 }, // Pluit JORR
  { x: 430, y: 258, lat: -6.1023, lng: 106.8928 }  // Tanjung Priok
];

const ROUTE_SERANG_TO_PRIOK: RoutePoint[] = [
  { x: 345, y: 255, lat: -6.0963, lng: 106.2167 }, // Serang Mill
  { x: 350, y: 255, lat: -6.1158, lng: 106.2250 }, // Kragilan Toll Entrance
  { x: 355, y: 255, lat: -6.1360, lng: 106.2845 }, // Ciujung
  { x: 360, y: 256, lat: -6.1952, lng: 106.4528 }, // Balaraja Barat
  { x: 365, y: 256, lat: -6.2085, lng: 106.4950 }, // Balaraja Timur
  { x: 371, y: 256, lat: -6.2301, lng: 106.5412 }, // Cikupa
  { x: 376, y: 256, lat: -6.2280, lng: 106.5780 }, // Bitung Toll
  { x: 381, y: 256, lat: -6.2140, lng: 106.6300 }, // Tangerang Mill
  { x: 386, y: 257, lat: -6.2220, lng: 106.6550 }, // Tangerang Toll Entrance
  { x: 391, y: 257, lat: -6.2215, lng: 106.6920 }, // Kunciran Junction
  { x: 397, y: 257, lat: -6.1989, lng: 106.7112 }, // Karang Tengah
  { x: 402, y: 257, lat: -6.1920, lng: 106.7360 }, // Meruya
  { x: 407, y: 257, lat: -6.1915, lng: 106.7650 }, // Kebon Jeruk
  { x: 412, y: 258, lat: -6.1798, lng: 106.7905 }, // Tomang Interchange
  { x: 418, y: 258, lat: -6.1650, lng: 106.7880 }, // Grogol
  { x: 423, y: 258, lat: -6.1320, lng: 106.7910 }, // Jembatan Tiga
  { x: 425, y: 258, lat: -6.1150, lng: 106.7950 }, // Pluit
  { x: 427, y: 258, lat: -6.1260, lng: 106.8150 }, // Ancol
  { x: 428, y: 258, lat: -6.1410, lng: 106.8480 }, // Kemayoran Toll
  { x: 429, y: 258, lat: -6.1150, lng: 106.8850 }, // Tanjung Priok Toll Exit
  { x: 430, y: 258, lat: -6.1023, lng: 106.8928 }  // Tanjung Priok Port
];

const ROUTE_TANGERANG_TO_MERAK: RoutePoint[] = [
  { x: 390, y: 260, lat: -6.2140, lng: 106.6300 }, // Tangerang Mill
  { x: 382, y: 258, lat: -6.2220, lng: 106.6550 }, // Tangerang Toll
  { x: 375, y: 256, lat: -6.2280, lng: 106.5780 }, // Bitung Toll
  { x: 367, y: 254, lat: -6.2301, lng: 106.5412 }, // Cikupa
  { x: 360, y: 252, lat: -6.2085, lng: 106.4950 }, // Balaraja Timur
  { x: 353, y: 250, lat: -6.1952, lng: 106.4528 }, // Balaraja Barat
  { x: 346, y: 248, lat: -6.1360, lng: 106.2845 }, // Ciujung
  { x: 338, y: 246, lat: -6.0963, lng: 106.2167 }, // Kragilan / Serang Mill
  { x: 331, y: 245, lat: -6.1158, lng: 106.1345 }, // Serang East Toll
  { x: 324, y: 243, lat: -6.0950, lng: 106.1050 }, // Serang West Toll
  { x: 317, y: 241, lat: -6.0125, lng: 106.0792 }, // Cilegon East Toll
  { x: 310, y: 239, lat: -5.9850, lng: 106.0180 }, // Cilegon West Toll
  { x: 305, y: 238, lat: -5.9322, lng: 105.9926 }  // Merak Port
];

const ROUTE_PRIOK_TO_SURABAYA: RoutePoint[] = [
  { x: 430, y: 258, lat: -6.1023, lng: 106.8928 }, // Tanjung Priok
  { x: 437, y: 259, lat: -6.1400, lng: 106.9450 }, // JORR Toll Cincing
  { x: 444, y: 261, lat: -6.2550, lng: 106.9650 }, // Cikunir Junction
  { x: 451, y: 262, lat: -6.2410, lng: 106.9921 }, // Bekasi West Toll
  { x: 458, y: 264, lat: -6.2620, lng: 107.0250 }, // Bekasi East Toll
  { x: 466, y: 265, lat: -6.2780, lng: 107.0650 }, // Tambun Toll
  { x: 473, y: 267, lat: -6.2910, lng: 107.1350 }, // Cikarang West Toll
  { x: 480, y: 268, lat: -6.3150, lng: 107.1720 }, // Cikarang Central Toll
  { x: 487, y: 270, lat: -6.3210, lng: 107.2650 }, // Karawang West Toll
  { x: 494, y: 271, lat: -6.3550, lng: 107.3320 }, // Karawang East Toll
  { x: 501, y: 273, lat: -6.4022, lng: 107.4435 }, // Cikampek / Kalihurip Toll
  { x: 508, y: 274, lat: -6.4250, lng: 107.4850 }, // Cipali Toll Km 72
  { x: 516, y: 276, lat: -6.5332, lng: 107.7500 }, // Cipali Toll Subang Km 102
  { x: 523, y: 277, lat: -6.5950, lng: 108.0320 }, // Cipali Toll Cikedung Km 138
  { x: 530, y: 279, lat: -6.6500, lng: 108.1800 }, // Cipali Toll Majalengka Km 166
  { x: 537, y: 280, lat: -6.7112, lng: 108.4350 }, // Palimanan Toll (Cirebon) Km 188
  { x: 544, y: 281, lat: -6.7820, lng: 108.6210 }, // Kanci Toll Km 214
  { x: 551, y: 283, lat: -6.8850, lng: 108.9220 }, // Pejagan Toll (Brebes) Km 248
  { x: 558, y: 284, lat: -6.9120, lng: 109.3500 }, // Pemalang Toll Km 312
  { x: 566, y: 286, lat: -6.9550, lng: 109.6800 }, // Pekalongan Toll Km 342
  { x: 573, y: 287, lat: -6.9710, lng: 109.9100 }, // Batang Toll Km 370
  { x: 580, y: 289, lat: -6.9920, lng: 110.3550 }, // Krapyak Toll (Semarang) Km 420
  { x: 587, y: 290, lat: -7.0250, lng: 110.4250 }, // Jatingaleh Toll (Semarang)
  { x: 594, y: 292, lat: -7.1250, lng: 110.4350 }, // Ungaran Toll
  { x: 601, y: 293, lat: -7.2350, lng: 110.4420 }, // Bawen Toll
  { x: 608, y: 295, lat: -7.3150, lng: 110.5150 }, // Salatiga Toll
  { x: 616, y: 296, lat: -7.5250, lng: 110.6120 }, // Boyolali Toll
  { x: 623, y: 298, lat: -7.5320, lng: 110.7450 }, // Colomadu Toll (Solo)
  { x: 630, y: 299, lat: -7.5120, lng: 110.9250 }, // Karanganyar Toll
  { x: 637, y: 301, lat: -7.4250, lng: 111.0250 }, // Sragen Toll
  { x: 644, y: 302, lat: -7.4120, lng: 111.4150 }, // Ngawi Toll
  { x: 651, y: 304, lat: -7.5550, lng: 111.6210 }, // Madiun Toll
  { x: 658, y: 305, lat: -7.5950, lng: 111.9120 }, // Nganjuk Toll
  { x: 666, y: 307, lat: -7.5850, lng: 112.0950 }, // Kertosono
  { x: 673, y: 308, lat: -7.5220, lng: 112.2450 }, // Jombang Toll
  { x: 680, y: 310, lat: -7.4350, lng: 112.4420 }, // Mojokerto Toll
  { x: 687, y: 311, lat: -7.3450, lng: 112.7210 }, // Waru Junction (Surabaya)
  { x: 710, y: 315, lat: -7.2004, lng: 112.7308 }  // Surabaya Cargo Hub
];

const ROUTE_SERANG_TO_SURABAYA: RoutePoint[] = [
  { x: 345, y: 255, lat: -6.0963, lng: 106.2167 }, // Serang Mill
  { x: 351, y: 256, lat: -6.1158, lng: 106.2250 }, // Kragilan Toll Entrance
  { x: 358, y: 257, lat: -6.1360, lng: 106.2845 }, // Ciujung
  { x: 364, y: 258, lat: -6.1952, lng: 106.4528 }, // Balaraja Barat
  { x: 371, y: 259, lat: -6.2085, lng: 106.4950 }, // Balaraja Timur
  { x: 377, y: 260, lat: -6.2301, lng: 106.5412 }, // Cikupa
  { x: 384, y: 261, lat: -6.2280, lng: 106.5780 }, // Bitung Toll
  { x: 390, y: 262, lat: -6.2140, lng: 106.6300 }, // Tangerang Mill
  { x: 397, y: 263, lat: -6.2220, lng: 106.6550 }, // Tangerang Toll Entrance
  { x: 403, y: 264, lat: -6.2215, lng: 106.6920 }, // Kunciran Junction
  { x: 410, y: 265, lat: -6.1989, lng: 106.7112 }, // Karang Tengah
  { x: 416, y: 266, lat: -6.1920, lng: 106.7360 }, // Meruya
  { x: 423, y: 267, lat: -6.1915, lng: 106.7650 }, // Kebon Jeruk
  { x: 429, y: 268, lat: -6.1798, lng: 106.7905 }, // Tomang Interchange
  { x: 436, y: 269, lat: -6.1650, lng: 106.7880 }, // Grogol
  { x: 442, y: 270, lat: -6.1320, lng: 106.7910 }, // Jembatan Tiga
  { x: 449, y: 271, lat: -6.1150, lng: 106.7950 }, // Pluit
  { x: 455, y: 272, lat: -6.1260, lng: 106.8150 }, // Ancol
  { x: 462, y: 273, lat: -6.1410, lng: 106.8480 }, // Kemayoran Toll
  { x: 468, y: 274, lat: -6.1023, lng: 106.8928 }, // Tanjung Priok
  { x: 475, y: 275, lat: -6.1400, lng: 106.9450 }, // JORR Toll Cincing
  { x: 481, y: 276, lat: -6.2550, lng: 106.9650 }, // Cikunir Junction
  { x: 488, y: 277, lat: -6.2410, lng: 106.9921 }, // Bekasi West Toll
  { x: 494, y: 278, lat: -6.2620, lng: 107.0250 }, // Bekasi East Toll
  { x: 501, y: 279, lat: -6.2780, lng: 107.0650 }, // Tambun Toll
  { x: 507, y: 280, lat: -6.2910, lng: 107.1350 }, // Cikarang West Toll
  { x: 514, y: 281, lat: -6.3150, lng: 107.1720 }, // Cikarang Central Toll
  { x: 520, y: 282, lat: -6.3210, lng: 107.2650 }, // Karawang West Toll
  { x: 527, y: 283, lat: -6.3550, lng: 107.3320 }, // Karawang East Toll
  { x: 533, y: 284, lat: -6.4022, lng: 107.4435 }, // Cikampek / Kalihurip Toll
  { x: 540, y: 285, lat: -6.4250, lng: 107.4850 }, // Cipali Toll Km 72
  { x: 546, y: 286, lat: -6.5332, lng: 107.7500 }, // Cipali Toll Subang Km 102
  { x: 553, y: 287, lat: -6.5950, lng: 108.0320 }, // Cipali Toll Cikedung Km 138
  { x: 559, y: 288, lat: -6.6500, lng: 108.1800 }, // Cipali Toll Majalengka Km 166
  { x: 566, y: 289, lat: -6.7112, lng: 108.4350 }, // Palimanan Toll (Cirebon) Km 188
  { x: 572, y: 290, lat: -6.7820, lng: 108.6210 }, // Kanci Toll Km 214
  { x: 579, y: 291, lat: -6.8850, lng: 108.9220 }, // Pejagan Toll (Brebes) Km 248
  { x: 585, y: 292, lat: -6.9120, lng: 109.3500 }, // Pemalang Toll Km 312
  { x: 592, y: 293, lat: -6.9550, lng: 109.6800 }, // Pekalongan Toll Km 342
  { x: 598, y: 294, lat: -6.9710, lng: 109.9100 }, // Batang Toll Km 370
  { x: 605, y: 295, lat: -6.9920, lng: 110.3550 }, // Krapyak Toll (Semarang) Km 420
  { x: 611, y: 296, lat: -7.0250, lng: 110.4250 }, // Jatingaleh Toll (Semarang)
  { x: 618, y: 297, lat: -7.1250, lng: 110.4350 }, // Ungaran Toll
  { x: 624, y: 298, lat: -7.2350, lng: 110.4420 }, // Bawen Toll
  { x: 631, y: 299, lat: -7.3150, lng: 110.5150 }, // Salatiga Toll
  { x: 637, y: 300, lat: -7.5250, lng: 110.6120 }, // Boyolali Toll
  { x: 644, y: 301, lat: -7.5320, lng: 110.7450 }, // Colomadu Toll (Solo)
  { x: 650, y: 302, lat: -7.5120, lng: 110.9250 }, // Karanganyar Toll
  { x: 657, y: 303, lat: -7.4250, lng: 111.0250 }, // Sragen Toll
  { x: 663, y: 304, lat: -7.4120, lng: 111.4150 }, // Ngawi Toll
  { x: 670, y: 305, lat: -7.5550, lng: 111.6210 }, // Madiun Toll
  { x: 676, y: 306, lat: -7.5950, lng: 111.9120 }, // Nganjuk Toll
  { x: 683, y: 307, lat: -7.5850, lng: 112.0950 }, // Kertosono
  { x: 689, y: 308, lat: -7.5220, lng: 112.2450 }, // Jombang Toll
  { x: 696, y: 309, lat: -7.4350, lng: 112.4420 }, // Mojokerto Toll
  { x: 702, y: 310, lat: -7.3450, lng: 112.7210 }, // Waru Junction (Surabaya)
  { x: 710, y: 315, lat: -7.2004, lng: 112.7308 }  // Surabaya Cargo Hub
];

// CALCULATE MATHEMATICAL BEARING (DEGREES) BETWEEN TWO LAT/LONG COORDS FOR VEHICLE ANGLE
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const rLat1 = lat1 * Math.PI / 180;
  const rLat2 = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLng) * Math.cos(rLat2);
  const x = Math.cos(rLat1) * Math.sin(rLat2) - Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLng);
  
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return Math.round((brng + 360) % 360);
}

// REAL GEOFENCED GEOFENCE ADDRESS TRANSLATOR BASED ON SIMULATED ROUTE PROGRESS
function getGeofenceAddress(truckId: string, progress: number, status: string): string {
  if (status === "pre_trip") {
    if (truckId === "PCN-2026-042") return "IKPP Tangerang Mill Departure Bay, Gate 2";
    return "Factory Loading Depot Facility";
  }
  if (status === "end_trip") {
    if (truckId === "PCN-2026-150") return "Surabaya Cargo Hub Logistics Dock 4B";
    return "Delivery Yard Terminal Station";
  }
  
  if (truckId === "PCN-2026-089") {
    if (progress < 0.1) return "Leaving IKPP Serang Mill Yard Area";
    if (progress < 0.35) return "Tangerang-Merak Toll Highway Km 38";
    if (progress < 0.65) return "Jakarta-Tangerang Expressway Km 12";
    if (progress < 0.85) return "Tomang Elevated Highway, West Jakarta";
    return "Tanjung Priok Port Access Blvd, North Jakarta";
  }
  if (truckId === "PCN-2026-112") {
    if (progress < 0.1) return "Riau Provincial Highway, Perawang";
    if (progress < 0.25) return "Trans-Sumatra Hwy Segment 3 (Jambi Area)";
    if (progress < 0.42) return "Palembang-Lampung Toll Road Km 182";
    if (progress < 0.55) return "Bakauheni Depot Entrance, Lampung";
    if (progress < 0.7) return "Sunda Strait Transit Ferry Vessel Crossing";
    if (progress < 0.85) return "Merak-Tangerang Highway Sector 4";
    return "Jakarta Outer Ring Road (Eastbound Segment)";
  }
  if (truckId === "PCN-2026-077") {
    if (progress < 0.1) return "Serang East Bypass Hwy Sector";
    if (progress < 0.22) return "Jakarta-Cikampek Toll Road Km 52";
    if (progress < 0.4) return "Cirebon Interchange Link, West Java";
    if (progress < 0.62) return "Semarang Bypass Ring Road, Central Java";
    if (progress < 0.82) return "Solo-Kertosono Toll Expressway Km 440";
    return "Surabaya Outer Ring Road near Cargo Port";
  }
  
  return "State Expressway Cargo Route Segment";
}

// SEGMENT INTERPOLATION FUNCTION FOR SMOOTH TRANSIT TRACKING WITH HEADING CALCULATIONS
function interpolateRoute(points: RoutePoint[], progress: number) {
  if (points.length === 0) return { x: 0, y: 0, lat: 0, lng: 0, bearing: 0 };
  if (points.length === 1) return { x: points[0].x, y: points[0].y, lat: points[0].lat, lng: points[0].lng, bearing: 0 };
  
  if (progress <= 0) {
    const bearing = points.length > 1 ? calculateBearing(points[0].lat, points[0].lng, points[1].lat, points[1].lng) : 0;
    return { x: points[0].x, y: points[0].y, lat: points[0].lat, lng: points[0].lng, bearing };
  }
  if (progress >= 1) {
    const lastIdx = points.length - 1;
    const bearing = lastIdx > 0 ? calculateBearing(points[lastIdx - 1].lat, points[lastIdx - 1].lng, points[lastIdx].lat, points[lastIdx].lng) : 0;
    return { x: points[lastIdx].x, y: points[lastIdx].y, lat: points[lastIdx].lat, lng: points[lastIdx].lng, bearing };
  }

  const segmentCount = points.length - 1;
  const scaledProgress = progress * segmentCount;
  const index = Math.floor(scaledProgress);
  const localProgress = scaledProgress - index;

  const p1 = points[index];
  const p2 = points[index + 1];

  const bearing = calculateBearing(p1.lat, p1.lng, p2.lat, p2.lng);

  return {
    x: p1.x + (p2.x - p1.x) * localProgress,
    y: p1.y + (p2.y - p1.y) * localProgress,
    lat: p1.lat + (p2.lat - p1.lat) * localProgress,
    lng: p1.lng + (p2.lng - p1.lng) * localProgress,
    bearing
  };
}

// GENERATE SVG COMMANDS PATH STRING FROM COORDINATES ARRAY
function getSvgPath(points: RoutePoint[]) {
  return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

// PREMIUM LIVE INTERACTIVE LEAFLET MAP HTML TEMPLATE WITH MULTI-THEME ENGINE (CARTRACK/NEON STYLES)
const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #020d26;
    }
    .custom-div-icon {
      background: transparent;
      border: none;
      transition: transform 0.15s linear !important;
    }
    .truck-marker-container {
      position: relative;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .truck-marker-pulse {
      position: absolute;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.25);
      animation: pulse 2s infinite ease-out;
      pointer-events: none;
    }
    .truck-marker-pulse.status-pre_trip {
      background: rgba(245, 158, 11, 0.25);
    }
    .truck-marker-pulse.status-end_trip {
      background: rgba(100, 116, 139, 0.25);
    }
    .truck-marker-ring {
      position: relative;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #ffffff;
      border: 3px solid #64748b;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: all 0.2s ease;
    }
    .truck-marker-ring.status-on_trip {
      border-color: #10B981;
    }
    .truck-marker-ring.status-pre_trip {
      border-color: #F59E0B;
    }
    .truck-marker-ring.status-end_trip {
      border-color: #64748b;
    }
    .truck-marker-ring.selected {
      border-color: #00AEEF;
      transform: scale(1.15);
      box-shadow: 0 0 14px rgba(0, 174, 239, 0.7);
    }
    .truck-direction-chevron {
      width: 14px;
      height: 14px;
      fill: #64748b;
      transition: transform 0.15s linear;
    }
    .status-on_trip .truck-direction-chevron {
      fill: #10B981;
    }
    .status-pre_trip .truck-direction-chevron {
      fill: #F59E0B;
    }
    .status-end_trip .truck-direction-chevron {
      fill: #64748b;
    }
    
    .marker-label {
      background: #020D26;
      color: #ffffff;
      font-family: monospace;
      font-size: 11px;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 6px;
      border: 2px solid #1e293b;
      position: absolute;
      top: -24px;
      white-space: nowrap;
      transform: translateX(-50%);
      left: 50%;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 20;
      transition: all 0.2s ease;
    }
    .marker-label.selected {
      border-color: #00AEEF;
      color: #00AEEF;
      box-shadow: 0 0 12px rgba(0, 174, 239, 0.6);
      transform: translateX(-50%) scale(1.1);
    }

    @keyframes pulse {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }

    /* Landmark Div styles */
    .landmark-div-icon {
      background: transparent;
      border: none;
    }
    .landmark-marker-container {
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .landmark-marker-ring {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 8px rgba(0,0,0,0.4);
      transition: all 0.2s ease;
    }
    .landmark-marker-ring:hover {
      transform: scale(1.15);
    }
    .landmark-marker-tooltip {
      position: absolute;
      bottom: -22px;
      background: rgba(15, 23, 42, 0.9);
      color: #cbd5e1;
      font-family: system-ui, sans-serif;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      transform: translateX(-50%);
      left: 50%;
      border: 1px solid rgba(255,255,255,0.08);
      pointer-events: none;
    }

    /* Elegant layer switch control */
    .map-theme-selector {
      position: absolute;
      top: 15px;
      left: 15px;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      gap: 4px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.45);
    }
    .map-theme-selector button {
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 800;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .map-theme-selector button:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.05);
    }
    .map-theme-selector button.active {
      background: #10B981;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  
  <div class="map-theme-selector">
    <button onclick="setTileLayer('dark')" class="active" id="theme-btn-dark">Dark</button>
    <button onclick="setTileLayer('light')" id="theme-btn-light">Light</button>
    <button onclick="setTileLayer('satellite')" id="theme-btn-satellite">Satellite</button>
  </div>

  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([-6.1023, 106.8928], 11);

    L.control.zoom({ position: 'topright' }).addTo(map);

    let currentTileLayer = null;
    const tileLayers = {
      dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }),
      light: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      })
    };

    function setTileLayer(style) {
      if (currentTileLayer) {
        map.removeLayer(currentTileLayer);
      }
      currentTileLayer = tileLayers[style];
      currentTileLayer.addTo(map);

      // Update button state
      ['dark', 'light', 'satellite'].forEach(s => {
        const btn = document.getElementById('theme-btn-' + s);
        if (btn) {
          if (s === style) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        }
      });
    }

    // Default to Dark theme
    setTileLayer('dark');

    const routes = {
      ROUTE_PERAWANG_TO_PRIOK: [
        [0.6754, 101.6214],
        [0.5384, 101.4478],
        [0.5073, 101.4478],
        [0.4120, 101.8500],
        [0.2100, 102.0500],
        [-0.0500, 102.1500],
        [-0.3800, 102.3200],
        [-0.4850, 102.4332],
        [-1.0500, 102.7200],
        [-1.2800, 103.0200],
        [-1.4000, 103.5200],
        [-1.6111, 103.6131],
        [-1.8100, 103.6300],
        [-2.0396, 103.6828],
        [-2.4200, 104.0500],
        [-2.7300, 104.2000],
        [-2.8500, 104.3800],
        [-2.9167, 104.7500],
        [-3.0450, 104.7600],
        [-3.3934, 104.8344],
        [-4.4500, 105.1000],
        [-4.8643, 105.1950],
        [-4.9800, 105.2100],
        [-5.1800, 105.2000],
        [-5.3800, 105.2900],
        [-5.7100, 105.5800],
        [-5.8710, 105.7490],
        [-5.9322, 105.9926],
        [-6.0963, 106.2167],
        [-6.2140, 106.6300],
        [-6.1989, 106.7112],
        [-6.1798, 106.7905],
        [-6.1250, 106.7950],
        [-6.1023, 106.8928]
      ],
      ROUTE_SERANG_TO_PRIOK: [
        [-6.0963, 106.2167],
        [-6.1158, 106.2250],
        [-6.1360, 106.2845],
        [-6.1952, 106.4528],
        [-6.2085, 106.4950],
        [-6.2301, 106.5412],
        [-6.2280, 106.5780],
        [-6.2140, 106.6300],
        [-6.2220, 106.6550],
        [-6.2215, 106.6920],
        [-6.1989, 106.7112],
        [-6.1920, 106.7360],
        [-6.1915, 106.7650],
        [-6.1798, 106.7905],
        [-6.1650, 106.7880],
        [-6.1320, 106.7910],
        [-6.1150, 106.7950],
        [-6.1260, 106.8150],
        [-6.1410, 106.8480],
        [-6.1150, 106.8850],
        [-6.1023, 106.8928]
      ],
      ROUTE_TANGERANG_TO_MERAK: [
        [-6.2140, 106.6300],
        [-6.2220, 106.6550],
        [-6.2280, 106.5780],
        [-6.2301, 106.5412],
        [-6.2085, 106.4950],
        [-6.1952, 106.4528],
        [-6.1360, 106.2845],
        [-6.0963, 106.2167],
        [-6.1158, 106.1345],
        [-6.0950, 106.1050],
        [-6.0125, 106.0792],
        [-5.9850, 106.0180],
        [-5.9322, 105.9926]
      ],
      ROUTE_PRIOK_TO_SURABAYA: [
        [-6.1023, 106.8928],
        [-6.1400, 106.9450],
        [-6.2550, 106.9650],
        [-6.2410, 106.9921],
        [-6.2620, 107.0250],
        [-6.2780, 107.0650],
        [-6.2910, 107.1350],
        [-6.3150, 107.1720],
        [-6.3210, 107.2650],
        [-6.3550, 107.3320],
        [-6.4022, 107.4435],
        [-6.4250, 107.4850],
        [-6.5332, 107.7500],
        [-6.5950, 108.0320],
        [-6.6500, 108.1800],
        [-6.7112, 108.4350],
        [-6.7820, 108.6210],
        [-6.8850, 108.9220],
        [-6.9120, 109.3500],
        [-6.9550, 109.6800],
        [-6.9710, 109.9100],
        [-6.9920, 110.3550],
        [-7.0250, 110.4250],
        [-7.1250, 110.4350],
        [-7.2350, 110.4420],
        [-7.3150, 110.5150],
        [-7.5250, 110.6120],
        [-7.5320, 110.7450],
        [-7.5120, 110.9250],
        [-7.4250, 111.0250],
        [-7.4120, 111.4150],
        [-7.5550, 111.6210],
        [-7.5950, 111.9120],
        [-7.5850, 112.0950],
        [-7.5220, 112.2450],
        [-7.4350, 112.4420],
        [-7.3450, 112.7210],
        [-7.2004, 112.7308]
      ],
      ROUTE_SERANG_TO_SURABAYA: [
        [-6.0963, 106.2167],
        [-6.1158, 106.2250],
        [-6.1360, 106.2845],
        [-6.1952, 106.4528],
        [-6.2085, 106.4950],
        [-6.2301, 106.5412],
        [-6.2280, 106.5780],
        [-6.2140, 106.6300],
        [-6.2220, 106.6550],
        [-6.2215, 106.6920],
        [-6.1989, 106.7112],
        [-6.1920, 106.7360],
        [-6.1915, 106.7650],
        [-6.1798, 106.7905],
        [-6.1650, 106.7880],
        [-6.1320, 106.7910],
        [-6.1150, 106.7950],
        [-6.1260, 106.8150],
        [-6.1410, 106.8480],
        [-6.1023, 106.8928],
        [-6.1400, 106.9450],
        [-6.2550, 106.9650],
        [-6.2410, 106.9921],
        [-6.2620, 107.0250],
        [-6.2780, 107.0650],
        [-6.2910, 107.1350],
        [-6.3150, 107.1720],
        [-6.3210, 107.2650],
        [-6.3550, 107.3320],
        [-6.4022, 107.4435],
        [-6.4250, 107.4850],
        [-6.5332, 107.7500],
        [-6.5950, 108.0320],
        [-6.6500, 108.1800],
        [-6.7112, 108.4350],
        [-6.7820, 108.6210],
        [-6.8850, 108.9220],
        [-6.9120, 109.3500],
        [-6.9550, 109.6800],
        [-6.9710, 109.9100],
        [-6.9920, 110.3550],
        [-7.0250, 110.4250],
        [-7.1250, 110.4350],
        [-7.2350, 110.4420],
        [-7.3150, 110.5150],
        [-7.5250, 110.6120],
        [-7.5320, 110.7450],
        [-7.5120, 110.9250],
        [-7.4250, 111.0250],
        [-7.4120, 111.4150],
        [-7.5550, 111.6210],
        [-7.5950, 111.9120],
        [-7.5850, 112.0950],
        [-7.5220, 112.2450],
        [-7.4350, 112.4420],
        [-7.3450, 112.7210],
        [-7.2004, 112.7308]
      ]
    };

    const referenceLines = {};
    function drawReferenceLines() {
      Object.keys(referenceLines).forEach(key => {
        map.removeLayer(referenceLines[key]);
      });
      Object.keys(routes).forEach(key => {
        referenceLines[key] = L.polyline(routes[key], {
          color: '#38bdf8',
          weight: 3.5,
          opacity: 0.12,
          dashArray: '8, 6'
        }).addTo(map);
      });
    }
    drawReferenceLines();

    // Add Landmark Geofences
    const landmarks = [
      { name: "Tanjung Priok Port (Jakarta)", lat: -6.1023, lng: 106.8928, type: "port", desc: "Primary maritime shipping gateway" },
      { name: "IKPP Serang Mill (Banten)", lat: -6.0963, lng: 106.2167, type: "factory", desc: "PT Indah Kiat Pulp & Paper - Serang facility" },
      { name: "IKPP Tangerang Mill", lat: -6.2140, lng: 106.6300, type: "factory", desc: "PT Indah Kiat Pulp & Paper - Tangerang facility" },
      { name: "IKPP Perawang Mill (Riau)", lat: 0.6754, lng: 101.6214, type: "factory", desc: "PT Indah Kiat Pulp & Paper - Sumatra Mill" },
      { name: "Surabaya Cargo Hub", lat: -7.2004, lng: 112.7308, type: "port", desc: "Eastern Java primary logistics hub" }
    ];

    landmarks.forEach(l => {
      let iconColor = l.type === 'factory' ? '#0F172A' : '#1e293b';
      let iconBorder = l.type === 'factory' ? '#00eeff' : '#10b981';
      let iconSvg = '';
      
      if (l.type === 'factory') {
        iconSvg = \`
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="\${iconBorder}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v12H2V10l8-5 4 3z"/>
            <path d="M6 14h4v4H6z"/>
          </svg>
        \`;
      } else {
        iconSvg = \`
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="\${iconBorder}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22a7 7 0 0 0 7-7h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 7 7z"/>
            <path d="M12 2v14M12 5c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3z"/>
          </svg>
        \`;
      }

      const landmarkHtml = \`
        <div class="landmark-marker-container">
          <div class="landmark-marker-ring" style="background: \${iconColor}; border: 2.5px solid \${iconBorder};">
            \${iconSvg}
          </div>
          <div class="landmark-marker-tooltip">\${l.name.split(' (')[0]}</div>
        </div>
\`;

      const landmarkIcon = L.divIcon({
        html: landmarkHtml,
        className: 'landmark-div-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      L.marker([l.lat, l.lng], { icon: landmarkIcon }).addTo(map)
        .bindPopup(\`<div style="font-family:sans-serif;color:#1e293b;padding:2px;"><b style="font-size:12px;color:#0b2c6b;">\${l.name}</b><br><span style="font-size:11px;color:#64748b;">\${l.desc}</span></div>\`);
    });

    const markers = {};
    let activeRouteLine = null;

    // Listen to React parent messages
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'UPDATE') {
        const { trucks, selectedTruckId } = data;

        // Clean obsolete markers
        const activeIds = trucks.map(t => t.id);
        Object.keys(markers).forEach(id => {
          if (!activeIds.includes(id)) {
            map.removeLayer(markers[id]);
            delete markers[id];
          }
        });

        // Add or update markers
        trucks.forEach(truck => {
          const isSelected = selectedTruckId === truck.id;
          const statusClass = 'status-' + truck.status;
          const labelClass = isSelected ? 'marker-label selected' : 'marker-label';
          const heading = truck.bearing || 0;
          
          const iconHtml = \`
            <div class="truck-marker-container">
              <div class="truck-marker-pulse \${statusClass}"></div>
              <div class="truck-marker-ring \${statusClass} \${isSelected ? 'selected' : ''}">
                <svg class="truck-direction-chevron" viewBox="0 0 24 24" style="transform: rotate(\${heading}deg);">
                  <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/>
                </svg>
              </div>
              <div class="\${labelClass}">\${truck.id.split('-')[2]}</div>
            </div>
          \`;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-div-icon',
            iconSize: [44, 44],
            iconAnchor: [22, 22]
          });

          if (markers[truck.id]) {
            markers[truck.id].setLatLng([truck.lat, truck.lng]);
            markers[truck.id].setIcon(customIcon);
          } else {
            const marker = L.marker([truck.lat, truck.lng], { icon: customIcon }).addTo(map);
            marker.on('click', () => {
              window.parent.postMessage({ type: 'SELECT_TRUCK', id: truck.id }, '*');
            });
            markers[truck.id] = marker;
          }
        });

        // Route highlight
        if (activeRouteLine) {
          map.removeLayer(activeRouteLine);
          activeRouteLine = null;
        }

        if (selectedTruckId) {
          const selectedTruck = trucks.find(t => t.id === selectedTruckId);
          if (selectedTruck) {
            let activeRouteKey = null;
            if (selectedTruckId === 'PCN-2026-089') activeRouteKey = 'ROUTE_SERANG_TO_PRIOK';
            else if (selectedTruckId === 'PCN-2026-112') activeRouteKey = 'ROUTE_PERAWANG_TO_PRIOK';
            else if (selectedTruckId === 'PCN-2026-077') activeRouteKey = 'ROUTE_SERANG_TO_SURABAYA';
            else if (selectedTruckId === 'PCN-2026-042') activeRouteKey = 'ROUTE_TANGERANG_TO_MERAK';
            else if (selectedTruckId === 'PCN-2026-150') activeRouteKey = 'ROUTE_PRIOK_TO_SURABAYA';

            if (activeRouteKey && routes[activeRouteKey]) {
              const rPoints = routes[activeRouteKey];
              if (selectedTruck.status === 'on_trip') {
                const segCount = rPoints.length - 1;
                const sProgress = selectedTruck.progress * segCount;
                const idx = Math.floor(sProgress);
                const traveled = rPoints.slice(0, idx + 1);
                traveled.push([selectedTruck.lat, selectedTruck.lng]);

                activeRouteLine = L.polyline(traveled, {
                  color: '#10B981',
                  weight: 5,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round'
                }).addTo(map);
              } else {
                activeRouteLine = L.polyline(rPoints, {
                  color: selectedTruck.status === 'end_trip' ? '#64748b' : '#F59E0B',
                  weight: 4,
                  opacity: 0.7,
                  dashArray: '5, 5'
                }).addTo(map);
              }
            }
          }
        }
      } else if (data.type === 'SET_CENTER') {
        const { lat, lng, zoom } = data;
        map.setView([lat, lng], zoom, {
          animate: true,
          duration: 1.2
        });
      } else if (data.type === 'UPDATE_SINGLE_ROUTE') {
        const { key, coords } = data;
        routes[key] = coords;
        drawReferenceLines();
      }
    });

    window.parent.postMessage({ type: 'MAP_READY' }, '*');
  </script>
</body>
</html>
`;

export default function GpsMap() {
  const [activeTab, setActiveTab] = useState<"all" | "on_trip" | "pre_trip" | "end_trip">("all");
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: -6.1023,
    lng: 106.8928,
    zoom: 11
  });
  const [simulationSpeed, setSimulationSpeed] = useState<number>(0.05);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<string>("Tanjung Priok Port (Jakarta)");

  const [routesMap, setRoutesMap] = useState<Record<string, RoutePoint[]>>({
    ROUTE_SERANG_TO_PRIOK: ROUTE_SERANG_TO_PRIOK,
    ROUTE_PERAWANG_TO_PRIOK: ROUTE_PERAWANG_TO_PRIOK,
    ROUTE_SERANG_TO_SURABAYA: ROUTE_SERANG_TO_SURABAYA,
    ROUTE_TANGERANG_TO_MERAK: ROUTE_TANGERANG_TO_MERAK,
    ROUTE_PRIOK_TO_SURABAYA: ROUTE_PRIOK_TO_SURABAYA
  });

  // Live API integration states
  const [useLiveApi, setUseLiveApi] = useState<boolean>(false);
  const [apiUrl, setApiUrl] = useState<string>("https://api.example.com/fleet/tracking");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showApiSettings, setShowApiSettings] = useState<boolean>(false);

  // Pre-calculated landmark positions for Google Map focusing
  const landmarks = [
    { name: "Tanjung Priok Port (Jakarta)", lat: -6.1023, lng: 106.8928, zoom: 14, desc: "Primary international maritime gateway for export shipping" },
    { name: "IKPP Serang Mill (Banten)", lat: -6.0963, lng: 106.2167, zoom: 15, desc: "PT Indah Kiat Pulp & Paper Tbk - Serang manufacturing facility" },
    { name: "IKPP Tangerang Mill", lat: -6.2140, lng: 106.6300, zoom: 15, desc: "PT Indah Kiat Pulp & Paper Tbk - Tangerang facility" },
    { name: "IKPP Perawang Mill (Riau)", lat: 0.6754, lng: 101.6214, zoom: 14, desc: "PT Indah Kiat Pulp & Paper Tbk - Sumatra Pulp & Paper Mill" },
    { name: "Surabaya Cargo Hub", lat: -7.2004, lng: 112.7308, zoom: 14, desc: "Eastern Java distribution and logistics terminal" },
  ];

  // Real-world simulation routes with actual lat/long coordinates, expanded with standard telematics specs
  const [trucks, setTrucks] = useState<TelemetryData[]>([
    {
      id: "PCN-2026-089",
      driver: "Bambang Pamungkas",
      plate: "B 9845 LQA",
      speed: 68,
      status: "on_trip",
      origin: "IKPP Serang Mill (Banten)",
      destination: "Tanjung Priok Port (Jakarta)",
      cargo: "Premium Duplex Board Paper Roll",
      temp: "27.5 °C",
      signal: "Excellent (5G Live)",
      coords: { x: 345, y: 255 },
      lat: -6.0963,
      lng: 106.2167,
      latLong: "-6.0963° S, 106.2167° E",
      progress: 0.35,
      bearing: 82,
      ignition: true,
      fuel: 85,
      locationName: "Tangerang-Merak Toll Highway Km 38",
      odometer: 148201.4,
    },
    {
      id: "PCN-2026-112",
      driver: "Ahmad Subarjo",
      plate: "B 9012 KFU",
      speed: 74,
      status: "on_trip",
      origin: "IKPP Perawang Mill (Riau)",
      destination: "Tanjung Priok Port (Jakarta)",
      cargo: "Wood-free Coated Paper (Pulp Sheet)",
      temp: "29.1 °C",
      signal: "Good (4G LTE)",
      coords: { x: 150, y: 120 },
      lat: -4.5120,
      lng: 104.9928,
      latLong: "-4.5120° S, 104.9928° E",
      progress: 0.62,
      bearing: 145,
      ignition: true,
      fuel: 67,
      locationName: "Sunda Strait Transit Ferry Crossing",
      odometer: 320955.7,
    },
    {
      id: "PCN-2026-042",
      driver: "Hendra Wijaya",
      plate: "B 9155 TFZ",
      speed: 0,
      status: "pre_trip",
      origin: "IKPP Tangerang Mill",
      destination: "Merak Port (Banten)",
      cargo: "Uncoated Woodfree Roll Paper",
      temp: "26.8 °C",
      signal: "Excellent (WiFi)",
      coords: { x: 390, y: 260 },
      lat: -6.2140,
      lng: 106.6300,
      latLong: "-6.2140° S, 106.6300° E",
      progress: 0,
      bearing: 270,
      ignition: true,
      fuel: 98,
      locationName: "IKPP Tangerang Mill Departure Bay, Gate 2",
      odometer: 84152.0,
    },
    {
      id: "PCN-2026-150",
      driver: "Dedi Setiawan",
      plate: "B 9722 UXK",
      speed: 0,
      status: "end_trip",
      origin: "Tanjung Priok Port (Jakarta)",
      destination: "Surabaya Cargo Hub",
      cargo: "Export Container Pulpwood",
      temp: "28.0 °C",
      signal: "Stable (4G)",
      coords: { x: 710, y: 315 },
      lat: -7.2004,
      lng: 112.7308,
      latLong: "-7.2004° S, 112.7308° E",
      progress: 1.0,
      bearing: 112,
      ignition: false,
      fuel: 41,
      locationName: "Surabaya Cargo Hub Logistics Dock 4B",
      odometer: 241908.5,
    },
    {
      id: "PCN-2026-077",
      driver: "Rian Hidayat",
      plate: "B 9481 SYA",
      speed: 55,
      status: "on_trip",
      origin: "IKPP Serang Mill (Banten)",
      destination: "Surabaya Cargo Hub",
      cargo: "Fluting Medium Corrugated Roll",
      temp: "28.3 °C",
      signal: "Good (4G)",
      coords: { x: 480, y: 267 },
      lat: -6.9752,
      lng: 110.4229,
      latLong: "-6.9752° S, 110.4229° E",
      progress: 0.48,
      bearing: 94,
      ignition: true,
      fuel: 55,
      locationName: "Semarang Bypass Ring Road, Central Java",
      odometer: 195603.2,
    }
  ]);

  const selectedTruck = trucks.find(t => t.id === selectedTruckId) || null;

  // Fetch highly accurate road routes from OSRM to replace straight diagonal segments
  useEffect(() => {
    const fetchHighDensityRoutes = async () => {
      const endpoints = {
        ROUTE_SERANG_TO_PRIOK: [
          [-6.0963, 106.2167], // Serang Mill
          [-6.2140, 106.6300], // Tangerang Mill
          [-6.1023, 106.8928]  // Tanjung Priok
        ],
        ROUTE_TANGERANG_TO_MERAK: [
          [-6.2140, 106.6300], // Tangerang Mill
          [-6.0963, 106.2167], // Serang Mill
          [-5.9322, 105.9926]  // Merak Port
        ],
        ROUTE_PRIOK_TO_SURABAYA: [
          [-6.1023, 106.8928],  // Tanjung Priok
          [-6.4022, 107.4435],  // Cikampek
          [-6.7112, 108.4350],  // Cirebon
          [-6.9920, 110.3550],  // Semarang
          [-7.5320, 110.7450],  // Solo
          [-7.2004, 112.7308]   // Surabaya
        ],
        ROUTE_SERANG_TO_SURABAYA: [
          [-6.0963, 106.2167],  // Serang Mill
          [-6.2140, 106.6300],  // Tangerang Mill
          [-6.1023, 106.8928],  // Tanjung Priok
          [-6.4022, 107.4435],  // Cikampek
          [-6.7112, 108.4350],  // Cirebon
          [-6.9920, 110.3550],  // Semarang
          [-7.5320, 110.7450],  // Solo
          [-7.2004, 112.7308]   // Surabaya
        ]
      };

      for (const [key, coords] of Object.entries(endpoints)) {
        try {
          const coordsStr = coords.map(([lat, lng]) => `${lng},${lat}`).join(';');
          const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`OSRM HTTP error: ${res.status}`);
          const data = await res.json();
          if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
            const rawCoords = data.routes[0].geometry.coordinates; // [lng, lat]
            const routePoints: RoutePoint[] = rawCoords.map((coord: [number, number]) => {
              const lng = coord[0];
              const lat = coord[1];
              return {
                x: 0,
                y: 0,
                lat,
                lng
              };
            });

            // Update local React state for interpolation
            setRoutesMap(prev => ({
              ...prev,
              [key]: routePoints
            }));

            // Sync to Leaflet iframe
            if (iframeRef.current && iframeRef.current.contentWindow) {
              const leafletCoords = rawCoords.map((coord: [number, number]) => [coord[1], coord[0]]); // [lat, lng]
              iframeRef.current.contentWindow.postMessage({
                type: 'UPDATE_SINGLE_ROUTE',
                key,
                coords: leafletCoords
              }, '*');
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch high density path for ${key}, using built-in static route:`, err);
        }
      }
    };

    const delayTimer = setTimeout(fetchHighDensityRoutes, 1000);
    return () => clearTimeout(delayTimer);
  }, []);

  // Real-time position tracking simulation along real geographic routes (Smoother 150ms updates with CSS glide)
  useEffect(() => {
    if (useLiveApi) return;

    const interval = setInterval(() => {
      setTrucks((prevTrucks) =>
        prevTrucks.map((truck) => {
          if (truck.status === "on_trip") {
            // Smaller increment for smoother continuous tracking (0.00078 is exactly matched with 150ms updates)
            let newProgress = truck.progress + 0.00078 * simulationSpeed;
            if (newProgress > 1) {
              newProgress = 0; // reset route loop
            }

            // Assign real highway route coordinate sets based on truck routes
            let routePoints = routesMap.ROUTE_SERANG_TO_PRIOK;
            if (truck.id === "PCN-2026-089") {
              routePoints = routesMap.ROUTE_SERANG_TO_PRIOK;
            } else if (truck.id === "PCN-2026-112") {
              routePoints = routesMap.ROUTE_PERAWANG_TO_PRIOK;
            } else if (truck.id === "PCN-2026-077") {
              routePoints = routesMap.ROUTE_SERANG_TO_SURABAYA;
            } else if (truck.id === "PCN-2026-042") {
              routePoints = routesMap.ROUTE_TANGERANG_TO_MERAK;
            } else if (truck.id === "PCN-2026-150") {
              routePoints = routesMap.ROUTE_PRIOK_TO_SURABAYA;
            }

            const { x, y, lat, lng } = interpolateRoute(routePoints, newProgress);

            // Randomize speed less frequently to look real
            let newSpeed = truck.speed;
            if (Math.random() < 0.05) {
              const speedChange = Math.floor(Math.random() * 3) - 1;
              newSpeed = Math.max(55, Math.min(85, truck.speed + speedChange));
            }
            const latLong = `${lat.toFixed(4)}° S, ${lng.toFixed(4)}° E`;

            return {
              ...truck,
              progress: newProgress,
              coords: { x: Math.round(x), y: Math.round(y) },
              lat,
              lng,
              speed: newSpeed,
              latLong,
            };
          }
          return truck;
        })
      );
    }, 150);

    return () => clearInterval(interval);
  }, [simulationSpeed, useLiveApi, routesMap]);

  // Live API polling hook
  useEffect(() => {
    if (!useLiveApi) return;

    const fetchLiveGpsData = async () => {
      setIsFetching(true);
      setApiError(null);
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        const data = await response.json();
        const fetchedTrucks = Array.isArray(data) ? data : [data];

        setTrucks((prevTrucks) => {
          return prevTrucks.map((existingTruck) => {
            // Match based on license plate (nopol) or ID (case insensitive, space-ignored matching)
            const matchedApiTruck = fetchedTrucks.find((apiTruck: any) => {
              if (!apiTruck) return false;
              const cleanApiPlate = (apiTruck.plate || '').toLowerCase().replace(/\s+/g, '');
              const cleanExistingPlate = existingTruck.plate.toLowerCase().replace(/\s+/g, '');
              
              const isPlateMatch = cleanApiPlate && cleanApiPlate === cleanExistingPlate;
              const isIdMatch = apiTruck.id && apiTruck.id === existingTruck.id;
              
              return isPlateMatch || isIdMatch;
            });

            if (matchedApiTruck) {
              const lat = typeof matchedApiTruck.lat === 'number' ? matchedApiTruck.lat : Number(matchedApiTruck.lat) || existingTruck.lat;
              const lng = typeof matchedApiTruck.lng === 'number' ? matchedApiTruck.lng : Number(matchedApiTruck.lng) || existingTruck.lng;
              const speed = typeof matchedApiTruck.speed === 'number' ? matchedApiTruck.speed : Number(matchedApiTruck.speed) || 0;
              const fuel = typeof matchedApiTruck.fuel === 'number' ? matchedApiTruck.fuel : Number(matchedApiTruck.fuel) || existingTruck.fuel;
              const odometer = typeof matchedApiTruck.odometer === 'number' ? matchedApiTruck.odometer : Number(matchedApiTruck.odometer) || existingTruck.odometer;
              const locationName = matchedApiTruck.locationName || matchedApiTruck.location || existingTruck.locationName;
              const status = (matchedApiTruck.status === "on_trip" || matchedApiTruck.status === "pre_trip" || matchedApiTruck.status === "end_trip") ? matchedApiTruck.status : existingTruck.status;
              const driver = matchedApiTruck.driver || existingTruck.driver;
              const progress = typeof matchedApiTruck.progress === 'number' ? matchedApiTruck.progress : existingTruck.progress;

              return {
                ...existingTruck,
                lat,
                lng,
                latLong: `${lat.toFixed(4)}° S, ${lng.toFixed(4)}° E`,
                speed,
                fuel,
                odometer,
                locationName,
                status,
                driver,
                progress
              };
            }
            return existingTruck;
          });
        });
      } catch (err: any) {
        console.error("Gagal menarik data API GPS:", err);
        setApiError(err.message || "Gagal menghubungkan ke server API tracking");
      } finally {
        setIsFetching(false);
      }
    };

    fetchLiveGpsData();
    const interval = setInterval(fetchLiveGpsData, 5000);
    return () => clearInterval(interval);
  }, [useLiveApi, apiUrl]);

  // Listen to message from Leaflet iframe map
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event && event.data && event.data.type === 'SELECT_TRUCK') {
        setSelectedTruckId(event.data.id);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const filteredTrucks = trucks.filter((t) => {
    // 1. Status Filter
    const matchesTab = activeTab === "all" || t.status === activeTab;
    if (!matchesTab) return false;

    // 2. Search Query Filter (Searches by plate number/nopol, driver, or fleet ID)
    if (!searchQuery.trim()) return true;
    const cleanQuery = searchQuery.toLowerCase().replace(/\s+/g, '');
    return (
      t.plate.toLowerCase().replace(/\s+/g, '').includes(cleanQuery) ||
      t.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeRoutePoints = React.useMemo(() => {
    if (!selectedTruck) return null;
    if (selectedTruck.id === "PCN-2026-089") return routesMap.ROUTE_SERANG_TO_PRIOK;
    if (selectedTruck.id === "PCN-2026-112") return routesMap.ROUTE_PERAWANG_TO_PRIOK;
    if (selectedTruck.id === "PCN-2026-077") return routesMap.ROUTE_SERANG_TO_SURABAYA;
    if (selectedTruck.id === "PCN-2026-042") return routesMap.ROUTE_TANGERANG_TO_MERAK;
    if (selectedTruck.id === "PCN-2026-150") return routesMap.ROUTE_PRIOK_TO_SURABAYA;
    return null;
  }, [selectedTruck, routesMap]);

  const traveledRoutePath = React.useMemo(() => {
    if (!selectedTruck || !activeRoutePoints || selectedTruck.status !== "on_trip") return null;
    const segmentCount = activeRoutePoints.length - 1;
    const scaledProgress = selectedTruck.progress * segmentCount;
    const index = Math.floor(scaledProgress);
    const traveledPoints = activeRoutePoints.slice(0, index + 1);
    traveledPoints.push({
      x: selectedTruck.coords.x,
      y: selectedTruck.coords.y,
      lat: selectedTruck.lat,
      lng: selectedTruck.lng
    });
    return getSvgPath(traveledPoints);
  }, [selectedTruck, activeRoutePoints]);

  // Post update data into Leaflet iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE',
        trucks: filteredTrucks,
        selectedTruckId
      }, '*');
    }
  }, [filteredTrucks, selectedTruckId]);

  // Post map center changes separately to let Leaflet pan/zoom gracefully
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_CENTER',
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        zoom: mapCenter.zoom
      }, '*');
    }
  }, [mapCenter]);

  return (
    <div className="bg-[#0b1329] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-sans text-slate-100 flex flex-col">
      {/* Sleek Top Telematics Ribbon */}
      <div className="bg-[#0f1b35] border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-[#00AEEF]/10 p-2 rounded-xl border border-[#00AEEF]/20">
            <Radio className="w-6 h-6 text-[#00AEEF] animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              IKPP <span className="text-[#00AEEF] font-mono text-[10px] px-2 py-0.5 rounded bg-[#00AEEF]/10 border border-[#00AEEF]/20">FLEET LIVE</span>
            </h3>
            <p className="text-xs text-slate-400 font-semibold">
              Live Fleet Telematics Control Console • Real-Time Synchronized
            </p>
          </div>
        </div>

        {/* Global Statistics Indicators & Live API Button */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span>MOVING: <b className="text-white font-mono">{trucks.filter(t => t.status === "on_trip").length}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
            <span>QUEUED/IDLE: <b className="text-white font-mono">{trucks.filter(t => t.status === "pre_trip").length}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-slate-500 rounded-full" />
            <span>ARRIVED: <b className="text-white font-mono">{trucks.filter(t => t.status === "end_trip").length}</b></span>
          </div>
          
          <div className="h-4 w-px bg-slate-800 hidden md:block" />
          
          {/* Live API Settings Toggle */}
          <button
            onClick={() => setShowApiSettings(!showApiSettings)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
              useLiveApi 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" 
                : "bg-slate-800 text-slate-300 border-slate-700/60 hover:bg-slate-700/80"
            }`}
            title="Klik untuk menghubungkan API Anda sendiri"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Integrasi API {useLiveApi ? "(Aktif)" : "(Simulasi)"}</span>
          </button>

          {!useLiveApi && (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <select
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="text-xs font-bold text-white bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="0.05">Real-Time (1x)</option>
                <option value="0.2">Natural (5x)</option>
                <option value="1">Accelerated (25x)</option>
                <option value="4">Fast (100x)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Live API Configuration Sub-panel */}
      {showApiSettings && (
        <div className="bg-[#0b162f] border-b border-slate-800 px-6 py-5 text-slate-200">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#00AEEF]" />
                Pengaturan Integrasi API GPS Tracking
              </h4>
              <button 
                onClick={() => setShowApiSettings(false)}
                className="text-xs text-slate-400 hover:text-white font-bold cursor-pointer transition-colors"
              >
                Tutup [X]
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-3xl">
              Anda dapat mengaktifkan live API untuk mengambil data GPS real-time dari server Anda sendiri. 
              Sistem akan mencocokkan plat nomor (<b>plate</b> / nopol) secara otomatis untuk memperbarui peta pelacakan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              {/* Form Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#111c35] border border-slate-800 p-3 rounded-xl">
                  <div>
                    <span className="text-xs font-black block text-white">Gunakan Live API</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Aktifkan untuk mengambil data dari endpoint di bawah</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={useLiveApi}
                      onChange={(e) => setUseLiveApi(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">URL API Endpoint (JSON)</label>
                  <input 
                    type="text" 
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="Contoh: https://api.anda.com/fleet/positions"
                    className="w-full bg-[#111c35] border border-slate-800 hover:border-slate-700 focus:border-[#00AEEF]/50 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
                  <div className={`p-1.5 rounded-lg ${useLiveApi ? 'bg-emerald-500/10 text-emerald-400 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] flex-1">
                    <span className="font-bold text-slate-300 block">Status Koneksi API:</span>
                    {useLiveApi ? (
                      isFetching ? (
                        <span className="text-[#00AEEF] font-mono">Menghubungkan & mengambil data...</span>
                      ) : apiError ? (
                        <span className="text-rose-400 font-mono">Gagal: {apiError}</span>
                      ) : (
                        <span className="text-emerald-400 font-mono">Aktif & Terhubung (Update setiap 5s)</span>
                      )
                    ) : (
                      <span className="text-slate-500">Menggunakan Simulasi GPS Bawaan</span>
                    )}
                  </div>
                </div>
              </div>

              {/* JSON Format Guide */}
              <div className="bg-[#090f20] border border-slate-800/80 p-3.5 rounded-xl space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00AEEF] block">Skema JSON API yang Diharapkan:</span>
                <p className="text-[10px] text-slate-400">
                  Kembalikan array objek (atau satu objek) dengan format kunci seperti berikut:
                </p>
                <pre className="text-[9px] font-mono text-emerald-400 bg-slate-950 p-2.5 rounded-lg overflow-x-auto border border-slate-800/50 max-h-[140px] custom-scrollbar">
{`[
  {
    "plate": "B 9845 LQA",  // Wajib (untuk mencocokkan)
    "lat": -6.0963,         // Latitude numerik
    "lng": 106.2167,        // Longitude numerik
    "speed": 68,            // Kecepatan (km/h)
    "fuel": 85,             // Sisa bahan bakar %
    "odometer": 148201.4,   // Jarak tempuh (km)
    "locationName": "Tol Tangerang Km 38",
    "status": "on_trip"     // "on_trip" | "pre_trip" | "end_trip"
  }
]`}
                </pre>
                <p className="text-[9px] text-slate-500 italic leading-snug">
                  * Nama kunci (key) bersifat case-sensitive. Kunci <b>plate</b> akan mencocokkan nopol kendaraan yang terdaftar secara dinamis.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Split Interface */}
      <div className="flex flex-col lg:flex-row h-auto lg:h-[700px] min-h-[750px] lg:min-h-0">
        
        {/* SIDEBAR: FLEET ROSTER NAVIGATION */}
        <div className="w-full lg:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#0c152b] flex flex-col h-[320px] lg:h-full overflow-hidden">
          
          {/* Search bar */}
          <div className="p-4 border-b border-slate-800/80 bg-[#090f20]/60 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search plate, driver, fleet ID..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  
                  if (val.trim()) {
                    const cleanVal = val.toLowerCase().replace(/\s+/g, '');
                    
                    // 1. Check for exact plate (nopol) match ignoring spaces
                    const exactPlate = trucks.find(t => 
                      t.plate.toLowerCase().replace(/\s+/g, '') === cleanVal
                    );
                    
                    if (exactPlate) {
                      setSelectedTruckId(exactPlate.id);
                      setMapCenter({ 
                        lat: exactPlate.lat, 
                        lng: exactPlate.lng, 
                        zoom: exactPlate.status === "on_trip" ? 12 : 14 
                      });
                      return;
                    }

                    // 2. Otherwise, if there is exactly 1 partial match across all trucks, auto-track it
                    const partialMatches = trucks.filter(t => 
                      t.plate.toLowerCase().replace(/\s+/g, '').includes(cleanVal) ||
                      t.driver.toLowerCase().includes(val.toLowerCase()) ||
                      t.id.toLowerCase().includes(val.toLowerCase())
                    );
                    
                    if (partialMatches.length === 1) {
                      setSelectedTruckId(partialMatches[0].id);
                      setMapCenter({ 
                        lat: partialMatches[0].lat, 
                        lng: partialMatches[0].lng, 
                        zoom: partialMatches[0].status === "on_trip" ? 12 : 14 
                      });
                    }
                  }
                }}
                className="w-full bg-[#111c35] border border-slate-800 hover:border-slate-700 focus:border-[#00AEEF]/50 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>

            {/* Cartrack styled Filter Tabs */}
            <div className="bg-[#111c35] p-1 rounded-xl flex gap-1">
              {(["all", "on_trip", "pre_trip", "end_trip"] as const).map((tab) => {
                const isActive = activeTab === tab;
                const count = tab === "all" ? trucks.length : trucks.filter(t => t.status === tab).length;
                let label = "All";
                if (tab === "on_trip") label = "On Road";
                if (tab === "pre_trip") label = "Idle";
                if (tab === "end_trip") label = "Arrived";

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      isActive 
                        ? "bg-emerald-500 text-white shadow-md font-black" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {label} <span className="font-mono opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Vehicle List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {filteredTrucks.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold">No active vehicles match filters</p>
              </div>
            ) : (
              filteredTrucks.map((truck) => {
                const isSelected = selectedTruckId === truck.id;
                
                return (
                  <div
                    key={truck.id}
                    onClick={() => {
                      setSelectedTruckId(truck.id);
                      setMapCenter({ lat: truck.lat, lng: truck.lng, zoom: truck.status === "on_trip" ? 12 : 14 });
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected 
                        ? "bg-[#16274e]/80 border-emerald-500/50 shadow-md" 
                        : "bg-[#0d162d] border-slate-800/80 hover:bg-[#111e3c] hover:border-slate-700/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Status Ignition Indicator */}
                        <div className={`p-1.5 rounded-lg border ${
                          truck.status === "on_trip" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                          truck.status === "pre_trip" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                          "bg-slate-500/10 border-slate-500/20 text-slate-400"
                        }`}>
                          <Key className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-mono font-black text-white group-hover:text-emerald-400 transition-colors">
                            {truck.plate} <span className="text-slate-500 text-[10px] font-normal">• {truck.id.split('-')[2]}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-extrabold truncate max-w-[180px] mt-0.5">
                            {truck.driver}
                          </p>
                        </div>
                      </div>

                      {/* Speed Badge */}
                      <div className="text-right">
                        <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md ${
                          truck.status === "on_trip" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"
                        }`}>
                          {truck.speed} km/h
                        </span>
                      </div>
                    </div>

                    {/* Geofenced Location Address */}
                    <p className="text-[10px] text-slate-300 font-medium truncate mt-2.5 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                      {truck.locationName}
                    </p>

                    {/* Footer Details: Odometer and Signal */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[9px] text-slate-500 font-mono">
                      <span>ODO: <b className="text-slate-400">{truck.odometer.toLocaleString('id-ID')} km</b></span>
                      <span className="flex items-center gap-1">
                        <Signal className="w-2.5 h-2.5 text-emerald-500" />
                        {truck.signal.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Footer KPI */}
          <div className="p-3 bg-[#080f20]/60 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold"><Activity className="w-3.5 h-3.5 text-emerald-400" /> SLA Level: 98.4%</span>
            <span className="font-mono text-[9px]">UTC +07:00</span>
          </div>
        </div>

        {/* RIGHT DISPLAY: MAP ENGINE + FLOAT HUD DETAIL OVERLAY */}
        <div className="flex-1 relative bg-[#020d26] h-[450px] lg:h-full">
          
          {/* Interactive Facility Quickfocus bar (Floats at the top center) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-row flex-nowrap overflow-x-auto scrollbar-none gap-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-lg max-w-[95%] w-auto justify-start md:justify-center items-center">
            {landmarks.map((l) => (
              <button
                key={l.name}
                onClick={() => {
                  setSelectedLandmark(l.name);
                  setSelectedTruckId(null);
                  setMapCenter({ lat: l.lat, lng: l.lng, zoom: l.zoom });
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer shrink-0 whitespace-nowrap ${
                  selectedLandmark === l.name && !selectedTruck
                    ? "bg-[#00AEEF] text-white border-[#00AEEF]"
                    : "bg-slate-800 text-slate-300 border-slate-700/60 hover:bg-slate-700/80"
                }`}
              >
                {l.name.split(" (")[0]}
              </button>
            ))}
          </div>

          {/* Leaflet IFrame */}
          <iframe
            ref={iframeRef}
            title="Live GPS Tracking Map"
            srcDoc={MAP_HTML}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />

          {/* FLOATING CARTRACK LIVE TELEMETRY HUD CARD OVERLAY (RIGHT SIDE GLASSMORPHISM) */}
          <div className="absolute bottom-5 right-5 z-10 w-[320px] max-w-[calc(100vw-40px)]">
            <AnimatePresence mode="wait">
              {selectedTruck ? (
                <motion.div
                  key={selectedTruck.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-4 text-white"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-slate-800/80 pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-mono font-black text-[#00AEEF] uppercase tracking-widest">{selectedTruck.id}</span>
                      </div>
                      <h4 className="text-sm font-black text-white mt-1 font-mono tracking-tight">{selectedTruck.plate}</h4>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                      selectedTruck.status === "on_trip" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      selectedTruck.status === "pre_trip" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}>
                      {selectedTruck.status === "on_trip" ? "ON ROAD" : selectedTruck.status === "pre_trip" ? "IDLING" : "STOPPED"}
                    </span>
                  </div>

                  {/* Telematics Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-[#0f1832] border border-slate-800/80 p-2 rounded-xl text-center">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">SPEED</span>
                      <span className="text-xl font-black font-mono text-white block mt-0.5">
                        {selectedTruck.speed} <span className="text-[10px] text-slate-500">km/h</span>
                      </span>
                    </div>
                    <div className="bg-[#0f1832] border border-slate-800/80 p-2 rounded-xl text-center">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">FUEL GAUGE</span>
                      <span className="text-xl font-black font-mono text-emerald-400 block mt-0.5">
                        {selectedTruck.fuel}%
                      </span>
                    </div>
                  </div>

                  {/* Core details list */}
                  <div className="space-y-2 bg-[#0d152c] border border-slate-800/60 p-3 rounded-xl mb-3 text-[11px]">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">Driver Name</span>
                      <span className="font-extrabold">{selectedTruck.driver}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 border-t border-slate-800/40 pt-1.5">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">Odometer</span>
                      <span className="font-mono font-extrabold">{selectedTruck.odometer.toLocaleString('id-ID')} km</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 border-t border-slate-800/40 pt-1.5">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">Cargo Payload</span>
                      <span className="font-bold truncate max-w-[140px]" title={selectedTruck.cargo}>{selectedTruck.cargo}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 border-t border-slate-800/40 pt-1.5">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">Coordinates</span>
                      <span className="font-mono text-[10px]">{selectedTruck.latLong}</span>
                    </div>
                  </div>

                  {/* Transit Route Progress bar */}
                  <div className="bg-[#090f20] border border-slate-800/60 p-2.5 rounded-xl mb-3">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-extrabold uppercase mb-1.5">
                      <span>ROUTE COMPLETED</span>
                      <span className="text-emerald-400 font-black">{Math.round(selectedTruck.progress * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${selectedTruck.progress * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1.5">
                      <span className="truncate max-w-[100px]">{selectedTruck.origin.split(" (")[0]}</span>
                      <span className="truncate max-w-[100px] text-right">{selectedTruck.destination.split(" (")[0]}</span>
                    </div>
                  </div>

                  {/* Deselect / Close button */}
                  <button
                    onClick={() => {
                      setSelectedTruckId(null);
                      const activeLandmark = landmarks.find(l => l.name === selectedLandmark);
                      if (activeLandmark) {
                        setMapCenter({ lat: activeLandmark.lat, lng: activeLandmark.lng, zoom: activeLandmark.zoom });
                      }
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold text-[11px] rounded-xl transition cursor-pointer"
                  >
                    CLOSE VEHICLE MONITOR
                  </button>
                </motion.div>
              ) : (
                /* No selected vehicle summary card */
                <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-4 text-white">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="bg-[#00AEEF]/10 p-2 rounded-xl border border-[#00AEEF]/20 text-[#00AEEF]">
                      <Truck className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-wider uppercase text-[#00AEEF]">FLEET TELEMETRY OVERVIEW</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Viewing overall status</p>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed mb-3">
                    Currently tracking <b>{trucks.length} total vehicles</b> transiting between mills and maritime terminals. Use the left roster to select a vehicle.
                  </p>

                  <div className="border-t border-slate-800/80 pt-2.5 space-y-1.5 text-[10px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>FACILITY DEPOT FOCUS:</span>
                      <span className="font-sans font-extrabold text-white">{selectedLandmark.split(' (')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AVERAGE VELOCITY:</span>
                      <span className="text-emerald-400">65.6 km/h</span>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
