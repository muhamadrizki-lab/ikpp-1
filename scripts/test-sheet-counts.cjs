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
      res.on("end", () => resolve({ status: res.statusCode, data }));
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
  console.log("Fetching POOLING SINARMAS...");
  const poolRes = await fetchCSV(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_POOLING}`);
  console.log("Pool Status:", poolRes.status, "Length:", poolRes.data.length);
  const poolRecords = parseCSVRecords(poolRes.data);
  console.log("Pool Records count:", poolRecords.length);
  if (poolRecords.length > 0) {
    console.log("Pool Headers/First 3 rows:");
    poolRecords.slice(0, 3).forEach((r, i) => console.log(`Row ${i}:`, r.slice(0, 10)));
  }

  console.log("\nFetching EXECUTED SINARMAS...");
  const execRes = await fetchCSV(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_EXECUTED}`);
  console.log("Exec Status:", execRes.status, "Length:", execRes.data.length);
  const execRecords = parseCSVRecords(execRes.data);
  console.log("Exec Records count:", execRecords.length);
  if (execRecords.length > 0) {
    console.log("Exec Headers/First 3 rows:");
    execRecords.slice(0, 3).forEach((r, i) => console.log(`Row ${i}:`, r.slice(0, 10)));
  }
}

main().catch(console.error);
