#!/usr/bin/env node
const { runSingle } = require('./lib/commands/single');
const { runPair } = require('./lib/commands/pair');
const {
  analyzeConnections,
  fireScore,
  peaceScore,
  growthScore,
  stability,
  areMeditative,
  diversity
} = require('./algorithm');

async function main(argv) {
  const start = process.hrtime.bigint();

  const args = argv.slice(2);
  if (args.length === 0) {
    console.log(JSON.stringify({ error: 'Usage: hdkit single <datetime> <lat> <lon>' }));
    return 1;
  }

  const cmd = args[0];
  const jsonIdx = args.indexOf('--json');
  if (jsonIdx !== -1) args.splice(jsonIdx, 1);
  const saveIdx = args.indexOf('--save');
  const outIdx = args.indexOf('--out');
  const prettyIdx = args.indexOf('--pretty');
  const save = saveIdx !== -1;
  const pretty = prettyIdx !== -1;
  let outPath = null;
  if (outIdx !== -1 && args.length > outIdx + 1) {
    outPath = args[outIdx + 1];
    args.splice(outIdx, 2);
  }
  if (save) args.splice(saveIdx, 1);
  if (pretty) args.splice(prettyIdx, 1);

  try {
    let parsed;

    // 🔹 SINGLE MODE
    if (cmd === 'single') {
      parsed = await runSingle(args, { json: true });

    // 🔹 PAIR MODE
    } else if (cmd === 'pair') {
      parsed = await runPair(args, { json: true });
      const result2 = await analyzeConnections(parsed);
      parsed._results = result2;

      parsed.score = {
        fireScore: fireScore(result2),
        peaceScore: peaceScore(result2),
        growthScore: growthScore(result2),
        diversityS: diversity(result2),
        stability: stability(result2),
        areMeditative: areMeditative(result2)
      };
      //console.log(parsed.score);
      //console.log(parsed._results.mergedCenters.activeCenters);
     // console.log(parsed);
      console.log(JSON.stringify(parsed));
    // 🔹 PAIR-TIME MODE — Iterate across 7 years
    } else if (cmd === 'pair-time') {
      const [command, date1, lat1, lon1, date2Initial, lat2, lon2] = args;

      const yearMatch = date2Initial.match(/^(\d{4})-/);
      const timeMatch = date2Initial.match(/T(\d{2}:\d{2})/);
      if (!yearMatch) {
        console.log(JSON.stringify({ error: 'Second datetime must include a year (e.g., 1993-04-25T13:10)' }));
        return 1;
      }

      const baseYear = parseInt(yearMatch[1]);
      const baseTime = timeMatch ? timeMatch[1] : '12:00';
      const numYears = 4;

      const results = [];
      console.log(`🌀 Running multi-year pair-time analysis for ${numYears} years starting from ${baseYear}...`);

      for (let y = 0; y < numYears; y++) {
        const year = baseYear + y;
        const isLeap = new Date(year, 1, 29).getDate() === 29;
        const totalDays = isLeap ? 366 : 365;

        for (let day = 1; day <= totalDays; day++) {
          const d = new Date(Date.UTC(year, 0, day));
          const month = String(d.getUTCMonth() + 1).padStart(2, '0');
          const dayStr = String(d.getUTCDate()).padStart(2, '0');
          const date2 = `${year}-${month}-${dayStr}T${baseTime}`;
          console.log(`Processing date: ${date2} ...`);
          args[4] = date2;
          args[0] = 'pair';

          const parsedPair = await runPair(args, { json: true });
          const result2 = await analyzeConnections(parsedPair);

          const fireS = fireScore(result2);
          const peaceS = peaceScore(result2);
          const growthS = growthScore(result2);
          const stabilityS = stability(result2);
          const meditateS = areMeditative(result2);
          const diversityS = diversity(result2);

          results.push({
            date: date2,
            score: {
              fire: fireS,
              peace: peaceS,
              growth: growthS,
              stability: stabilityS,
              meditate: meditateS,
              diversity: diversityS,
            },
          });

          if (day % 50 === 0 || (day === totalDays && y === numYears - 1)) {
            console.log(`  ...processed ${day}/${totalDays} days of ${year}`);
          }
        }
      }

      const summary = {
        _meta: { baseYear, numYears, totalEntries: results.length },
        person1: { date: date1, lat: lat1, lon: lon1 },
        person2: { base: date2Initial, lat: lat2, lon: lon2 },
        scores: results,
      };

      const json = pretty ? JSON.stringify(summary, null, 2) : JSON.stringify(summary);
      console.log(json);

      if (save || outPath) {
        const fs = require('fs');
        const os = require('os');
        const p = require('path');
        const resultsDir = p.resolve(__dirname, 'results');
        if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fname = outPath ? outPath : p.join(resultsDir, `${timestamp}-pair-time.json`);
        fs.writeFileSync(fname, json + os.EOL, 'utf8');
        console.log(JSON.stringify({ saved: fname }));
      }

    } else {
      console.log(JSON.stringify({ error: 'Only `single`, `pair`, and `pair-time` are supported' }));
      return 1;
    }

    const end = process.hrtime.bigint();
    const elapsedSec = Number(end - start) / 1e9;
    if (parsed) parsed._meta = { elapsed_seconds: +elapsedSec.toFixed(3) };
    return 0;

  } catch (ex) {
    const end = process.hrtime.bigint();
    const elapsedSec = Number(end - start) / 1e9;
    const payload = {
      error: ex && ex.message ? ex.message : String(ex),
      elapsed_seconds: +elapsedSec.toFixed(3),
    };
    if (ex && ex.stderr) payload.stderr = ex.stderr;
    console.log(JSON.stringify(payload));
    return 1;
  }
}

if (require.main === module) {
  main(process.argv).then(code => process.exit(code));
}

module.exports = { main };
