import type { VercelRequest, VercelResponse } from "@vercel/node";
import { parseCSV, parseSpreadsheetInfo } from "../../src/lib/sheetsEngine";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    if (req.method !== "POST") {
      return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { url, headerRowIndex } = req.body || {};
    if (!url) {
      return res.status(400).json({ success: false, message: "URL spreadsheet wajib diisi" });
    }

    const { spreadsheetId, gid } = parseSpreadsheetInfo(url);
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

    const response = await fetch(csvUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: "Gagal mengakses spreadsheet. Pastikan link dapat diakses Publik."
      });
    }

    const csvText = await response.text();
    const { headers, rows } = parseCSV(csvText, headerRowIndex);

    return res.status(200).json({
      success: true,
      headers,
      sampleCount: rows.length,
      sampleRows: rows.slice(0, 5)
    });
  } catch (error: any) {
    console.error("Error inspecting sheet:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Gagal menginspeksi spreadsheet"
    });
  }
}
