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

const poolCsv = fs.readFileSync("pooling.csv", "utf8");
const poolRecs = parseCSVRecords(poolCsv);
console.log("=== POOLING CSV ===");
console.log("Total Raw Rows:", poolRecs.length);
console.log("Header (row 0):", poolRecs[0]);

const validPoolRows = poolRecs.slice(1).filter((r, idx) => {
  const no = (r[0] || "").trim();
  const id = (r[1] || "").trim();
  const cust = (r[7] || "").trim();
  if (id.toUpperCase().includes("JANGAN DI HAPUS") || cust.toUpperCase().includes("JANGAN DI HAPUS")) return false;
  return id.length > 0 || no.length > 0;
});
console.log("Valid Pooling Orders Count:", validPoolRows.length);
console.log("First Pooling Row:", validPoolRows[0]);
console.log("Last Pooling Row:", validPoolRows[validPoolRows.length - 1]);

const execCsv = fs.readFileSync("executed.csv", "utf8");
const execRecs = parseCSVRecords(execCsv);
console.log("\n=== EXECUTED CSV ===");
console.log("Total Raw Rows:", execRecs.length);
console.log("Header (row 0):", execRecs[0]);

const validExecRows = execRecs.slice(1).filter((r, idx) => {
  const no = (r[0] || "").trim();
  const idExec = (r[1] || "").trim();
  const cust = (r[10] || "").trim();
  if (idExec.toUpperCase().includes("JANGAN DI HAPUS") || cust.toUpperCase().includes("JANGAN DI HAPUS") || idExec.toLowerCase().includes("sample data")) return false;
  return idExec.length > 0 || no.length > 0;
});
console.log("Valid Executed Shipments Count:", validExecRows.length);
console.log("First Executed Row:", validExecRows[0]);
console.log("Last Executed Row:", validExecRows[validExecRows.length - 1]);
