const https = require("https");

const apiKey = "AIzaSyC19AOb9d5OHHbb0EiwDdQJQbcMqU_Jagg";

async function inspectHTML() {
  return new Promise((resolve) => {
    https.get("https://monitoring-kontrak-export.web.app/", (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve(body));
    });
  });
}

async function main() {
  const html = await inspectHTML();
  console.log("HTML length:", html.length);
  
  // Find all collection(db, "...") or doc(db, "...")
  const matches = html.match(/["']([a-zA-Z0-9_\-]+)["']/g) || [];
  const candidateCollections = new Set();
  
  const keywords = ["truck", "armada", "kontrak", "export", "order", "vendor", "user", "status", "alokasi", "dco", "repo", "storing"];
  
  for (const m of matches) {
    const clean = m.replace(/["']/g, "");
    if (keywords.some(k => clean.toLowerCase().includes(k))) {
      candidateCollections.add(clean);
    }
  }

  console.log("Candidate collection strings found in HTML:", Array.from(candidateCollections));

  // Also extract all JS variable definitions or snapshot listeners
  const snapMatches = html.match(/onSnapshot\([^)]+\)/g) || [];
  console.log("Snapshot listeners:", snapMatches.slice(0, 5));
}

main().catch(console.error);
