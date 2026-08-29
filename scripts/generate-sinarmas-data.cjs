const fs = require("fs");

function parseCSVRecords(csvText) {
  const records = [];
  let currentRecord = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRecord.push(currentCell.trim());
      currentCell = "";
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRecord.push(currentCell.trim());
      if (currentRecord.some(c => c.length > 0)) records.push(currentRecord);
      currentRecord = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }
  if (currentCell.length > 0 || currentRecord.length > 0) {
    currentRecord.push(currentCell.trim());
    if (currentRecord.some(c => c.length > 0)) records.push(currentRecord);
  }
  return records;
}

function cleanVehiclePlate(val) {
  if (!val) return "";
  const cleaned = val.trim();
  const upper = cleaned.toUpperCase();
  if (
    !upper ||
    upper === "#N/A" ||
    upper === "N/A" ||
    upper === "-" ||
    upper === "NONE" ||
    upper === "NULL" ||
    upper === "UNMAPPED" ||
    upper === "NO UNIT" ||
    upper === "NO NOPOL" ||
    upper === "EMPTY" ||
    upper === "UNDEFINED" ||
    upper.includes("PLB") ||
    upper.includes("KARAWANG") ||
    upper.includes("SURABAYA") ||
    upper.includes("PRIOK") ||
    upper.includes("SEMARANG") ||
    upper.includes("JAKARTA") ||
    upper.includes("KOJA") ||
    upper.includes("NPCT") ||
    upper.includes("UTC") ||
    upper.includes("BSA") ||
    upper.includes("PDT") ||
    upper.includes("PORT") ||
    upper.includes("IKK") ||
    upper.includes("IKPP") ||
    upper.includes("FULL TRUCKING") ||
    upper.includes("TRUCKING") ||
    upper.includes("SERVICE") ||
    upper.includes("TRAILER") ||
    upper.includes("EXP") ||
    upper.includes("IMP") ||
    upper.includes("RUTE") ||
    upper.includes("CONTAINER") ||
    upper.includes("GUDANG") ||
    upper.includes("DEPO") ||
    upper.includes("FACTORY") ||
    upper.includes("MILL") ||
    upper.includes("POINT") ||
    upper.includes("ADDRESS") ||
    upper.includes("LOCATION")
  ) {
    return "";
  }
  return cleaned;
}

function cleanDriver(val) {
  if (!val) return "";
  const cleaned = val.trim();
  const upper = cleaned.toUpperCase();
  if (
    !upper ||
    upper === "#N/A" ||
    upper === "N/A" ||
    upper === "-" ||
    upper === "NONE" ||
    upper === "NULL" ||
    upper === "UNMAPPED" ||
    upper === "NO DRIVER" ||
    upper === "EMPTY" ||
    upper === "UNDEFINED" ||
    upper.includes("FULL TRUCKING") ||
    upper.includes("TRUCKING") ||
    upper.includes("SERVICE") ||
    upper.includes("RUTE") ||
    upper.includes("EXP - IMP") ||
    upper.includes("EXP") ||
    upper.includes("IMP") ||
    upper.includes("KOJA") ||
    upper.includes("NPCT") ||
    upper.includes("IKK") ||
    upper.includes("PORT") ||
    upper.includes("CONTAINER") ||
    upper.includes("PLB") ||
    upper.includes("KARAWANG")
  ) {
    return "";
  }
  return cleaned;
}

function cleanGPS(val) {
  if (!val) return "";
  // Remove all non-printable characters
  return val.replace(/[^\x20-\x7E]+/g, '').trim();
}

// 1. POOLING ORDERS (313 rows)
const poolCsv = fs.readFileSync("pooling.csv", "utf8");
const poolRecs = parseCSVRecords(poolCsv);
const rawPoolRows = poolRecs.slice(1);

const orders = rawPoolRows.slice(0, 313).map((r, idx) => {
  const no = r[0] || String(idx + 1);
  let id = (r[1] || "").trim();
  if (!id || id.toUpperCase().includes("JANGAN DI HAPUS")) {
    id = `SM-D${String(idx + 1).padStart(6, "0")}`;
  }
  const bussinesSegment = r[2] || "ILS";
  const organization = r[3] || "Tanah Merdeka Petra - Sinarmas";
  const bookingDate = r[4] || "";
  const noJobOrder = r[5] || "";
  const noFo = r[6] || "";
  let customer = (r[7] || "").trim();
  if (!customer || customer.toUpperCase().includes("JANGAN DI HAPUS")) {
    customer = "INDAH KIAT PULP & PAPER TBK.";
  }
  const sat = r[8] || "REGULER TRIP BASIS ( RTB)";
  const consignee = r[9] || customer;
  const salesProduct = r[10] || "";
  const estimateReqDlvDate = r[11] || "";
  const product = r[12] || "";
  const attachment = r[13] || "";
  const containerType = r[14] || "40FT";
  const quantity = parseInt(r[15], 10) || 1;
  const rawType = (r[16] || "EXPORT").toUpperCase();
  const type = rawType.includes("IMP") ? "impor" : rawType.includes("REPO") ? "repo" : "ekspor";
  const freightType = r[16] || "EXPORT";
  const transportType = r[17] || "FULL TRUCKING LOAD (EXP - IMP)";
  const pickUpLocation = r[18] || "PT. Indah Kiat Pulp & Paper - Karawang";
  const addressLoadingPoint = r[19] || "";
  const origin = r[20] || pickUpLocation || "KARAWANG";
  const dropOfLocation = r[21] || "UTC";
  const addressUnloadingPoint = r[22] || "";
  const destination = r[23] || dropOfLocation || "PORT TJ PRIOK";
  const commercialRoute = r[24] || "KARAWANG - TANJUNG PRIOK (IKK) - 0 - 160";
  const sqNumber = r[25] || "PTR.SQ.1001288";
  const dateConfirm = r[26] || "";
  const confirmedQty = r[27] || "";
  const totalMissed = r[28] || "";
  const reasonMissed = r[29] || "";
  const statusPooling = (r[30] || "CONFIRM").trim();
  const picName = r[31] || "";
  const uploadDocument = r[32] || "";
  const salesOrderNo = r[33] || "";
  const cdoNumber = r[34] || "";

  let status = "Confirmed";
  const spUpper = statusPooling.toUpperCase();
  if (spUpper.includes("CANCEL") || spUpper.includes("BATAL") || spUpper.includes("REJECT") || spUpper.includes("MISSED")) {
    status = "Cancelled";
  } else if (spUpper.includes("NEED") || spUpper.includes("ACTION") || spUpper.includes("PENDING") || spUpper.includes("PROCESS") || spUpper.includes("HOLD")) {
    status = "Planning";
  } else {
    status = "Confirmed";
  }

  return {
    id,
    no,
    noJobOrder,
    noFo,
    bookingDate,
    customer,
    type,
    status,
    origin,
    destination,
    quantity,
    commercialRoute,
    bussinesSegment,
    organization,
    sat,
    consignee,
    salesProduct,
    estimateReqDlvDate,
    product,
    attachment,
    containerType,
    freightType,
    transportType,
    pickUpLocation,
    addressLoadingPoint,
    dropOfLocation,
    addressUnloadingPoint,
    sqNumber,
    dateConfirm,
    confirmedQty,
    totalMissed,
    reasonMissed,
    statusPooling,
    picName,
    uploadDocument,
    salesOrderNo,
    cdoNumber,
    notes: reasonMissed || commercialRoute || "",
    sourceSheetName: "POOLING SINARMAS"
  };
});

if (!fs.existsSync("src/data")) {
  fs.mkdirSync("src/data", { recursive: true });
}

console.log("Generated Orders Count:", orders.length);
fs.writeFileSync("src/data/sinarmasOrdersData.json", JSON.stringify(orders, null, 2));
fs.writeFileSync("src/data/sinarmasOrdersData.ts", "export const SINARMAS_POOLING_ORDERS = " + JSON.stringify(orders, null, 2) + ";\n");

// 2. EXECUTED SHIPMENTS (1947 rows)
const execCsv = fs.readFileSync("executed.csv", "utf8");
const execRecs = parseCSVRecords(execCsv);
const rawExecRows = execRecs.slice(1);

const shipments = rawExecRows.slice(0, 1947).map((r, idx) => {
  const no = r[0] || String(idx + 1);
  let id = (r[1] || "").trim();
  if (!id || id.toUpperCase().includes("JANGAN DI HAPUS") || id.toLowerCase().includes("sample data")) {
    id = `SM-D000001.01`;
  }
  const idPoolingOrder = (r[2] || "").trim().includes("JANGAN DI HAPUS") ? "SM-D000001" : (r[2] || "");
  const organization = r[3] || "Tanah Merdeka Petra - Sinarmas";
  const bussinesSegment = r[4] || "ILS";
  const sat = r[5] || "REGULER TRIP BASIS ( RTB)";
  const bookingDate = r[6] || "";
  const receivedDeliveryOrder = r[7] || "";
  const updateBy = r[8] || "";
  const shift = r[9] || "";
  let customer = (r[10] || "").trim();
  if (!customer || customer.toUpperCase().includes("JANGAN DI HAPUS")) {
    customer = "INDAH KIAT PULP & PAPER TBK.";
  }
  const consignee = r[11] || customer;
  const materialCargoType = r[12] || "Paper";
  const commercialRoute = r[13] || "KARAWANG - TANJUNG PRIOK (IKK)";
  const shipmentBy = r[14] || "";
  const noJobOrder = r[15] || "";
  const noFo = r[16] || "";
  const requestStuffing = r[17] || "";
  const containerNo = r[18] || "";
  const esealNumber = r[19] || "";
  const salesProduct = r[20] || "";
  const sqNumber = r[21] || "";
  const attachment = r[22] || "";
  const containerType = r[23] || "40 FT";
  const rawFreight = (r[24] || "EXPORT").toUpperCase();
  const type = rawFreight.includes("IMP") ? "impor" : rawFreight.includes("REPO") ? "repo" : "ekspor";
  const freightType = r[24] || "EXPORT";
  const transportType = r[25] || "FULL TRUCKING LOAD (EXP - IMP)";
  const pickUpLocation = r[26] || "PT. Indah Kiat Pulp & Paper - Karawang";
  const addressLoadingPoint = r[27] || "";
  const origin = r[28] || pickUpLocation || "KARAWANG";
  const dropOfLocation = r[29] || "UTC";
  const addressUnloadingPoint = r[30] || "";
  const destination = r[31] || dropOfLocation || "PORT TJ PRIOK";
  const shippingLine = r[32] || "";
  const depoName = r[33] || "";
  const alamatDepo = r[34] || "";
  const pelabuhan = r[35] || "";
  const statusOrder = r[36] || "";
  const remarkCS = r[37] || "";
  const receivedDocServices = r[38] || "";
  const receivedBonMuat = r[39] || "";
  const receivedGatePass = r[40] || "";
  const closingTimePort = r[41] || "";
  const closingDo = r[42] || "";
  const salesOrderNo = r[43] || "";
  const salesOrderDate = r[44] || "";
  const cdoNumber = r[45] || "";
  const pvList = r[46] || "";
  const datePvRelease = r[47] || "";
  const rfco1 = r[48] || "";
  const rfco2 = r[49] || "";
  const status = r[50] || "Active";
  const driver = cleanDriver(r[51] || "");
  const vehiclePlate = cleanVehiclePlate(r[52] || "");
  const gpsUnitPosition = cleanGPS(r[55] || "");
  const lastUpdateGPS = r[56] || "";
  const statusCDO = r[57] || "";
  let lastUpdateCS = (r[58] || "").trim();
  if (!lastUpdateCS) {
    lastUpdateCS = statusOrder || "WAITING CONFIRM";
  }
  const dateUpdate = r[59] || "";

  return {
    id,
    no,
    idOrderExecute: id,
    idPoolingOrder,
    organization,
    bussinesSegment,
    sat,
    bookingDate,
    receivedDeliveryOrder,
    updateBy,
    shift,
    customer,
    consignee,
    materialCargoType,
    commercialRoute,
    shipmentBy,
    noJobOrder,
    noFo,
    requestStuffing,
    containerNo,
    esealNumber,
    salesProduct,
    sqNumber,
    attachment,
    containerType,
    freightType,
    type,
    transportType,
    pickUpLocation,
    addressLoadingPoint,
    origin,
    dropOfLocation,
    addressUnloadingPoint,
    destination,
    shippingLine,
    depoName,
    alamatDepo,
    pelabuhan,
    statusOrder,
    remarkCS,
    receivedDocServices,
    receivedBonMuat,
    receivedGatePass,
    closingTimePort,
    closingDo,
    salesOrderNo,
    salesOrderDate,
    cdoNumber,
    pvList,
    datePvRelease,
    rfco1,
    rfco2,
    status,
    driver,
    vehiclePlate,
    gpsUnitPosition,
    statusRealtime: gpsUnitPosition || origin,
    lastUpdateGPS,
    statusCDO,
    lastUpdateCS,
    dateUpdate,
    eta: requestStuffing || closingTimePort || "",
    quantity: 1,
    sourceSheetName: "EXECUTED SINARMAS"
  };
});

console.log("Generated Executed Shipments Count:", shipments.length);
fs.writeFileSync("src/data/sinarmasShipmentsData.json", JSON.stringify(shipments, null, 2));
fs.writeFileSync("src/data/sinarmasShipmentsData.ts", "export const SINARMAS_EXECUTED_SHIPMENTS = " + JSON.stringify(shipments, null, 2) + ";\n");

