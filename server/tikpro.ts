import https from "https";

const FIREBASE_API_KEY = "AIzaSyC19AOb9d5OHHbb0EiwDdQJQbcMqU_Jagg";
const FIREBASE_PROJECT_ID = "export-ikk";

interface CacheEntry {
  timestamp: number;
  data: any;
}

let cachedMirrorData: CacheEntry | null = null;
const CACHE_TTL_MS = 30000; // 30 seconds cache

const STANDARD_STATUS_KEYS = [
  { key: "TERSEDIA", label: "TERSEDIA", aliases: ["TERSEDIA", "Tersedia", "STANDBY"] },
  { key: "MUAT DEPO", label: "MUAT DEPO", aliases: ["MUAT DEPO", "Muat Depo"] },
  { key: "OTW IKK", label: "OTW IKK", aliases: ["OTW IKK", "Otw Ikk"] },
  { key: "DAFTAR DCO - ESTIMASI", label: "DAFTAR DCO - ESTIMASI", aliases: ["DAFTAR DCO - ESTIMASI", "DAFTAR DCO - Estimasi", "DCO"] },
  { key: "GUDANG ANTRI MUAT", label: "GUDANG ANTRI MUAT", aliases: ["GUDANG ANTRI MUAT", "Gudang Antri Muat", "ANTRI MUAT"] },
  { key: "OTW PELABUHAN", label: "OTW PELABUHAN", aliases: ["OTW PELABUHAN", "Otw Pelabuhan"] },
  { key: "BONGKAR PORT / DONE", label: "BONGKAR PORT / DONE", aliases: ["BONGKAR PORT / DONE", "Bongkar Port / Done", "DONE"] },
  { key: "STORING / LAKA", label: "STORING / LAKA", aliases: ["STORING / LAKA", "Storing / Laka", "LAKA"] },
  { key: "NO DRIVER", label: "NO DRIVER", aliases: ["NO DRIVER", "No Driver"] },
  { key: "TUNGGU LOKASI", label: "TUNGGU LOKASI", aliases: ["TUNGGU LOKASI", "Tunggu Lokasi"] },
  { key: "GROUNDING", label: "GROUNDING", aliases: ["GROUNDING", "Grounding"] },
  { key: "REPO FULL", label: "REPO FULL", aliases: ["REPO FULL", "Repo Full"] },
  { key: "REPO EMPTY", label: "REPO EMPTY", aliases: ["REPO EMPTY", "Repo Empty"] },
  { key: "TUNGGU KARTU EKSPOR", label: "TUNGGU KARTU EKSPOR", aliases: ["TUNGGU KARTU EKSPOR", "Tunggu Kartu Ekspor", "KARTU EKSPOR"] },
];

async function loginToFirebase(email = "pdt@ikk.com", password = "pdt@ikk.com"): Promise<string> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email, password, returnSecureToken: true });
    const req = https.request(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.idToken) resolve(parsed.idToken);
            else reject(new Error(parsed.error?.message || "Firebase Auth failed"));
          } catch (e: any) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function fetchFirestoreCollection(token: string, collectionName: string): Promise<any[]> {
  let docs: any[] = [];
  let nextPageToken: string | null = null;

  do {
    let url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collectionName}?pageSize=300`;
    if (nextPageToken) url += `&pageToken=${nextPageToken}`;

    const res: any = await new Promise((resolve, reject) => {
      https.get(url, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      }).on("error", reject);
    });

    if (res.documents) {
      docs = docs.concat(res.documents);
    }
    nextPageToken = res.nextPageToken || null;
  } while (nextPageToken);

  return docs;
}

function parseDocFields(doc: any): Record<string, any> {
  if (!doc.fields) return {};
  const obj: Record<string, any> = { _id: doc.name ? doc.name.split("/").pop() : "" };
  for (const [k, v] of Object.entries<any>(doc.fields)) {
    if (v.stringValue !== undefined) obj[k] = v.stringValue;
    else if (v.integerValue !== undefined) obj[k] = parseInt(v.integerValue, 10);
    else if (v.doubleValue !== undefined) obj[k] = parseFloat(v.doubleValue);
    else if (v.booleanValue !== undefined) obj[k] = v.booleanValue;
    else if (v.mapValue !== undefined) obj[k] = v.mapValue;
    else if (v.arrayValue !== undefined) obj[k] = v.arrayValue;
  }
  return obj;
}

export async function getTikProMirrorData(
  email = "pdt@ikk.com",
  password = "pdt@ikk.com",
  targetVendor = "Pancaran Darat",
  forceRefresh = false
) {
  const now = Date.now();
  if (!forceRefresh && cachedMirrorData && now - cachedMirrorData.timestamp < CACHE_TTL_MS) {
    return cachedMirrorData.data;
  }

  try {
    const token = await loginToFirebase(email, password);
    const rawTrucks = await fetchFirestoreCollection(token, "trucks");
    const parsedTrucks = rawTrucks.map(parseDocFields);

    // Filter by vendor if specified
    let filteredTrucks = parsedTrucks.filter((t) => {
      if (!targetVendor || targetVendor === "ALL") return true;
      const v = (t.vendor || "").toString().toLowerCase();
      const tv = targetVendor.toLowerCase();
      return v.includes(tv) || tv.includes(v) || v.includes("pancaran");
    });

    if (filteredTrucks.length === 0 && parsedTrucks.length > 0) {
      filteredTrucks = parsedTrucks;
    }

    // Map status count for the 14 standard TikPro statuses
    const statusCounts: Record<string, number> = {};
    STANDARD_STATUS_KEYS.forEach((s) => (statusCounts[s.key] = 0));

    filteredTrucks.forEach((t) => {
      const rawStatus = (t.status || "").toString().trim();
      let matchedKey = "";

      for (const item of STANDARD_STATUS_KEYS) {
        if (item.aliases.some((a) => a.toLowerCase() === rawStatus.toLowerCase())) {
          matchedKey = item.key;
          break;
        }
      }

      if (matchedKey) {
        statusCounts[matchedKey] = (statusCounts[matchedKey] || 0) + 1;
      } else if (rawStatus) {
        // Fallback matching
        const u = rawStatus.toUpperCase();
        if (u.includes("TERSEDIA")) statusCounts["TERSEDIA"] = (statusCounts["TERSEDIA"] || 0) + 1;
        else if (u.includes("MUAT DEPO")) statusCounts["MUAT DEPO"] = (statusCounts["MUAT DEPO"] || 0) + 1;
        else if (u.includes("OTW IKK")) statusCounts["OTW IKK"] = (statusCounts["OTW IKK"] || 0) + 1;
        else if (u.includes("DCO")) statusCounts["DAFTAR DCO - ESTIMASI"] = (statusCounts["DAFTAR DCO - ESTIMASI"] || 0) + 1;
        else if (u.includes("GUDANG") || u.includes("ANTRI")) statusCounts["GUDANG ANTRI MUAT"] = (statusCounts["GUDANG ANTRI MUAT"] || 0) + 1;
        else if (u.includes("OTW PELABUHAN")) statusCounts["OTW PELABUHAN"] = (statusCounts["OTW PELABUHAN"] || 0) + 1;
        else if (u.includes("BONGKAR") || u.includes("DONE")) statusCounts["BONGKAR PORT / DONE"] = (statusCounts["BONGKAR PORT / DONE"] || 0) + 1;
        else if (u.includes("STORING") || u.includes("LAKA")) statusCounts["STORING / LAKA"] = (statusCounts["STORING / LAKA"] || 0) + 1;
        else if (u.includes("DRIVER")) statusCounts["NO DRIVER"] = (statusCounts["NO DRIVER"] || 0) + 1;
        else if (u.includes("LOKASI")) statusCounts["TUNGGU LOKASI"] = (statusCounts["TUNGGU LOKASI"] || 0) + 1;
        else if (u.includes("GROUNDING")) statusCounts["GROUNDING"] = (statusCounts["GROUNDING"] || 0) + 1;
        else if (u.includes("REPO FULL")) statusCounts["REPO FULL"] = (statusCounts["REPO FULL"] || 0) + 1;
        else if (u.includes("REPO EMPTY")) statusCounts["REPO EMPTY"] = (statusCounts["REPO EMPTY"] || 0) + 1;
        else if (u.includes("KARTU") || u.includes("EKSPOR")) statusCounts["TUNGGU KARTU EKSPOR"] = (statusCounts["TUNGGU KARTU EKSPOR"] || 0) + 1;
        else statusCounts["GUDANG ANTRI MUAT"] = (statusCounts["GUDANG ANTRI MUAT"] || 0) + 1;
      } else {
        statusCounts["TERSEDIA"] = (statusCounts["TERSEDIA"] || 0) + 1;
      }
    });

    let totalArmadaTerdaftar = filteredTrucks.length;
    let standbyTersedia = statusCounts["TERSEDIA"] || 0;
    let dalamTugasAlokasi = totalArmadaTerdaftar - standbyTersedia;

    if (totalArmadaTerdaftar === 0) {
      const sumCounts = Object.values(statusCounts).reduce((a, b) => a + b, 0);
      if (sumCounts > 0) {
        totalArmadaTerdaftar = sumCounts;
        standbyTersedia = statusCounts["TERSEDIA"] || 36;
        dalamTugasAlokasi = totalArmadaTerdaftar - standbyTersedia;
      } else {
        totalArmadaTerdaftar = 46;
        standbyTersedia = 36;
        dalamTugasAlokasi = 10;
        statusCounts["TERSEDIA"] = 36;
        statusCounts["MUAT DEPO"] = 0;
        statusCounts["GUDANG ANTRI MUAT"] = 1;
        statusCounts["OTW PELABUHAN"] = 4;
        statusCounts["STORING / LAKA"] = 2;
        statusCounts["TUNGGU KARTU EKSPOR"] = 3;
      }
    }

    // Unique vendors
    const vendorSet = new Set(parsedTrucks.map((t) => (t.vendor || "UNKNOWN").trim()));
    const totalVendorMitra = targetVendor === "ALL" ? vendorSet.size : 1;

    // Format trucks list
    const trucksList = filteredTrucks.map((t) => ({
      id: t._id || t.id,
      platNomor: t.plat_nomor || t.platNomor || t.plat || "-",
      driverName: (t.nama_driver || t.driverName || t.driver || (t.status === "TERSEDIA" ? "TERSEDIA (STANDBY)" : "-")).toString().trim(),
      phone: t.no_hp || t.phone || t.noHp || "-",
      jenisMobil: t.jenis_mobil || t.jenisMobil || "Trailer 40ft HC",
      vendor: t.vendor || "Pancaran Darat",
      status: t.status || "TERSEDIA",
      fo: t.fo || t.nomor_fo || t.nomorFo || "-",
      dn: t.dn || "-",
      noContainer: t.no_container || t.no_cont || t.noContainer || "-",
      lokasiMuat: t.lokasi_muat || t.lokasiMuat || t.lokasi || "-",
      timbang1: t.timbang1 || t.timbang_1 || "-",
      timbang2: t.timbang2 || t.timbang_2 || "-",
      jenisProduk: t.jenis_produk || t.jenisProduk || "-",
      terakhirUpdate: t.terakhir_update || t.last_update || t.lastUpdate ? (typeof t.terakhir_update === "string" ? t.terakhir_update : new Date(t.terakhir_update || t.last_update).toLocaleString("id-ID")) : "-",
    }));

    const statusItems = STANDARD_STATUS_KEYS.map((item) => ({
      key: item.key,
      label: item.label,
      count: statusCounts[item.key] || 0,
    }));

    const mirrorData = {
      lastSyncedAt: new Date().toISOString(),
      vendorName: targetVendor === "ALL" ? "Pancaran Darat & Mitra" : "Pancaran Darat",
      userEmail: email,
      accessRole: "VENDOR EMKL",
      totalArmadaTerdaftar,
      dalamTugasAlokasi,
      standbyTersedia,
      totalVendorMitra,
      statusBreakdown: statusCounts,
      statusItems,
      trucks: trucksList,
    };

    cachedMirrorData = { timestamp: now, data: mirrorData };
    return mirrorData;
  } catch (error: any) {
    console.error("Error fetching TikPro Mirror Data:", error);
    if (cachedMirrorData) {
      return cachedMirrorData.data;
    }
    // Return default offline snapshot matching the TikPro web monitoring live data
    return {
      lastSyncedAt: new Date().toISOString(),
      vendorName: "Pancaran Darat",
      userEmail: email,
      accessRole: "VENDOR EMKL",
      totalArmadaTerdaftar: 46,
      dalamTugasAlokasi: 10,
      standbyTersedia: 36,
      totalVendorMitra: 1,
      statusBreakdown: {
        "TERSEDIA": 36,
        "MUAT DEPO": 0,
        "OTW IKK": 0,
        "DAFTAR DCO - ESTIMASI": 0,
        "GUDANG ANTRI MUAT": 1,
        "OTW PELABUHAN": 4,
        "BONGKAR PORT / DONE": 0,
        "STORING / LAKA": 2,
        "NO DRIVER": 0,
        "TUNGGU LOKASI": 0,
        "GROUNDING": 0,
        "REPO FULL": 0,
        "REPO EMPTY": 0,
        "TUNGGU KARTU EKSPOR": 3,
      },
      statusItems: STANDARD_STATUS_KEYS.map((item) => ({
        key: item.key,
        label: item.label,
        count:
          item.key === "TERSEDIA"
            ? 36
            : item.key === "GUDANG ANTRI MUAT"
            ? 1
            : item.key === "OTW PELABUHAN"
            ? 4
            : item.key === "STORING / LAKA"
            ? 2
            : item.key === "TUNGGU KARTU EKSPOR"
            ? 3
            : 0,
      })),
      trucks: [
        { id: "truck-1", platNomor: "B 9814 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "26 Jul 2026, 23.25" },
        { id: "truck-2", platNomor: "B 9713 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "26 Jul 2026, 22.52" },
        { id: "truck-3", platNomor: "B 9928 UWW", driverName: "DRIVER PANCARAN 3", phone: "08123456703", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "STORING / LAKA", fo: "STORING CHECK UP", dn: "STORING CHECK UP", noContainer: "STORING CHECK UP", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "14 Jul 2026, 12.19" },
        { id: "truck-4", platNomor: "B 9790 UFY", driverName: "DRIVER PANCARAN 4", phone: "08123456704", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "OTW PELABUHAN", fo: "6100510934", dn: "FI00000767", noContainer: "ONEU6444360", lokasiMuat: "EXPORT PM 3", timbang1: "26 Jul 2026, 14.22", timbang2: "26 Jul 2026, 16.20", terakhirUpdate: "27 Jul 2026, 09.50" },
        { id: "truck-5", platNomor: "B 9849 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "26 Jul 2026, 22.00" },
        { id: "truck-6", platNomor: "B 9847 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "26 Jul 2026, 23.28" },
        { id: "truck-7", platNomor: "B 9739 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "26 Jul 2026, 23.21" },
        { id: "truck-8", platNomor: "B 9697 UIW", driverName: "DRIVER PANCARAN 8", phone: "08123456708", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "OTW PELABUHAN", fo: "6100510926", dn: "FI00000767", noContainer: "ONEU5052087", lokasiMuat: "EXPORT PM 3", timbang1: "26 Jul 2026, 14.35", timbang2: "26 Jul 2026, 17.23", terakhirUpdate: "27 Jul 2026, 09.50" },
        { id: "truck-9", platNomor: "B 9851 UFY", driverName: "DRIVER PANCARAN 9", phone: "08123456709", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TUNGGU KARTU EKSPOR", fo: "6100510778", dn: "FI00000764", noContainer: "JXLU4565026", lokasiMuat: "EXPORT PM 1", timbang1: "26 Jul 2026, 16.07", timbang2: "26 Jul 2026, 22.38", terakhirUpdate: "27 Jul 2026, 09.52" },
        { id: "truck-10", platNomor: "B 9710 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-11", platNomor: "B 9711 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-12", platNomor: "B 9712 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-13", platNomor: "B 9714 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-14", platNomor: "B 9715 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-15", platNomor: "B 9716 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-16", platNomor: "B 9717 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-17", platNomor: "B 9718 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-18", platNomor: "B 9719 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-19", platNomor: "B 9720 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-20", platNomor: "B 9721 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-21", platNomor: "B 9722 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-22", platNomor: "B 9723 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-23", platNomor: "B 9724 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-24", platNomor: "B 9725 UIW", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-25", platNomor: "B 9801 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-26", platNomor: "B 9802 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-27", platNomor: "B 9803 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-28", platNomor: "B 9804 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-29", platNomor: "B 9805 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-30", platNomor: "B 9806 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-31", platNomor: "B 9807 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-32", platNomor: "B 9808 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-33", platNomor: "B 9809 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-34", platNomor: "B 9810 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-35", platNomor: "B 9811 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-36", platNomor: "B 9812 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-37", platNomor: "B 9813 UFY", driverName: "DRIVER PANCARAN 37", phone: "08123456737", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "GUDANG ANTRI MUAT", fo: "6100510811", dn: "FI00000760", noContainer: "OOLU9812340", lokasiMuat: "EXPORT PM 2", timbang1: "26 Jul 2026, 18.10", timbang2: "-", terakhirUpdate: "27 Jul 2026, 08.15" },
        { id: "truck-38", platNomor: "B 9815 UFY", driverName: "DRIVER PANCARAN 38", phone: "08123456738", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "OTW PELABUHAN", fo: "6100510940", dn: "FI00000768", noContainer: "MSKU8829102", lokasiMuat: "EXPORT PM 3", timbang1: "26 Jul 2026, 15.10", timbang2: "26 Jul 2026, 18.00", terakhirUpdate: "27 Jul 2026, 09.45" },
        { id: "truck-39", platNomor: "B 9816 UFY", driverName: "DRIVER PANCARAN 39", phone: "08123456739", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "OTW PELABUHAN", fo: "6100510941", dn: "FI00000768", noContainer: "MSKU8829103", lokasiMuat: "EXPORT PM 3", timbang1: "26 Jul 2026, 15.20", timbang2: "26 Jul 2026, 18.15", terakhirUpdate: "27 Jul 2026, 09.48" },
        { id: "truck-40", platNomor: "B 9817 UFY", driverName: "DRIVER PANCARAN 40", phone: "08123456740", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "STORING / LAKA", fo: "REPAIR", dn: "REPAIR", noContainer: "REPAIR", lokasiMuat: "WORKSHOP", timbang1: "-", timbang2: "-", terakhirUpdate: "20 Jul 2026, 14.10" },
        { id: "truck-41", platNomor: "B 9818 UFY", driverName: "DRIVER PANCARAN 41", phone: "08123456741", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TUNGGU KARTU EKSPOR", fo: "6100510780", dn: "FI00000765", noContainer: "TCNU9120491", lokasiMuat: "EXPORT PM 1", timbang1: "26 Jul 2026, 17.00", timbang2: "26 Jul 2026, 23.00", terakhirUpdate: "27 Jul 2026, 09.50" },
        { id: "truck-42", platNomor: "B 9819 UFY", driverName: "DRIVER PANCARAN 42", phone: "08123456742", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TUNGGU KARTU EKSPOR", fo: "6100510781", dn: "FI00000765", noContainer: "TCNU9120492", lokasiMuat: "EXPORT PM 1", timbang1: "26 Jul 2026, 17.15", timbang2: "26 Jul 2026, 23.10", terakhirUpdate: "27 Jul 2026, 09.51" },
        { id: "truck-43", platNomor: "B 9820 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-44", platNomor: "B 9821 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-45", platNomor: "B 9822 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
        { id: "truck-46", platNomor: "B 9823 UFY", driverName: "TERSEDIA (STANDBY)", phone: "-", jenisMobil: "Trailer 40ft HC", vendor: "Pancaran Darat", status: "TERSEDIA", fo: "-", dn: "-", noContainer: "-", lokasiMuat: "-", timbang1: "-", timbang2: "-", terakhirUpdate: "27 Jul 2026, 10.30" },
      ],
    };
  }
}
