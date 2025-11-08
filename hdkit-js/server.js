// server.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { execFile } = require("child_process");

const app = express();
const PORT = 3000;
const HDKIT_PATH = path.join(__dirname, "hdkit.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, "public")));

// API endpoint for running hdkit
app.post("/run", (req, res) => {
  const { dt1, lat1, lon1, dt2, lat2, lon2 } = req.body;
  if (!dt1 || !lat1 || !lon1 || !dt2 || !lat2 || !lon2) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const args = ["pair", dt1, lat1, lon1, dt2, lat2, lon2, "--pretty"];

  const child = execFile("node", [HDKIT_PATH, ...args], { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
    if (err) {
      console.error("hdkit error:", err);
      return res.status(500).json({ error: "hdkit execution failed", details: stderr || err.message });
    }

    try {
      // Find last { ... } block
      const braceStart = stdout.lastIndexOf("{");
      const braceEnd = stdout.lastIndexOf("}");
      const raw = stdout.slice(braceStart, braceEnd + 1).trim();

      // Convert to JSON
      const fixed = raw
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/'/g, '"');

      const parsed = JSON.parse(fixed);
      res.json(parsed);
    } catch (ex) {
      console.error("JSON parse error:", ex);
      res.status(500).json({ error: "Failed to parse hdkit output", raw: stdout });
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🖥  Open http://localhost:${PORT}/ in your browser`);
});
