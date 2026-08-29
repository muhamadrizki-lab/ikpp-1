const https = require("https");

const apiKey = "AIzaSyC19AOb9d5OHHbb0EiwDdQJQbcMqU_Jagg";

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

async function fetchAllDocs(token, collectionName) {
  let docs = [];
  let nextPageToken = null;

  do {
    let url = `https://firestore.googleapis.com/v1/projects/export-ikk/databases/(default)/documents/${collectionName}?pageSize=300`;
    if (nextPageToken) url += `&pageToken=${nextPageToken}`;

    const res = await new Promise((resolve) => {
      https.get(url, { headers: { "Authorization": `Bearer ${token}` } }, res => {
        let b = ""; res.on("data", c => b += c); res.on("end", () => resolve(JSON.parse(b)));
      });
    });

    if (res.documents) {
      docs = docs.concat(res.documents);
    }
    nextPageToken = res.nextPageToken;
  } while (nextPageToken);

  return docs;
}

function parseDocFields(doc) {
  if (!doc.fields) return {};
  const obj = { _id: doc.name.split("/").pop() };
  for (const [k, v] of Object.entries(doc.fields)) {
    if (v.stringValue !== undefined) obj[k] = v.stringValue;
    else if (v.integerValue !== undefined) obj[k] = parseInt(v.integerValue, 10);
    else if (v.doubleValue !== undefined) obj[k] = parseFloat(v.doubleValue);
    else if (v.booleanValue !== undefined) obj[k] = v.booleanValue;
    else if (v.mapValue !== undefined) obj[k] = v.mapValue;
    else if (v.arrayValue !== undefined) obj[k] = v.arrayValue;
  }
  return obj;
}

async function main() {
  const auth = await loginFirebase();
  console.log("Logged in!");

  const rawTrucks = await fetchAllDocs(auth.idToken, "trucks");
  const trucks = rawTrucks.map(parseDocFields);
  console.log("Total trucks in Firestore:", trucks.length);

  // Group by vendor
  const vendorCounts = {};
  const statusCounts = {};

  trucks.forEach(t => {
    const v = t.vendor || "UNKNOWN";
    vendorCounts[v] = (vendorCounts[v] || 0) + 1;

    const s = t.status || "UNKNOWN";
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  console.log("\nVendor breakdown:", vendorCounts);
  console.log("\nStatus breakdown across ALL trucks:", statusCounts);

  // Filter for Pancaran / PDT user
  const pdtTrucks = trucks.filter(t => (t.vendor || "").toUpperCase().includes("PANCARAN"));
  console.log("\nPANCARAN DARAT trucks count:", pdtTrucks.length);

  const pdtStatusCounts = {};
  pdtTrucks.forEach(t => {
    const s = t.status || "UNKNOWN";
    pdtStatusCounts[s] = (pdtStatusCounts[s] || 0) + 1;
  });
  console.log("PANCARAN DARAT Status breakdown:", pdtStatusCounts);
}

main().catch(console.error);
