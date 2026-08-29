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

async function main() {
  const poolCsv = await fetchCSV(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_POOLING}`);
  const poolRecords = parseCSVRecords(poolCsv);
  console.log("Pool Total Rows (including headers):", poolRecords.length);
  console.log("Pool Header Row 0:", poolRecords[0]);
  console.log("Pool Row 1 Sample:", poolRecords[1]);
  console.log("Pool Row 313 Sample:", poolRecords[poolRecords.length - 1]);

  const execCsv = await fetchCSV(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_EXECUTED}`);
  const execRecords = parseCSVRecords(execCsv);
  console.log("\nExec Total Rows (including headers):", execRecords.length);
  console.log("Exec Header Row 0:", execRecords[0]);
  console.log("Exec Row 1 Sample:", execRecords[1]);
  console.log("Exec Row 1947 Sample:", execRecords[execRecords.length - 1]);
}

main().catch(console.error);
