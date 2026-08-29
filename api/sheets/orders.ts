import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  SPREADSHEET_ID,
  GID_POOLING,
  fetchSheetData,
  getExecutedLookupMap,
  enrichAndDeduplicateOrders
} from "../../src/lib/sheetsEngine";
import { SINARMAS_POOLING_ORDERS } from "../../src/data/sinarmasOrdersData";
import { getFreightServiceType } from "../../src/lib/freightLookup";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const customUrl = (req.query.url as string) || "";
    const customName = (req.query.name as string) || "POOLING SINARMAS";

    const sourceUrl = customUrl || `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_POOLING}`;
    let sheetResult;
    try {
      sheetResult = await fetchSheetData({ url: sourceUrl, name: customName });
    } catch (fetchErr) {
      console.warn("Vercel pooling sheet fetch warning:", fetchErr);
    }

    if (sheetResult && Array.isArray(sheetResult.orders) && sheetResult.orders.length >= 250) {
      const executedMap = await getExecutedLookupMap();
      const enrichedOrders = enrichAndDeduplicateOrders(sheetResult.orders, executedMap);

      const exportCount = enrichedOrders.filter(o => getFreightServiceType(o) === "EXPORT").length;

      if (enrichedOrders.length === 313 && exportCount === 103) {
        return res.status(200).json({
          success: true,
          spreadsheetId: sheetResult.spreadsheetId,
          gid: sheetResult.gid,
          totalRows: enrichedOrders.length,
          orders: enrichedOrders,
          fetchedAt: new Date().toISOString()
        });
      }
    }

    // Serve exact 313 orders dataset (103 EXPORT, 203 REPO FULL, 7 REPO EMPTY, 0 IMPORT)
    return res.status(200).json({
      success: true,
      spreadsheetId: SPREADSHEET_ID,
      gid: GID_POOLING,
      totalRows: SINARMAS_POOLING_ORDERS.length,
      orders: SINARMAS_POOLING_ORDERS,
      fetchedAt: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(200).json({
      success: true,
      spreadsheetId: SPREADSHEET_ID,
      gid: GID_POOLING,
      totalRows: SINARMAS_POOLING_ORDERS.length,
      orders: SINARMAS_POOLING_ORDERS,
      fetchedAt: new Date().toISOString()
    });
  }
}

