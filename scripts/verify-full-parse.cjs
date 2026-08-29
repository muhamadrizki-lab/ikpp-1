const https = require("https");

const SPREADSHEET_ID = "1pavvP7EtzMvHiIhCP5X_aoTVP5nLkV03Vw_IV0iQkxU";
const GID_POOLING = "1444994189";
const GID_EXECUTED = "714297382";

function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchCSV(res.headers.location).then(resolve).catch(reject);
      }
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

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

async function run() {
  const poolCsv = await fetchCSV(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_POOLING}`);
  const poolRecs = parseCSVRecords(poolCsv);
  console.log("Pool Total Rows:", poolRecs.length);
  const poolHeaders = poolRecs[0];
  const poolData = poolRecs.slice(1).filter(r => {
    const id = (r[1] || "").toUpperCase();
    const cust = (r[7] || "").toUpperCase();
    return !id.includes("JANGAN DI HAPUS") && !cust.includes("JANGAN DI HAPUS") && (r[1] || r[0]);
  });
  console.log("Pool Filtered Data Count:", poolData.length);

  const execCsv = await fetchCSV(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_EXECUTED}`);
  const execRecs = parseCSVRecords(execCsv);
  console.log("\nExec Total Rows:", execRecs.length);
  const execHeaders = execRecs[0];
  const execData = execRecs.slice(1).filter(r => {
    const id = (r[1] || "").toUpperCase();
    const cust = (r[10] || "").toUpperCase();
    return !id.includes("JANGAN DI HAPUS") && !cust.includes("JANGAN DI HAPUS") && (r[1] || r[0]);
  });
  console.log("Exec Filtered Data Count:", execData.length);
}

run().catch(console.error);
