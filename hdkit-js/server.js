// server.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { execFile } = require("child_process");
const ngrok = require("ngrok");

const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";

const HDKIT_PATH = path.join(__dirname, "hdkit.js");
const API_KEY = "my-secret-key"; // server-side secret

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve main HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// HDKit /run endpoint
app.post("/run", (req, res) => {
  //const token = req.headers["x-api-key"];
 // if (token !== API_KEY) return res.status(403).json({ error: "Forbidden" });
  const { dt1, lat1, lon1, dt2, lat2, lon2 } = req.body;
  if (!dt1 || !lat1 || !lon1 || !dt2 || !lat2 || !lon2) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
console.log("Received parameters:", { dt1, lat1, lon1, dt2, lat2, lon2 });

  const args = ["pair", dt1, lat1, lon1, dt2, lat2, lon2, "--pretty"];

  execFile("node", [HDKIT_PATH, ...args], { maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
    if (err) {
      console.error("hdkit error:", err);
      return res.status(500).json({ error: "hdkit execution failed", details: stderr || err.message });
    }

    try {
      const braceStart = stdout.lastIndexOf("{");
      const braceEnd = stdout.lastIndexOf("}");
      const raw = stdout.slice(braceStart, braceEnd + 1).trim();
      const fixed = raw.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/'/g, '"');
      const parsed = JSON.parse(fixed);
      res.json(parsed);
    } catch (ex) {
      console.error("JSON parse error:", ex);
      res.status(500).json({ error: "Failed to parse hdkit output", raw: stdout });
    }
  });
});

// Start server + ngrok
app.listen(PORT, HOST, async () => {
  console.log(`🚀 Local server running at http://${HOST}:${PORT}`);

  try {
    // Kill old tunnels if any
    await ngrok.kill();
    console.log("✅ Old ngrok tunnels terminated");

    const url = await ngrok.connect({ addr: PORT });
    console.log(`🌍 Public URL: ${url}`);
    console.log(`📦 Use the x-api-key header "${API_KEY}" when calling /run from the internet`);
  } catch (err) {
    console.error("❌ Failed to start ngrok:", err);
  }
});
