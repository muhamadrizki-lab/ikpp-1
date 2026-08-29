const { SPREADSHEET_ID, GID_POOLING, GID_EXECUTED, fetchSheetData, enrichAndDeduplicateOrders, getExecutedLookupMap } = require("../src/lib/sheetsEngine.ts");

async function test() {
  console.log("Testing fetchSheetData for Pooling...");
  try {
    const poolingResult = await fetchSheetData({
      name: "POOLING SINARMAS",
      url: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?gid=${GID_POOLING}`
    });
    console.log("Raw Pooling Orders Count:", poolingResult.orders.length);
    console.log("Raw Pooling Order 0:", poolingResult.orders[0]);
    console.log("Raw Pooling Order Last:", poolingResult.orders[poolingResult.orders.length - 1]);

    const executedMap = await getExecutedLookupMap();
    console.log("Executed Map size:", executedMap.size);

    const enriched = enrichAndDeduplicateOrders(poolingResult.orders, executedMap);
    console.log("Enriched Pooling Orders Count:", enriched.length);
  } catch (err) {
    console.error("Pooling error:", err);
  }

  console.log("\nTesting fetchSheetData for Executed...");
  try {
    const executedResult = await fetchSheetData({
      name: "EXECUTED SINARMAS",
      url: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?gid=${GID_EXECUTED}`
    });
    console.log("Raw Executed Orders Count:", executedResult.orders.length);
    console.log("Raw Executed Order 0:", executedResult.orders[0]);
    console.log("Raw Executed Order Last:", executedResult.orders[executedResult.orders.length - 1]);
  } catch (err) {
    console.error("Executed error:", err);
  }
}

test();
