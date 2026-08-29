export type FreightServiceType = "EXPORT" | "REPO FULL" | "REPO EMPTY" | "IMPORT";

export interface FreightMapping {
  commercialRoute: string;
  pickUpLocation?: string;
  dropOfLocation?: string;
  freightType: string;
  freightType2: FreightServiceType | string;
}

export interface FreightLookupResult {
  freightType: string;
  freightType2: FreightServiceType;
  orderType: "ekspor" | "impor" | "repo";
}

/**
 * Exact reference mapping table derived from Sinarmas Commercial Route Matrix
 */
export const FREIGHT_LOOKUP_TABLE: FreightMapping[] = [
  { commercialRoute: "BSA - TANJUNG PRIOK (REPO FULL)", pickUpLocation: "BSA", dropOfLocation: "MAL/T300", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "BSA - TANJUNG PRIOK (REPO FULL)", pickUpLocation: "BSA", dropOfLocation: "NPCT 1", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "BSA - TANJUNG PRIOK (REPO FULL)", pickUpLocation: "BSA", dropOfLocation: "PELINDO/ TERMINAL 3", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "BSA - TANJUNG PRIOK (REPO FULL)", pickUpLocation: "BSA", dropOfLocation: "UTC", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "BSA - TANJUNG PRIOK (REPO FULL)", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "koja", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "Depo Arround Priok - Pancaran Depo - 0 - 36", pickUpLocation: "BPL", dropOfLocation: "DEPO PDT", freightType: "EXPORT", freightType2: "REPO EMPTY" },
  { commercialRoute: "Depo Arround Priok - Pancaran Depo - 0 - 36", pickUpLocation: "PT Bunga Plum Logistik", dropOfLocation: "DEPO PDT", freightType: "EXPORT", freightType2: "REPO EMPTY" },
  { commercialRoute: "DEPO ARROUND PRIOK - PLB KARAWANG (FULL) - 0 - 0", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "PLB Karawang", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "DEPO ARROUND PRIOK-PLB KARAWANG (EMPTY)", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "PLB Karawang", freightType: "EXPORT", freightType2: "REPO EMPTY" },
  { commercialRoute: "DEPO ARROUND PRIOK-PLB KARAWANG (FULL)", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "PLB Karawang", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "Depo BSA & Priok - Pelabuhan Tj Priok - 0 - 0", pickUpLocation: "BSA", dropOfLocation: "koja", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "Depo BSA & Priok - Pelabuhan Tj Priok - 0 - 0", pickUpLocation: "BSA", dropOfLocation: "MAL/T300", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "Depo BSA & Priok - Pelabuhan Tj Priok - 0 - 0", pickUpLocation: "BSA", dropOfLocation: "NPCT 1", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "Depo BSA & Priok - Pelabuhan Tj Priok - 0 - 0", pickUpLocation: "BSA", dropOfLocation: "UTC", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - CAKUNG (FULL)", pickUpLocation: "GFC", dropOfLocation: "UTC", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - CAKUNG (FULL)", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "koja", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - CAKUNG (FULL)", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "NPCT 1", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - CAKUNG (FULL)", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "UTC", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - CAKUNG (FULL)", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "(blank)", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - CAKUNG (FULL) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "BSA", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - CAKUNG (FULL) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "GL Terminal", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - CAKUNG (FULL) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "koja", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - CAKUNG (FULL) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "MAL/T300", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - CAKUNG (FULL) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "NPCT 1", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - CAKUNG (FULL) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "PELINDO/ TERMINAL 3", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - CAKUNG (FULL) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "T300/TMAL", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - CAKUNG (FULL) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "UTC", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - DEPO PRIOK (OPEN CY) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "UTC", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG - TANJUNG PRIOK (IKK) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "koja", freightType: "EXPORT", freightType2: "EXPORT" },
  { commercialRoute: "KARAWANG - TANJUNG PRIOK (IKK) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "MAL/T300", freightType: "EXPORT", freightType2: "EXPORT" },
  { commercialRoute: "KARAWANG - TANJUNG PRIOK (IKK) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "NPCT 1", freightType: "EXPORT", freightType2: "EXPORT" },
  { commercialRoute: "KARAWANG - TANJUNG PRIOK (IKK) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "PELINDO/ TERMINAL 3", freightType: "EXPORT", freightType2: "EXPORT" },
  { commercialRoute: "KARAWANG - TANJUNG PRIOK (IKK) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "PLB Karawang", freightType: "EXPORT", freightType2: "EXPORT" },
  { commercialRoute: "KARAWANG - TANJUNG PRIOK (IKK) - 0 - 160", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "UTC", freightType: "EXPORT", freightType2: "EXPORT" },
  { commercialRoute: "KARAWANG (PLB) - PORT TJ PRIOK (FULL)", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "UTC", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG (PLB) - PORT TJ PRIOK (FULL) - 0 - 0", pickUpLocation: "PLB Karawang", dropOfLocation: "PLB Karawang", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG (PLB) - PORT TJ PRIOK (FULL) - 0 - 0", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "koja", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "KARAWANG (PLB) - PORT TJ PRIOK (FULL) - 0 - 0", pickUpLocation: "PT. Indah Kiat Pulp & Paper - Karawang", dropOfLocation: "UTC", freightType: "EXPORT", freightType2: "REPO FULL" },
  { commercialRoute: "BSA - TANJUNG PRIOK (REPO FULL)", pickUpLocation: "BSA", dropOfLocation: "koja", freightType: "REPO EXPORT", freightType2: "REPO FULL" },
];

function normalizeStr(str?: string): string {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Performs lookup for FREIGHT TYPE and FREIGHT TYPE 2 from COMMERCIAL ROUTE and locations
 */
export function lookupFreightByRoute(
  commercialRoute?: string,
  pickUpLocation?: string,
  dropOfLocation?: string,
  rawFreightType?: string,
  rawFreightType2?: string
): FreightLookupResult {
  const normCR = normalizeStr(commercialRoute);
  const normPick = normalizeStr(pickUpLocation);
  const normDrop = normalizeStr(dropOfLocation);

  // 1. Direct Lookup in Table
  if (normCR) {
    // Check triple match (route + pickup + drop)
    const exactTriple = FREIGHT_LOOKUP_TABLE.find(
      (m) =>
        normalizeStr(m.commercialRoute) === normCR &&
        (!normPick || normalizeStr(m.pickUpLocation) === normPick) &&
        (!normDrop || normalizeStr(m.dropOfLocation) === normDrop)
    );
    if (exactTriple) {
      const f2 = (exactTriple.freightType2 as FreightServiceType) || "EXPORT";
      return {
        freightType: exactTriple.freightType,
        freightType2: f2,
        orderType: f2 === "IMPORT" ? "impor" : f2.startsWith("REPO") ? "repo" : "ekspor"
      };
    }

    // Check route match in table
    const routeMatch = FREIGHT_LOOKUP_TABLE.find(
      (m) => normalizeStr(m.commercialRoute) === normCR
    );
    if (routeMatch) {
      const f2 = (routeMatch.freightType2 as FreightServiceType) || "EXPORT";
      return {
        freightType: routeMatch.freightType,
        freightType2: f2,
        orderType: f2 === "IMPORT" ? "impor" : f2.startsWith("REPO") ? "repo" : "ekspor"
      };
    }
  }

  // 2. Explicit rawFreightType2 if given from sheet
  if (rawFreightType2 && rawFreightType2.trim()) {
    const raw2Upper = rawFreightType2.trim().toUpperCase();
    if (raw2Upper === "REPO FULL" || raw2Upper.includes("REPO FULL")) {
      return { freightType: rawFreightType || "EXPORT", freightType2: "REPO FULL", orderType: "repo" };
    }
    if (raw2Upper === "REPO EMPTY" || raw2Upper.includes("REPO EMPTY") || raw2Upper.includes("EMPTY")) {
      return { freightType: rawFreightType || "EXPORT", freightType2: "REPO EMPTY", orderType: "repo" };
    }
    if (raw2Upper === "IMPORT" || raw2Upper.includes("IMPOR")) {
      return { freightType: "IMPORT", freightType2: "IMPORT", orderType: "impor" };
    }
    if (raw2Upper === "EXPORT" || raw2Upper.includes("EKSPOR")) {
      return { freightType: "EXPORT", freightType2: "EXPORT", orderType: "ekspor" };
    }
  }

  // 3. Pattern Heuristics on Commercial Route text & locations
  const crUpper = (commercialRoute || "").toUpperCase();
  const pickUpper = (pickUpLocation || "").toUpperCase();
  const dropUpper = (dropOfLocation || "").toUpperCase();
  const allText = `${crUpper} ${pickUpper} ${dropUpper}`;

  // Check Import
  if (allText.includes("IMPORT") || allText.includes("IMPOR")) {
    return {
      freightType: "IMPORT",
      freightType2: "IMPORT",
      orderType: "impor"
    };
  }

  // Check REPO EMPTY
  if (
    allText.includes("EMPTY") ||
    allText.includes("PANCARAN DEPO") ||
    allText.includes("0 - 36") ||
    allText.includes("0-36") ||
    allText.includes("DEPO PDT") ||
    allText.includes("PDT")
  ) {
    return {
      freightType: "EXPORT",
      freightType2: "REPO EMPTY",
      orderType: "repo"
    };
  }

  // Check REPO FULL
  if (
    allText.includes("REPO FULL") ||
    allText.includes("(FULL)") ||
    allText.includes("CAKUNG") ||
    allText.includes("DEPO PRIOK") ||
    allText.includes("PLB") ||
    allText.includes("DEPO BSA") ||
    allText.includes("BSA") ||
    allText.includes("RELOKASI") ||
    allText.includes("REPO")
  ) {
    const ft = allText.includes("REPO EXPORT") ? "REPO EXPORT" : "EXPORT";
    return {
      freightType: ft,
      freightType2: "REPO FULL",
      orderType: "repo"
    };
  }

  // Check Standard EXPORT
  if (
    allText.includes("IKK") ||
    allText.includes("KARAWANG - TANJUNG PRIOK") ||
    allText.includes("EXPORT") ||
    allText.includes("EKSPOR")
  ) {
    return {
      freightType: "EXPORT",
      freightType2: "EXPORT",
      orderType: "ekspor"
    };
  }

  // Default fallback
  return {
    freightType: rawFreightType || "EXPORT",
    freightType2: "EXPORT",
    orderType: "ekspor"
  };
}

/**
 * Helper to get the canonical Service Type (EXPORT | REPO FULL | REPO EMPTY | IMPORT) for any order or shipment
 */
export function getFreightServiceType(item: any): FreightServiceType {
  if (!item) return "EXPORT";

  if (item.freightType2) {
    const f2 = String(item.freightType2).trim().toUpperCase();
    if (f2 === "REPO FULL" || f2.includes("REPO FULL")) return "REPO FULL";
    if (f2 === "REPO EMPTY" || f2.includes("REPO EMPTY") || f2.includes("EMPTY")) return "REPO EMPTY";
    if (f2 === "IMPORT" || f2.includes("IMPOR")) return "IMPORT";
    if (f2 === "EXPORT" || f2.includes("EKSPOR")) return "EXPORT";
  }

  const lookup = lookupFreightByRoute(
    item.commercialRoute,
    item.origin || item.pickUpLocation,
    item.destination || item.dropOfLocation,
    item.freightType,
    item.freightType2
  );
  return lookup.freightType2;
}
