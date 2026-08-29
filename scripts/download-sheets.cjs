const fs = require("fs");
const https = require("https");

const SPREADSHEET_ID = "1pavvP7EtzMvHiIhCP5X_aoTVP5nLkV03Vw_IV0iQkxU";

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log("Downloading pooling...");
  await download(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=1444994189`, "pooling.csv");
  console.log("Pooling saved! Size:", fs.statSync("pooling.csv").size);

  console.log("Downloading executed...");
  await download(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=714297382`, "executed.csv");
  console.log("Executed saved! Size:", fs.statSync("executed.csv").size);
}

run().catch(console.error);
