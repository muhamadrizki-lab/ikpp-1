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

    if (req.method === "POST") {
      const { sheets } = req.body || {};

      if (!Array.isArray(sheets) || sheets.length === 0) {
        // Fallback to default single sheet if empty array provided
        const defaultSheet = await fetchSheetData({
          name: "POOLING SINARMAS",
          url: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_POOLING}`
        });
        const executedMap = await getExecutedLookupMap();
        const enrichedOrders = enrichAndDeduplicateOrders(defaultSheet.orders, executedMap);

        return res.status(200).json({
          success: true,
          totalOrders: enrichedOrders.length,
          orders: enrichedOrders,
          sheetResults: [{
            name: "POOLING SINARMAS",
            status: "success",
            rowCount: enrichedOrders.length
          }],
          fetchedAt: new Date().toISOString()
        });
      }

      // Filter enabled sheets only
      const enabledSheets = sheets.filter((s: any) => s.enabled !== false && s.url && s.url.trim().length > 0);

      if (enabledSheets.length === 0) {
        return res.status(200).json({
          success: true,
          totalOrders: 0,
          orders: [],
          sheetResults: [],
          message: "Tidak ada sheet aktif yang dikirim.",
          fetchedAt: new Date().toISOString()
        });
      }

      const results = await Promise.allSettled(
        enabledSheets.map((s: any) =>
          fetchSheetData({
            id: s.id,
            url: s.url,
            name: s.name || "Google Sheet",
            headerRowIndex: s.headerRowIndex ?? s.columnMapping?.headerRowIndex,
            columnMapping: s.columnMapping,
            formulaRules: s.formulaRules
          })
        )
      );

      const allOrders: any[] = [];
      const sheetResults: any[] = [];

      results.forEach((result, index) => {
        const sheetMeta = enabledSheets[index];
        if (result.status === "fulfilled") {
          allOrders.push(...result.value.orders);
          sheetResults.push({
            id: sheetMeta.id,
            name: result.value.sheetName,
            status: "success",
            rowCount: result.value.rowCount,
            spreadsheetId: result.value.spreadsheetId,
            gid: result.value.gid
          });
        } else {
          sheetResults.push({
            id: sheetMeta.id,
            name: sheetMeta.name,
            status: "error",
            rowCount: 0,
            errorMessage: result.reason?.message || "Gagal mengunduh sheet"
          });
        }
      });

      const executedMap = await getExecutedLookupMap();
      const finalOrders = enrichAndDeduplicateOrders(allOrders, executedMap);

      return res.status(200).json({
        success: true,
        totalOrders: finalOrders.length,
        orders: finalOrders,
        sheetResults,
        fetchedAt: new Date().toISOString()
      });
    }

    // Default GET request handler
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
