import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTikProMirrorData } from "../../server/tikpro";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const email = (req.body?.email || req.query?.email || "pdt@ikk.com").toString();
    const password = (req.body?.password || req.query?.password || "pdt@ikk.com").toString();
    const vendorFilter = (req.body?.vendorFilter || req.query?.vendorFilter || "Pancaran Darat").toString();
    const forceRefresh = req.body?.forceRefresh === true || req.query?.forceRefresh === "true";

    const data = await getTikProMirrorData(email, password, vendorFilter, forceRefresh);
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error("Error fetching TikPro mirror data:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Gagal melakukan mirroring data TikPro",
      error: String(error)
    });
  }
}
