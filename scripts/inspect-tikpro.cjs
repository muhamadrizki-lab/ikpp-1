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

async function loginFirebase() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email: "pdt@ikk.com", password: "pdt@ikk.com", returnSecureToken: true });
    const req = https.request(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(postData) }
    }, res => {
      let b = ""; res.on("data", c => b += c); res.on("end", () => resolve(JSON.parse(b)));
    });
    req.write(postData); req.end();
  });
}

async function fetchFirestoreDocs(token, collectionName) {
  return new Promise((resolve) => {
    https.get(`https://firestore.googleapis.com/v1/projects/export-ikk/databases/(default)/documents/${collectionName}`, {
      headers: { "Authorization": `Bearer ${token}` }
    }, res => {
      let b = ""; res.on("data", c => b += c); res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(b) }); }
        catch(e) { resolve({ status: res.statusCode, error: e.message, body: b }); }
      });
    });
  });
}

async function main() {
  const html = await inspectHTML();
  
  // Extract all collection references in code
  const colRegex = /collection\s*\(\s*db\s*,\s*["']([^"']+)["']\)/g;
  let m;
  const collections = new Set();
  while ((m = colRegex.exec(html)) !== null) {
    collections.add(m[1]);
  }

  console.log("Collections found in TikPro web code:", Array.from(collections));

  // Log in to Firebase
  const auth = await loginFirebase();
  if (!auth.idToken) {
    console.error("Failed to login:", auth);
    return;
  }
  console.log("Logged in successfully as pdt@ikk.com!");

  // Query each collection
  for (const col of Array.from(collections)) {
    const res = await fetchFirestoreDocs(auth.idToken, col);
    console.log(`Collection "${col}" -> Status: ${res.status}, Count: ${res.data && res.data.documents ? res.data.documents.length : 0}`);
    if (res.data && res.data.documents && res.data.documents[0]) {
      console.log(`Sample doc in "${col}":`, JSON.stringify(res.data.documents[0], null, 2).slice(0, 300));
    }
  }
}

main().catch(console.error);
